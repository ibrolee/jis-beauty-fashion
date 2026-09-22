"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  brands,
  categories,
  contactMessages,
  coupons,
  orderItems,
  orders,
  payments,
  products,
  productVariants,
  reviews,
  siteSettings,
  type OrderStatus,
  type PaymentStatus,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { ORDER_STATUSES } from "@/lib/constants";
import { getBlogContent, saveBlogContent } from "@/lib/data/blog";
import { refreshProductRating } from "@/lib/data/reviews";
import { cancelOrderAndRelease } from "@/lib/orders/reservations";
import { slugify } from "@/lib/utils";
import { categorySchema, couponSchema, fieldErrorsFrom, formToObject, productSchema } from "@/lib/validation";
import type { ActionState } from "@/types";

/* -------------------------------------------------------------------------- */
/*                                  Products                                  */
/* -------------------------------------------------------------------------- */

function parseImages(raw: string | undefined): string[] {
  // Product and option photos are uploaded via /api/admin/upload and saved as URLs.
  return (raw ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type VariantInput = {
  id: number | null;
  name: string;
  sku: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  images: string[];
  sortOrder: number;
};

function parseVariants(raw: string | undefined): VariantInput[] {
  if (!raw?.trim()) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || data.length > 40) throw new Error("Add at most 40 variants.");
  const result: VariantInput[] = data.map((entry: unknown, index) => {
    if (!entry || typeof entry !== "object") throw new Error(`Variant ${index + 1} is invalid.`);
    const v = entry as Record<string, unknown>;
    const name = typeof v.name === "string" ? v.name.trim() : "";
    const sku = typeof v.sku === "string" ? v.sku.trim() : "";
    const id = v.id === null || v.id === undefined ? null : Number(v.id);
    const price = Number(v.price);
    const salePrice = v.salePrice === "" || v.salePrice === null || v.salePrice === undefined ? null : Number(v.salePrice);
    const stock = Number(v.stock);
    const images = v.images;
    if (!name || name.length > 80 || !Number.isInteger(price) || price <= 0 || !Number.isInteger(stock) || stock < 0 ||
      (salePrice !== null && (!Number.isInteger(salePrice) || salePrice < 0 || salePrice >= price)) ||
      (id !== null && (!Number.isSafeInteger(id) || id <= 0)) || sku.length > 60 ||
      !Array.isArray(images) || images.length > 12 || !images.every((u) => typeof u === "string" && u.length <= 2048 && (/^https:\/\//.test(u) || (u.startsWith("/images/") || u.startsWith("/catalog/"))))) {
      throw new Error(`Check name, price, sale price, stock and photos for variant ${index + 1}.`);
    }
    return { id, name, sku: sku || null, price, salePrice, stock, images: images as string[], sortOrder: index };
  });
  const ids = result.map((v) => v.id).filter((id): id is number => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error("A variant was submitted twice.");
  const names = result.map((v) => v.name.toLocaleLowerCase());
  if (new Set(names).size !== names.length) throw new Error("Give each option a different name (for example, Merlot · 100ml).");
  return result;
}

async function resolveBrandId(name: string | undefined): Promise<number | null> {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const slug = slugify(trimmed);
  const [row] = await db
    .insert(brands)
    .values({ name: trimmed, slug })
    .onConflictDoUpdate({ target: brands.slug, set: { name: trimmed } })
    .returning({ id: brands.id });
  return row.id;
}

export async function saveProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const parsed = productSchema.safeParse(formToObject(formData, ["isFeatured", "isBestSeller", "isNewArrival", "isActive"]));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  const brandId = await resolveBrandId(d.brandName);
  const existingSku = id ? await db.select({ sku: products.sku }).from(products).where(eq(products.id, id)).limit(1) : [];
  const sku = d.sku?.trim() || existingSku[0]?.sku ||
    `JIS-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const images = parseImages(d.images);
  let variants: VariantInput[];
  try {
    variants = parseVariants(d.variantsJson);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invalid variants.", fieldErrors: { variantsJson: "Please check your variants." } };
  }

  const values = {
    name: d.name,
    slug,
    sku,
    categoryId: d.categoryId,
    brandId,
    shortDescription: d.shortDescription || null,
    description: d.description,
    price: d.price,
    salePrice: d.salePrice && d.salePrice > 0 ? d.salePrice : null,
    stock: variants.length ? variants.reduce((sum, v) => sum + v.stock, 0) : d.stock,
    images: images.length ? images : variants.find((v) => v.images.length > 0)?.images ?? [],
    gender: d.gender,
    fragranceType: d.fragranceType || null,
    volume: d.volume || null,
    
    longevity: d.longevity || null,
    occasion: d.occasion || null,
    isFeatured: Boolean(d.isFeatured),
    isBestSeller: Boolean(d.isBestSeller),
    isNewArrival: Boolean(d.isNewArrival),
    isActive: d.isActive !== false,
    metaTitle: d.metaTitle || null,
    metaDescription: d.metaDescription || null,
    updatedAt: new Date(),
  };

  try {
    await db.transaction(async (tx) => {
      let productId = id;
      if (productId) {
        const [found] = await tx.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
        if (!found) throw new Error("Product no longer exists.");
        await tx.update(products).set(values).where(eq(products.id, productId));
      } else {
        const [row] = await tx.insert(products).values(values).returning({ id: products.id });
        productId = row.id;
      }
      // Keep old variant rows (and IDs referenced by historic orders) rather than deleting them.
      const existing = await tx.select().from(productVariants).where(eq(productVariants.productId, productId));
      const existingById = new Map(existing.map((v) => [v.id, v]));
      for (const variant of variants) {
        const { id: variantId, ...details } = variant;
        if (variantId !== null) {
          if (!existingById.has(variantId)) throw new Error("A variant does not belong to this product.");
          await tx.update(productVariants).set({ ...details, isActive: true }).where(eq(productVariants.id, variantId));
        } else {
          await tx.insert(productVariants).values({ ...details, productId: productId as number });
        }
      }
      const submittedIds = new Set(variants.map((v) => v.id));
      for (const old of existing) {
        if (!submittedIds.has(old.id)) {
          await tx.update(productVariants).set({ isActive: false, stock: 0 }).where(eq(productVariants.id, old.id));
        }
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("products_slug_idx")) return { error: "A product with this slug already exists.", fieldErrors: { slug: "Already in use" } };
    if (message.includes("products_sku_idx")) return { error: "A product with this SKU already exists.", fieldErrors: { sku: "Already in use" } };
    console.error(error);
    return { error: "Could not save the product. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/", "layout");
}

export async function toggleProductActiveAction(id: number, isActive: boolean): Promise<void> {
  await requireAdmin();
  await db.update(products).set({ isActive, updatedAt: new Date() }).where(eq(products.id, id));
  revalidatePath("/", "layout");
}

/* -------------------------------------------------------------------------- */
/*                                   Orders                                   */
/* -------------------------------------------------------------------------- */

export async function updateOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  const status = String(formData.get("status")) as OrderStatus;
  const paymentStatus = String(formData.get("paymentStatus")) as PaymentStatus;
  const adminNotes = String(formData.get("adminNotes") ?? "").trim() || null;

  if (!ORDER_STATUSES.includes(status)) return { error: "Invalid order status." };
  if (!["pending", "paid", "failed", "refunded"].includes(paymentStatus)) return { error: "Invalid payment status." };

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
if (!order) return { error: "Order not found." };
const originalStatus = String(formData.get("originalStatus") ?? "");
const originalPaymentStatus = String(formData.get("originalPaymentStatus") ?? "");
if (order.status !== originalStatus || order.paymentStatus !== originalPaymentStatus) {
  return { error: "This order changed since you opened it. Refresh the page before saving." };
}

if (status === "cancelled" && order.status !== "cancelled") {
  const cancelled = await cancelOrderAndRelease(orderId, { paymentStatus, adminNotes });
  if (!cancelled) return { error: "Order already cancelled or updated. Refresh before saving." };
} else {
  if (order.status === "cancelled" && status !== "cancelled") {
    return { error: "A cancelled order cannot be reopened because its stock has been released. Create a new order after checking inventory." };
  }
  const nextStatus = status === "pending" && paymentStatus === "paid" ? "payment_confirmed" : status;
  const updated = await db.transaction(async (tx) => {
    const [changed] = await tx.update(orders)
      .set({ status: nextStatus, paymentStatus, adminNotes, updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.status, order.status), eq(orders.paymentStatus, order.paymentStatus)))
      .returning({ id: orders.id });
    if (!changed) return false;
    if (paymentStatus !== order.paymentStatus) {
      const latest = await tx.query.payments.findFirst({ where: eq(payments.orderId, orderId), orderBy: [desc(payments.createdAt)] });
      if (latest) await tx.update(payments).set({
        status: paymentStatus,
        paidAt: paymentStatus === "paid" ? new Date() : latest.paidAt,
        updatedAt: new Date(),
      }).where(eq(payments.id, latest.id));
    }
    return true;
  });
  if (!updated) return { error: "This order changed while saving. Refresh and review its payment status." };
}

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/order/${order.orderNumber}`);
  revalidatePath("/account/orders");
  return { ok: true, message: "Order updated." };
}

/* -------------------------------------------------------------------------- */
/*                                  Coupons                                   */
/* -------------------------------------------------------------------------- */

export async function saveCouponAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const parsed = couponSchema.safeParse(formToObject(formData, ["isActive"]));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const d = parsed.data;
  const values = {
    code: d.code,
    type: d.type,
    value: d.value,
    minOrderAmount: d.minOrderAmount,
    maxDiscount: d.maxDiscount && d.maxDiscount > 0 ? d.maxDiscount : null,
    expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    usageLimit: d.usageLimit && d.usageLimit > 0 ? d.usageLimit : null,
    isActive: d.isActive !== false,
    description: d.description || null,
  };

  try {
    if (id) await db.update(coupons).set(values).where(eq(coupons.id, id));
    else await db.insert(coupons).values(values);
  } catch {
    return { error: "A coupon with this code already exists.", fieldErrors: { code: "Already in use" } };
  }
  revalidatePath("/admin/coupons");
  return { ok: true, message: id ? "Coupon updated." : "Coupon created." };
}

export async function deleteCouponAction(id: number): Promise<void> {
  await requireAdmin();
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function toggleCouponAction(id: number, isActive: boolean): Promise<void> {
  await requireAdmin();
  await db.update(coupons).set({ isActive }).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

/* -------------------------------------------------------------------------- */
/*                                 Categories                                 */
/* -------------------------------------------------------------------------- */

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const parsed = categorySchema.safeParse(formToObject(formData, ["isActive"]));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const d = parsed.data;
  const values = {
    name: d.name,
    slug: slugify(d.slug || d.name),
    description: d.description || null,
    image: d.image || null,
    sortOrder: d.sortOrder,
    isActive: d.isActive !== false,
  };
  try {
    if (id) await db.update(categories).set(values).where(eq(categories.id, id));
    else await db.insert(categories).values(values);
  } catch {
    return { error: "A category with this slug already exists." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Category updated." : "Category created." };
}

export async function deleteCategoryAction(id: number): Promise<ActionState> {
  await requireAdmin();
  const inUse = await db.query.products.findFirst({ where: eq(products.categoryId, id) });
  if (inUse) return { error: "Move or delete the products in this category first." };
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/", "layout");
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/*                                  Reviews                                   */
/* -------------------------------------------------------------------------- */

export async function setReviewStatusAction(id: number, status: "published" | "hidden"): Promise<void> {
  await requireAdmin();
  const [row] = await db.update(reviews).set({ status }).where(eq(reviews.id, id)).returning({ productId: reviews.productId });
  if (row) await refreshProductRating(row.productId);
  revalidatePath("/admin/reviews");
}

export async function deleteReviewAction(id: number): Promise<void> {
  await requireAdmin();
  const [row] = await db.delete(reviews).where(eq(reviews.id, id)).returning({ productId: reviews.productId });
  if (row) await refreshProductRating(row.productId);
  revalidatePath("/admin/reviews");
}

/* -------------------------------------------------------------------------- */
/*                             Site content / misc                            */
/* -------------------------------------------------------------------------- */

export async function saveSiteContentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const key = String(formData.get("key"));
  if (!["announcement", "hero", "promo", "business", "delivery", "blog"].includes(key)) return { error: "Unknown content section." };

  const value: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k === "key" || typeof v !== "string") continue;
    value[k] = v;
  }
  if (key === "announcement") value.enabled = formData.get("enabled") === "on";
  if (key === "delivery") {
    for (const field of ["freeDeliveryThreshold", "interstateFreeDeliveryThreshold", "lagosFee", "regionalFee", "defaultFee"]) {
      value[field] = Math.max(0, Number(formData.get(field)) || 0);
    }
    value.regionalStates = String(formData.get("regionalStates") ?? "")
      .split(",")
      .map((state) => state.trim())
      .filter(Boolean);
  }

  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Content saved." };
}

export async function markContactReadAction(id: number): Promise<void> {
  await requireAdmin();
  await db.update(contactMessages).set({ isRead: true }).where(and(eq(contactMessages.id, id), eq(contactMessages.isRead, false)));
  revalidatePath("/admin/messages");
}

/* -------------------------------------------------------------------------- */
/*                                    Blog                                    */
/* -------------------------------------------------------------------------- */

export async function saveBlogPostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const now = new Date().toISOString();
  const id = String(formData.get("id") ?? "").trim() || crypto.randomUUID();
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || title);
  const category = String(formData.get("category") ?? "").trim() || "Fragrance Tips";
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!title || !slug || !excerpt || !body) return { error: "Title, slug, excerpt and body are required." };

  const blog = await getBlogContent();
  const existing = blog.posts.find((post) => post.id === id);
  const duplicate = blog.posts.find((post) => post.slug === slug && post.id !== id);
  if (duplicate) return { error: "Another blog post already uses this slug." };

  const post = {
    id,
    title,
    slug,
    category,
    excerpt,
    body,
    image,
    published,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const posts = existing ? blog.posts.map((item) => item.id === id ? post : item) : [post, ...blog.posts];
  const categories = Array.from(new Set([category, ...blog.categories.map((item) => item.trim()).filter(Boolean)]));
  await saveBlogContent({ ...blog, categories, posts });
  revalidatePath("/blog", "layout");
  revalidatePath("/admin/blog");
  return { ok: true, message: existing ? "Blog post updated." : "Blog post created." };
}

export async function deleteBlogPostAction(id: string): Promise<void> {
  await requireAdmin();
  const blog = await getBlogContent();
  const deleted = blog.posts.find((post) => post.id === id);
  await saveBlogContent({
    ...blog,
    posts: blog.posts.filter((post) => post.id !== id),
    comments: blog.comments.filter((comment) => comment.postSlug !== deleted?.slug),
    likes: Object.fromEntries(Object.entries(blog.likes).filter(([slug]) => slug !== deleted?.slug)),
  });
  revalidatePath("/blog", "layout");
  revalidatePath("/admin/blog");
}

/** Helper for the admin dashboard: sales for the last 30 days grouped by day. */
export async function getDailySales() {
  await requireAdmin();
  return db
    .select({ day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`, total: sql<number>`coalesce(sum(${orders.total}), 0)`, count: sql<number>`count(*)` })
    .from(orders)
    .where(sql`${orders.createdAt} >= now() - interval '30 days'`)
    .groupBy(sql`1`)
    .orderBy(sql`1`);
}

export type OrderItemRow = typeof orderItems.$inferSelect;

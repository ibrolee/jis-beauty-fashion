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
import { refreshProductRating } from "@/lib/data/reviews";
import { slugify } from "@/lib/utils";
import { categorySchema, couponSchema, fieldErrorsFrom, formToObject, productSchema } from "@/lib/validation";
import type { ActionState } from "@/types";

/* -------------------------------------------------------------------------- */
/*                                  Products                                  */
/* -------------------------------------------------------------------------- */

function parseImages(raw: string | undefined): string[] {
  // INTEGRATION POINT: swap this for uploaded file URLs once storage
  // (Cloudinary / S3 / UploadThing) is connected — see src/lib/storage.ts.
  return (raw ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseVariants(raw: string | undefined) {
  return (raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name, price, salePrice, stock] = line.split("|").map((s) => s.trim());
      return {
        name,
        price: Number(price) || 0,
        salePrice: salePrice ? Number(salePrice) || null : null,
        stock: Number(stock) || 0,
        sortOrder: index,
      };
    })
    .filter((v) => v.name && v.price > 0);
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

const sku =
  d.sku?.trim() ||
  `JIS-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomUUID()
    .slice(0, 6)
    .toUpperCase()}`;
  const images = parseImages(d.images);
  const variants = parseVariants(d.variants);

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
    stock: d.stock,
    images,
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
        await tx.update(products).set(values).where(eq(products.id, productId));
      } else {
        const [row] = await tx.insert(products).values(values).returning({ id: products.id });
        productId = row.id;
      }
      await tx.delete(productVariants).where(eq(productVariants.productId, productId));
      if (variants.length) {
        await tx.insert(productVariants).values(variants.map((v) => ({ ...v, productId: productId as number })));
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

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { items: true } });
  if (!order) return { error: "Order not found." };

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status, paymentStatus, adminNotes, updatedAt: new Date() }).where(eq(orders.id, orderId));

    // Restore reserved stock when an order is cancelled.
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        if (item.productId) {
          await tx.update(products).set({ stock: sql`${products.stock} + ${item.quantity}` }).where(eq(products.id, item.productId));
        }
        if (item.variantId) {
          await tx.update(productVariants).set({ stock: sql`${productVariants.stock} + ${item.quantity}` }).where(eq(productVariants.id, item.variantId));
        }
      }
    }

    // Keep the latest payment record in sync with a manual confirmation.
    if (paymentStatus !== order.paymentStatus) {
      const latest = await tx.query.payments.findFirst({ where: eq(payments.orderId, orderId), orderBy: [desc(payments.createdAt)] });
      if (latest) {
        await tx
          .update(payments)
          .set({ status: paymentStatus, paidAt: paymentStatus === "paid" ? new Date() : latest.paidAt, updatedAt: new Date() })
          .where(eq(payments.id, latest.id));
      }
    }
  });

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
  if (!["announcement", "hero", "promo"].includes(key)) return { error: "Unknown content section." };

  const value: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k === "key" || typeof v !== "string") continue;
    value[k] = v;
  }
  if (key === "announcement") value.enabled = formData.get("enabled") === "on";

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

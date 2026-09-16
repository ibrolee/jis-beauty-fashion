/**
 * Seeds the database with demo data (categories, brands, products, variants,
 * reviews, coupons, an admin user and demo customers).
 *
 * Run manually with:   npm run db:seed
 * It is also invoked automatically on first request when the products table is
 * empty (see src/db/ensure-seed.ts) so preview environments look complete.
 */
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  brands,
  categories,
  coupons,
  productVariants,
  products,
  reviews,
  siteSettings,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { slugify } from "@/lib/utils";
import { DEFAULT_SITE_CONTENT } from "@/lib/site-content";
import {
  seedBrands,
  seedCategories,
  seedCustomers,
  seedProducts,
  seedReviewPool,
} from "./seed-data/catalog";

export async function seedDatabase(options: { force?: boolean } = {}) {
  const [{ value: existing }] = await db.select({ value: count() }).from(products);
  if (existing > 0 && !options.force) {
    console.log(`Seed skipped — ${existing} products already exist.`);
    return;
  }

  console.log("Seeding JIS Beauty & Fashion demo data…");

  /* ---------------------------- Users (admin + demo) --------------------------- */
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set before seeding.");
}

  await db
    .insert(users)
    .values({
      email: adminEmail.toLowerCase(),
      passwordHash: await hashPassword(adminPassword),
      firstName: "JIS",
      lastName: "Admin",
      phone: "09042336294",
      role: "admin",
    })
    .onConflictDoNothing();

  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD;

if (!customerPassword) {
  throw new Error("SEED_CUSTOMER_PASSWORD must be set before seeding.");
}

const customerPasswordHash = await hashPassword(customerPassword);
  const customerIds: number[] = [];
  for (const c of seedCustomers) {
    const [row] = await db
      .insert(users)
      .values({ ...c, email: c.email.toLowerCase(), passwordHash: customerPasswordHash, role: "customer" })
      .onConflictDoNothing()
      .returning({ id: users.id });
    if (row) customerIds.push(row.id);
    else {
      const [found] = await db.select({ id: users.id }).from(users).where(eq(users.email, c.email.toLowerCase()));
      if (found) customerIds.push(found.id);
    }
  }

  /* -------------------------------- Categories -------------------------------- */
  const categoryIdBySlug = new Map<string, number>();
  for (const c of seedCategories) {
    const [row] = await db
      .insert(categories)
      .values(c)
      .onConflictDoUpdate({ target: categories.slug, set: { name: c.name, description: c.description, image: c.image, sortOrder: c.sortOrder } })
      .returning({ id: categories.id });
    categoryIdBySlug.set(c.slug, row.id);
  }

  /* ---------------------------------- Brands ---------------------------------- */
  const brandIdByName = new Map<string, number>();
  for (const name of seedBrands) {
    const [row] = await db
      .insert(brands)
      .values({ name, slug: slugify(name) })
      .onConflictDoUpdate({ target: brands.slug, set: { name } })
      .returning({ id: brands.id });
    brandIdByName.set(name, row.id);
  }

  /* --------------------------------- Products --------------------------------- */
  let skuCounter = 1000;
  const now = Date.now();
  for (const [index, p] of seedProducts.entries()) {
    const categoryId = categoryIdBySlug.get(p.category);
    if (!categoryId) throw new Error(`Unknown category slug: ${p.category}`);
    skuCounter += 1;

    // Spread creation dates over the past 90 days so "Newest" sorting is meaningful.
    const createdAt = new Date(now - (seedProducts.length - index) * 2 * 24 * 60 * 60 * 1000);

    const [product] = await db
      .insert(products)
      .values({
        name: p.name,
        slug: slugify(p.name),
        sku: `JIS-${p.category.slice(0, 3).toUpperCase()}-${skuCounter}`,
        categoryId,
        brandId: brandIdByName.get(p.brand) ?? null,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        images: p.images,
        gender: p.gender,
        fragranceType: p.fragranceType,
        volume: p.volume,
        topNotes: p.topNotes,
        heartNotes: p.heartNotes,
        baseNotes: p.baseNotes,
        longevity: p.longevity,
        occasion: p.occasion,
        isFeatured: p.isFeatured ?? false,
        isBestSeller: p.isBestSeller ?? false,
        isNewArrival: p.isNewArrival ?? false,
        salesCount: p.isBestSeller ? 120 + index * 3 : 10 + ((index * 7) % 40),
        metaTitle: `${p.name} by ${p.brand} — ${p.volume} ${p.fragranceType}`,
        metaDescription: p.shortDescription,
        createdAt,
        updatedAt: createdAt,
      })
      .onConflictDoNothing()
      .returning({ id: products.id });

    if (!product) continue;

    if (p.variants?.length) {
      await db.insert(productVariants).values(
        p.variants.map((v, i) => ({
          productId: product.id,
          name: v.name,
          sku: `JIS-${p.category.slice(0, 3).toUpperCase()}-${skuCounter}-${v.name.toUpperCase()}`,
          price: v.price,
          salePrice: v.salePrice ?? null,
          stock: v.stock,
          sortOrder: i,
        })),
      );
    }

    /* Deterministic reviews: 1–4 per product from the pool */
    if (customerIds.length) {
      const reviewCount = 1 + ((index * 5) % 4);
      let total = 0;
      const rows = [];
      for (let r = 0; r < reviewCount; r++) {
        const template = seedReviewPool[(index + r * 3) % seedReviewPool.length];
        total += template.rating;
        rows.push({
          productId: product.id,
          userId: customerIds[(index + r) % customerIds.length],
          rating: template.rating,
          title: template.title,
          comment: template.comment,
          createdAt: new Date(createdAt.getTime() + (r + 1) * 3 * 24 * 60 * 60 * 1000),
        });
      }
      await db.insert(reviews).values(rows);
      await db
        .update(products)
        .set({ rating: Math.round((total / reviewCount) * 10) / 10, reviewCount })
        .where(eq(products.id, product.id));
    }
  }

  /* ---------------------------------- Coupons --------------------------------- */
  await db
    .insert(coupons)
    .values([
      {
        code: "JISWELCOME",
        type: "percentage",
        value: 5,
        minOrderAmount: 0,
        maxDiscount: null,
        expiresAt: null,
        usageLimit: null,
        isActive: true,
        description: "5% off your first JIS order",
      },
      {
        code: "LAGOS10",
        type: "percentage",
        value: 10,
        minOrderAmount: 30000,
        maxDiscount: 5000,
        expiresAt: new Date(now + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        isActive: true,
        description: "10% off orders above ₦30,000 (max ₦5,000)",
      },
    ])
    .onConflictDoNothing();

  /* ------------------------------- Site content ------------------------------- */
  for (const [key, value] of Object.entries(DEFAULT_SITE_CONTENT)) {
    await db
      .insert(siteSettings)
      .values({ key, value: value as Record<string, unknown> })
      .onConflictDoNothing();
  }

  console.log("✓ Seed complete.");
}

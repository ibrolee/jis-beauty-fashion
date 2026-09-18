import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  lt,
  lte,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/ensure-seed";
import { brands, categories, productVariants, products, type ProductVariant } from "@/db/schema";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { BrandWithCount, PaginatedProducts, ProductDetail, ProductFilters, ProductListItem } from "@/types";

/** SQL for the price actually charged (sale price when it is a real discount). */
export const effectivePriceSql = sql<number>`CASE WHEN ${products.salePrice} IS NOT NULL AND ${products.salePrice} > 0 AND ${products.salePrice} < ${products.price} THEN ${products.salePrice} ELSE ${products.price} END`;

const listColumns = {
  ...getTableColumns(products),
  categoryName: categories.name,
  categorySlug: categories.slug,
  brandName: brands.name,
  hasVariants: sql<boolean>`exists(select 1 from ${productVariants} where ${productVariants.productId} = ${products.id} and ${productVariants.isActive} = true)`,
};

function baseQuery() {
  return db
    .select(listColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id));
}

function buildConditions(filters: ProductFilters): SQL[] {
  const conds: SQL[] = [eq(products.isActive, true)];

  if (filters.q) {
    const term = `%${filters.q.trim()}%`;
    conds.push(
      or(
        ilike(products.name, term),
        ilike(products.description, term),
        ilike(products.shortDescription, term),
        ilike(products.topNotes, term),
        ilike(products.heartNotes, term),
        ilike(products.baseNotes, term),
        ilike(products.fragranceType, term),
        ilike(brands.name, term),
        ilike(categories.name, term),
      ) as SQL,
    );
  }
  if (filters.category) conds.push(eq(categories.slug, filters.category));
  if (filters.gender?.length) {
    conds.push(inArray(products.gender, filters.gender as ("women" | "men" | "unisex" | "kids")[]));
  }
  if (filters.brand?.length) conds.push(inArray(brands.slug, filters.brand));
  if (filters.minPrice !== undefined) conds.push(gte(effectivePriceSql, filters.minPrice));
  if (filters.maxPrice !== undefined) conds.push(lte(effectivePriceSql, filters.maxPrice));
  if (filters.inStock) conds.push(gt(products.stock, 0));
  if (filters.minRating) conds.push(gte(products.rating, filters.minRating));
  if (filters.newArrivals) conds.push(eq(products.isNewArrival, true));
  if (filters.bestSellers) conds.push(eq(products.isBestSeller, true));
  if (filters.onSale) conds.push(and(isNotNull(products.salePrice), lt(products.salePrice, products.price)) as SQL);

  return conds;
}

function orderFor(sort: string | undefined): SQL[] {
  switch (sort) {
    case "newest":
      return [desc(products.createdAt)];
    case "price-asc":
      return [asc(effectivePriceSql), asc(products.id)];
    case "price-desc":
      return [desc(effectivePriceSql), asc(products.id)];
    case "best-selling":
      return [desc(products.salesCount), desc(products.rating)];
    case "rating":
      return [desc(products.rating), desc(products.reviewCount)];
    case "featured":
    default:
      return [desc(products.isFeatured), desc(products.isBestSeller), desc(products.createdAt)];
  }
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
  await ensureSeeded();
  const perPage = filters.perPage ?? PRODUCTS_PER_PAGE;
  const page = Math.max(1, filters.page ?? 1);
  const conds = buildConditions(filters);

  const [items, [{ value: total }]] = await Promise.all([
    baseQuery()
      .where(and(...conds))
      .orderBy(...orderFor(filters.sort))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ value: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(...conds)),
  ]);

  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  await ensureSeeded();
  const [product] = await baseQuery().where(eq(products.slug, slug)).limit(1);
  if (!product) return null;
  const variants = await getVariantsForProduct(product.id);
  return { ...product, variants };
}

export async function getProductById(id: number): Promise<ProductDetail | null> {
  const [product] = await baseQuery().where(eq(products.id, id)).limit(1);
  if (!product) return null;
  const variants = await getVariantsForProduct(product.id);
  return { ...product, variants };
}

export async function getVariantsForProduct(productId: number): Promise<ProductVariant[]> {
  return db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.productId, productId), eq(productVariants.isActive, true)))
    .orderBy(asc(productVariants.sortOrder), asc(productVariants.id));
}

export async function getRelatedProducts(product: ProductListItem, limit = 4): Promise<ProductListItem[]> {
  return baseQuery()
    .where(and(eq(products.isActive, true), eq(products.categoryId, product.categoryId), ne(products.id, product.id)))
    .orderBy(desc(products.isBestSeller), desc(products.rating))
    .limit(limit);
}

export async function getProductsByIds(ids: number[]): Promise<ProductListItem[]> {
  if (!ids.length) return [];
  return baseQuery().where(and(eq(products.isActive, true), inArray(products.id, ids)));
}

type Collection = "featured" | "bestSellers" | "newArrivals";

export async function getCollection(kind: Collection, limit = 8): Promise<ProductListItem[]> {
  await ensureSeeded();
  const flag = kind === "featured" ? products.isFeatured : kind === "bestSellers" ? products.isBestSeller : products.isNewArrival;
  return baseQuery()
    .where(and(eq(products.isActive, true), eq(flag, true)))
    .orderBy(desc(products.salesCount), desc(products.createdAt))
    .limit(limit);
}

export async function getProductsForCategory(slug: string, limit = 4): Promise<ProductListItem[]> {
  await ensureSeeded();
  return baseQuery()
    .where(and(eq(products.isActive, true), eq(categories.slug, slug)))
    .orderBy(desc(products.isBestSeller), desc(products.isFeatured), desc(products.salesCount))
    .limit(limit);
}

export async function getPriceBounds(): Promise<{ min: number; max: number }> {
  const [row] = await db
    .select({
      min: sql<number>`coalesce(min(${effectivePriceSql}), 0)`,
      max: sql<number>`coalesce(max(${effectivePriceSql}), 0)`,
    })
    .from(products)
    .where(eq(products.isActive, true));
  return { min: Number(row?.min ?? 0), max: Number(row?.max ?? 0) };
}

export async function getBrandsWithCounts(): Promise<BrandWithCount[]> {
  const rows = await db
    .select({ ...getTableColumns(brands), productCount: count(products.id) })
    .from(brands)
    .leftJoin(products, and(eq(products.brandId, brands.id), eq(products.isActive, true)))
    .groupBy(brands.id)
    .orderBy(asc(brands.name));
  return rows.filter((r) => r.productCount > 0);
}

/** Admin: every product regardless of active flag. */
export async function getAllProductsAdmin(q?: string): Promise<ProductListItem[]> {
  await ensureSeeded();
  const conds: SQL[] = [];
  if (q) conds.push(or(ilike(products.name, `%${q}%`), ilike(products.sku, `%${q}%`)) as SQL);
  return baseQuery()
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(products.updatedAt));
}

export async function getAllSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  await ensureSeeded();
  return db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.isActive, true));
}

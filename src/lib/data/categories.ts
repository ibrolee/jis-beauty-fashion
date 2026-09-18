import { and, asc, count, eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/ensure-seed";
import { categories, products, type Category } from "@/db/schema";
import type { CategoryWithCount } from "@/types";

/** Site-owned collection artwork. Keep this mapping authoritative: old seed/category
 * database image values must never bring the original demo stock pictures back. */
const collectionImages: Record<string, string> = {
  women: "/catalog/category-women-selected-20260918.jpg",
  men: "/catalog/category-men-selected-20260918.jpg",
  unisex: "/catalog/category-unisex-selected-20260918.jpg",
  kids: "/catalog/category-kids-selected-20260918.jpg",
  "perfume-oils": "/catalog/category-oils-selected-20260918.jpg",
  "body-sprays-deodorants": "/catalog/category-deodorants-selected-20260918.jpg",
  "gift-sets": "/catalog/category-gifts-selected-20260918.jpg",
};

function withSelectedPhoto<T extends Category>(category: T): T {
  return { ...category, image: collectionImages[category.slug] ?? category.image };
}

export async function getCategories(includeInactive = false): Promise<CategoryWithCount[]> {
  await ensureSeeded();
  const rows = await db
    .select({ ...getTableColumns(categories), productCount: count(products.id) })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.isActive, true)))
    .where(includeInactive ? undefined : eq(categories.isActive, true))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
  return rows.map(withSelectedPhoto);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  await ensureSeeded();
  const category = await db.query.categories.findFirst({ where: and(eq(categories.slug, slug), eq(categories.isActive, true)) });
  return category ? withSelectedPhoto(category) : undefined;
}

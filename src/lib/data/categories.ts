import { and, asc, count, eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/ensure-seed";
import { categories, products, type Category } from "@/db/schema";
import type { CategoryWithCount } from "@/types";

export async function getCategories(includeInactive = false): Promise<CategoryWithCount[]> {
  await ensureSeeded();
  const rows = await db
    .select({ ...getTableColumns(categories), productCount: count(products.id) })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.isActive, true)))
    .where(includeInactive ? undefined : eq(categories.isActive, true))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
  return rows;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  await ensureSeeded();
  return db.query.categories.findFirst({ where: and(eq(categories.slug, slug), eq(categories.isActive, true)) });
}
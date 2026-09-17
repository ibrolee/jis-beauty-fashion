import { and, asc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/ensure-seed";
import { categories, products, type Category } from "@/db/schema";
import type { CategoryWithCount } from "@/types";

export async function getCategories(
  includeInactive = false,
): Promise<CategoryWithCount[]> {
  await ensureSeeded();

  const rows = await db
    .select({
      ...getTableColumns(categories),

      // Count each active product once, whether this category is
      // its original primary category or an additional category.
      productCount: sql<number>`(
        SELECT COUNT(*)
        FROM products AS p
        WHERE p.is_active = TRUE
          AND (
            p.category_id = ${categories.id}
            OR EXISTS (
              SELECT 1
              FROM product_categories AS pc
              WHERE pc.product_id = p.id
                AND pc.category_id = ${categories.id}
            )
          )
      )`.mapWith(Number),
    })
    .from(categories)
    .where(includeInactive ? undefined : eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return rows;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  await ensureSeeded();

  return db.query.categories.findFirst({
    where: and(
      eq(categories.slug, slug),
      eq(categories.isActive, true),
    ),
  });
}
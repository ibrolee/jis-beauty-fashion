import { and, avg, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews, users } from "@/db/schema";
import type { ReviewWithAuthor } from "@/types";

export async function getProductReviews(productId: number): Promise<ReviewWithAuthor[]> {
  const rows = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      userId: reviews.userId,
      rating: reviews.rating,
      title: reviews.title,
      comment: reviews.comment,
      status: reviews.status,
      createdAt: reviews.createdAt,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "published")))
    .orderBy(desc(reviews.createdAt));

  return rows.map(({ firstName, lastName, ...r }) => ({
    ...r,
    authorName: `${firstName} ${lastName.charAt(0)}.`,
  }));
}

export async function hasUserReviewed(productId: number, userId: number): Promise<boolean> {
  const row = await db.query.reviews.findFirst({
    where: and(eq(reviews.productId, productId), eq(reviews.userId, userId)),
  });
  return Boolean(row);
}

/** Recomputes the denormalised rating/reviewCount on a product. */
export async function refreshProductRating(productId: number): Promise<void> {
  const [agg] = await db
    .select({ avg: avg(reviews.rating), count: count() })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "published")));
  await db
    .update(products)
    .set({ rating: Math.round(Number(agg?.avg ?? 0) * 10) / 10, reviewCount: agg?.count ?? 0 })
    .where(eq(products.id, productId));
}

export async function getAllReviewsAdmin() {
  return db.query.reviews.findMany({
    with: { user: { columns: { firstName: true, lastName: true, email: true } }, product: { columns: { name: true, slug: true } } },
    orderBy: [desc(reviews.createdAt)],
    limit: 200,
  });
}

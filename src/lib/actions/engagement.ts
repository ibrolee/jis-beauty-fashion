"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contactMessages, newsletterSubscribers, products, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { hasUserReviewed, refreshProductRating } from "@/lib/data/reviews";
import { contactSchema, fieldErrorsFrom, newsletterSchema, reviewSchema } from "@/lib/validation";
import type { ActionState } from "@/types";

export async function submitReviewAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to leave a review." };

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const product = await db.query.products.findFirst({ where: eq(products.id, parsed.data.productId) });
  if (!product) return { error: "Product not found." };
  if (await hasUserReviewed(product.id, user.id)) return { error: "You have already reviewed this product." };

  await db.insert(reviews).values({
    productId: product.id,
    userId: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title || null,
    comment: parsed.data.comment,
  });
  await refreshProductRating(product.id);
  revalidatePath(`/product/${product.slug}`);
  return { ok: true, message: "Thank you! Your review has been published." };
}

export async function subscribeNewsletterAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email address." };

  // INTEGRATION POINT: also push to Mailchimp / Klaviyo / Brevo here if desired.
  await db.insert(newsletterSubscribers).values({ email: parsed.data.email }).onConflictDoNothing();
  return { ok: true, message: "You're on the list. Welcome to JIS." };
}

export async function submitContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  await db.insert(contactMessages).values({
    ...parsed.data,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
  });
  return { ok: true, message: "Message received — we'll reply within one business day." };
}

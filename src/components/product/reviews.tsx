"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/form-fields";
import { RatingStars } from "@/components/ui/rating-stars";
import { submitReviewAction } from "@/lib/actions/engagement";
import { cn, formatDate } from "@/lib/utils";
import { initialActionState, type ReviewWithAuthor } from "@/types";

export function ReviewList({ reviews }: { reviews: ReviewWithAuthor[] }) {
  if (!reviews.length) {
    return <p className="text-sm text-stone">No reviews yet — be the first to share your experience.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {reviews.map((r) => (
        <li key={r.id} className="py-6 first:pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <RatingStars rating={r.rating} size="sm" />
            <span className="text-xs text-stone">{formatDate(r.createdAt)}</span>
          </div>
          {r.title && <h3 className="mt-2 font-medium">{r.title}</h3>}
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{r.comment}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone">{r.authorName} · Verified customer</p>
        </li>
      ))}
    </ul>
  );
}

export function ReviewForm({ productId, productSlug, canReview, alreadyReviewed }: { productId: number; productSlug: string; canReview: boolean; alreadyReviewed: boolean }) {
  const [state, action, pending] = useActionState(submitReviewAction, initialActionState);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (!canReview) {
    return (
      <p className="text-sm text-stone">
        <Link href={`/login?next=/product/${productSlug}`} className="text-ink underline underline-offset-4">Log in</Link> to leave a review.
      </p>
    );
  }
  if (alreadyReviewed || state.ok) {
    return <FormMessage type="success">{state.message ?? "You've already reviewed this product — thank you!"}</FormMessage>;
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Your rating</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-1"
            >
              <Star className={cn("h-6 w-6 transition-colors", (hover || rating) >= n ? "fill-ink text-ink" : "text-line")} strokeWidth={1} />
            </button>
          ))}
        </div>
        {state.fieldErrors?.rating && <p className="mt-1 text-xs text-sale">{state.fieldErrors.rating}</p>}
      </div>
      <Field label="Title" htmlFor="review-title" error={state.fieldErrors?.title}>
        <Input id="review-title" name="title" placeholder="Sum it up in a few words" />
      </Field>
      <Field label="Review" htmlFor="review-comment" error={state.fieldErrors?.comment} required>
        <Textarea id="review-comment" name="comment" required placeholder="How does it smell? How long does it last? Would you recommend it?" />
      </Field>
      <Button type="submit" loading={pending} variant="secondary">
        Submit review
      </Button>
    </form>
  );
}

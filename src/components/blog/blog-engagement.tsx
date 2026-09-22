"use client";

import { Heart } from "lucide-react";
import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage, Textarea } from "@/components/ui/form-fields";
import { addBlogCommentAction, toggleBlogLikeAction } from "@/lib/actions/blog";
import { initialActionState } from "@/types";

export function BlogLikeButton({ slug, liked, count, disabled }: { slug: string; liked: boolean; count: number; disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() => startTransition(async () => { await toggleBlogLikeAction(slug); })}
      className="inline-flex min-h-11 items-center gap-2 border border-line px-4 text-xs font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:border-rosewood disabled:opacity-50"
      title={disabled ? "Log in to like this post" : undefined}
    >
      <Heart className={liked ? "h-4 w-4 fill-rosewood text-rosewood" : "h-4 w-4"} aria-hidden="true" />
      {count} like{count === 1 ? "" : "s"}
    </button>
  );
}

export function BlogCommentForm({ slug, disabled }: { slug: string; disabled: boolean }) {
  const [state, action, pending] = useActionState(addBlogCommentAction, initialActionState);
  if (disabled) return <p className="border border-line bg-cream px-4 py-3 text-sm text-stone">Log in to comment on this post.</p>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <Textarea name="body" placeholder="Share your thought..." className="min-h-[96px]" required />
      <Button type="submit" loading={pending} size="sm">Post comment</Button>
    </form>
  );
}

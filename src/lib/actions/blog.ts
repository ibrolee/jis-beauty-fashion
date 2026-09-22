"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { getBlogContent, saveBlogContent } from "@/lib/data/blog";
import type { ActionState } from "@/types";

export async function addBlogCommentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const user = await requireUser(`/blog/${slug}`);
  if (!slug || body.length < 2) return { error: "Write a short comment first." };
  if (body.length > 1000) return { error: "Keep comments under 1,000 characters." };

  const blog = await getBlogContent();
  const post = blog.posts.find((item) => item.slug === slug && item.published);
  if (!post) return { error: "Blog post not found." };

  await saveBlogContent({
    ...blog,
    comments: [
      ...blog.comments,
      {
        id: crypto.randomUUID(),
        postSlug: slug,
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        body,
        createdAt: new Date().toISOString(),
      },
    ],
  });
  revalidatePath(`/blog/${slug}`);
  return { ok: true, message: "Comment added." };
}

export async function toggleBlogLikeAction(slug: string): Promise<void> {
  const user = await requireUser(`/blog/${slug}`);
  const blog = await getBlogContent();
  const post = blog.posts.find((item) => item.slug === slug && item.published);
  if (!post) return;

  const current = blog.likes[slug] ?? [];
  const liked = current.includes(user.id);
  await saveBlogContent({
    ...blog,
    likes: {
      ...blog.likes,
      [slug]: liked ? current.filter((id) => id !== user.id) : [...current, user.id],
    },
  });
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
}

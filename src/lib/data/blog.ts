import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { getSiteContent } from "@/lib/data/settings";
import type { BlogContent, BlogPost } from "@/lib/site-content";

export async function getBlogContent(): Promise<BlogContent> {
  return (await getSiteContent()).blog;
}

export async function saveBlogContent(blog: BlogContent) {
  await db
    .insert(siteSettings)
    .values({ key: "blog", value: blog, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: blog, updatedAt: new Date() } });
}

export function sortedBlogPosts(posts: BlogPost[], includeDrafts = false) {
  return posts
    .filter((post) => includeDrafts || post.published)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getBlogPost(slug: string, includeDrafts = false) {
  const blog = await getBlogContent();
  return blog.posts.find((post) => post.slug === slug && (includeDrafts || post.published)) ?? null;
}

import type { Metadata } from "next";
import { getSiteContent } from "@/lib/data/settings";
import { websitePage } from "@/lib/website-presentation";
import type { PageKey } from "@/lib/website-content";
export async function pageContent(key: PageKey) {
  const content = await getSiteContent();
  return { content, page: websitePage(content.website.pages[key], content) };
}
export async function pageMetadata(key: PageKey): Promise<Metadata> {
  const { content, page } = await pageContent(key);
  return { title: page.title, description: page.intro || content.website.brand.description, alternates: { canonical: key === "collections" ? "/categories" : `/${key}` } };
}

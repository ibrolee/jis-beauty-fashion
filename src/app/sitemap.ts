import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/data/categories";
import { getAllSlugs } from "@/lib/data/products";
import { absoluteUrl } from "@/lib/utils";

// Generated on request so new products/categories appear without a rebuild.
export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/", "/shop", "/categories", "/blog", "/about", "/contact", "/faq", "/shipping", "/returns", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" || path === "/shop" ? "daily" : "monthly",
    priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.5,
  }));

  try {
    const [products, categories] = await Promise.all([getAllSlugs(), getCategories()]);
    return [
      ...staticPages,
      ...categories.map((c) => ({ url: absoluteUrl(`/shop/${c.slug}`), lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
      ...products.map((p) => ({ url: absoluteUrl(`/product/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ];
  } catch (error) {
    console.error("Sitemap: database unavailable, returning static pages only.", error);
    return staticPages;
  }
}

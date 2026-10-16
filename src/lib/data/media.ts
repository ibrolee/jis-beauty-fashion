import { createHash } from "node:crypto";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants, categories, siteSettings } from "@/db/schema";
import { CONTENT_KEYS } from "@/lib/content-publishing";
import { getPublishedSiteContent } from "@/lib/data/settings";
export type MediaAsset = { id: string; url: string; name: string; createdAt: string; hidden: boolean };
export function mediaAsset(url: string, name?: string): MediaAsset {
  let filename = url.split("/").at(-1)?.split("?")[0] || "Image";
  try { filename = decodeURIComponent(filename); } catch { /* Keep the original filename for malformed escapes. */ }
  return { id: createHash("sha256").update(url).digest("hex").slice(0, 24), url, name: (name || filename).slice(0, 120), createdAt: new Date().toISOString(), hidden: false };
}
export async function getMediaLibrary(includeHidden = false): Promise<MediaAsset[]> {
  const [settings, productImages, optionImages, categoryImages, content] = await Promise.all([
    db.select().from(siteSettings).where(inArray(siteSettings.key, [CONTENT_KEYS.media, CONTENT_KEYS.draft])),
    db.select({ images: products.images }).from(products).limit(300),
    db.select({ images: productVariants.images }).from(productVariants).limit(500),
    db.select({ image: categories.image }).from(categories).limit(100),
    getPublishedSiteContent(),
  ]);
  const found = new Set<string>();
  function collect(value: unknown, key = "") {
    if (typeof value === "string" && ["image", "logo", "shareImage"].includes(key) && value) found.add(value);
    else if (Array.isArray(value)) value.forEach((item) => collect(item, key));
    else if (value && typeof value === "object") Object.entries(value).forEach(([name, child]) => collect(child, name));
  }
  collect(content); collect(settings.find((row) => row.key === CONTENT_KEYS.draft)?.value);
  productImages.forEach((row) => row.images.forEach((url) => found.add(url)));
  optionImages.forEach((row) => row.images.forEach((url) => found.add(url)));
  categoryImages.forEach((row) => { if (row.image) found.add(row.image); });
  const stored = (settings.find((row) => row.key === CONTENT_KEYS.media)?.value as { assets?: MediaAsset[] })?.assets ?? [];
  const map = new Map(Array.from(found, (url) => { const asset = mediaAsset(url); return [asset.id, asset] as const; }));
  stored.forEach((asset) => map.set(asset.id, asset));
  return Array.from(map.values()).filter((asset) => includeHidden || !asset.hidden).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 1000);
}

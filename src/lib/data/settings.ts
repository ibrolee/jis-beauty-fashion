import { db } from "@/db";
import { ensureSeeded } from "@/db/ensure-seed";
import { siteSettings } from "@/db/schema";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content";
import { resolveAnnouncement } from "@/lib/storefront-settings";

/** Loads admin-managed site content, falling back to defaults per key. */
export async function getSiteContent(): Promise<SiteContent> {
  await ensureSeeded();
  const rows = await db.select().from(siteSettings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const delivery = { ...DEFAULT_SITE_CONTENT.delivery, ...(map.get("delivery") ?? {}) };
  const announcement = resolveAnnouncement(
    { ...DEFAULT_SITE_CONTENT.announcement, ...(map.get("announcement") ?? {}) },
    delivery,
  );
  return {
    announcement,
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...(map.get("hero") ?? {}) },
    promo: { ...DEFAULT_SITE_CONTENT.promo, ...(map.get("promo") ?? {}) },
    business: { ...DEFAULT_SITE_CONTENT.business, ...(map.get("business") ?? {}) },
    delivery,
    blog: { ...DEFAULT_SITE_CONTENT.blog, ...(map.get("blog") ?? {}) },
  } as SiteContent;
}

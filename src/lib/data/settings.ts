import { db } from "@/db";
import { ensureSeeded } from "@/db/ensure-seed";
import { siteSettings } from "@/db/schema";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content";

/** Loads admin-managed site content, falling back to defaults per key. */
export async function getSiteContent(): Promise<SiteContent> {
  await ensureSeeded();
  const rows = await db.select().from(siteSettings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const announcement = { ...DEFAULT_SITE_CONTENT.announcement, ...(map.get("announcement") ?? {}) };
  // An old default may already be persisted in site_settings. Update only that
  // exact legacy default for the new shipping policy; preserve custom announcements.
  if (announcement.text === "Free delivery on orders above ₦150,000 · Use code JISWELCOME for 5% off") {
    announcement.text = DEFAULT_SITE_CONTENT.announcement.text;
    announcement.href = DEFAULT_SITE_CONTENT.announcement.href;
  }
  return {
    announcement,
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...(map.get("hero") ?? {}) },
    promo: { ...DEFAULT_SITE_CONTENT.promo, ...(map.get("promo") ?? {}) },
  } as SiteContent;
}

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
  // Replace only the obsolete saved shipping announcements. Leave other
  // admin-edited announcements intact, without writing to the live database.
  if (announcement.text === "Free delivery on orders above ₦150,000 · Use code JISWELCOME for 5% off") {
    announcement.text = DEFAULT_SITE_CONTENT.announcement.text;
    announcement.href = DEFAULT_SITE_CONTENT.announcement.href;
  } else if (announcement.text === "Free delivery on orders above ₦150,000") {
    announcement.text = "Free interstate delivery from ₦50,000 · Free Lagos delivery from ₦150,000";
    announcement.href = "/shipping";
  }
  return {
    announcement,
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...(map.get("hero") ?? {}) },
    promo: { ...DEFAULT_SITE_CONTENT.promo, ...(map.get("promo") ?? {}) },
    business: { ...DEFAULT_SITE_CONTENT.business, ...(map.get("business") ?? {}) },
    delivery: { ...DEFAULT_SITE_CONTENT.delivery, ...(map.get("delivery") ?? {}) },
    blog: { ...DEFAULT_SITE_CONTENT.blog, ...(map.get("blog") ?? {}) },
  } as SiteContent;
}

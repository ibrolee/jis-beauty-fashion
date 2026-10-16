import { cache } from "react";
import { inArray } from "drizzle-orm";
import { draftMode } from "next/headers";
import { db } from "@/db";
import { ensureSeeded } from "@/db/ensure-seed";
import { siteSettings } from "@/db/schema";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content";
import { resolveAnnouncement } from "@/lib/storefront-settings";
import { CONTENT_KEYS } from "@/lib/content-publishing";
import { getCurrentUser } from "@/lib/auth/session";
import { editableContent } from "@/lib/website-schema";
import { stripReactActionFields } from "@/lib/form-action-fields";
import type { ContentDraft, ContentVersion, EditableContent } from "@/lib/website-content";

const legacyKeys = ["announcement", "hero", "promo", "business", "delivery", "blog"] as const;
export function legacyContent(rows: { key: string; value: unknown }[]): SiteContent {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const content = structuredClone(DEFAULT_SITE_CONTENT);
  for (const key of legacyKeys) {
    const raw = map.get(key);
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      Object.assign(content[key], stripReactActionFields(raw));
    }
  }
  return content;
}
export function applyEditable(base: SiteContent, editable: EditableContent): SiteContent {
  return { ...base, ...editable, announcement: resolveAnnouncement(editable.announcement, editable.delivery) };
}

export const readPublishedVersion = cache(async () => {
  await ensureSeeded();
  const rows = await db.select().from(siteSettings).where(inArray(siteSettings.key, [...legacyKeys, CONTENT_KEYS.published]));
  const legacy = legacyContent(rows);
  const saved = rows.find((row) => row.key === CONTENT_KEYS.published)?.value as ContentVersion | undefined;
  const version: ContentVersion = stripReactActionFields(saved ?? { revision: "legacy", content: editableContent(legacy), savedAt: "", savedBy: "Original website" });
  version.content.announcement = resolveAnnouncement(version.content.announcement, version.content.delivery);
  return { version, content: applyEditable(legacy, version.content) };
});

/** Orders and payments always use published settings, including in draft preview. */
export const getPublishedSiteContent = cache(async (): Promise<SiteContent> => (await readPublishedVersion()).content);
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const published = await getPublishedSiteContent();
  if (!(await draftMode()).isEnabled || (await getCurrentUser())?.role !== "admin") return published;
  const row = await db.query.siteSettings.findFirst({ where: (table, { eq }) => eq(table.key, CONTENT_KEYS.draft) });
  const draft = row?.value as ContentDraft | undefined;
  return draft ? applyEditable(published, stripReactActionFields(draft.content)) : published;
});

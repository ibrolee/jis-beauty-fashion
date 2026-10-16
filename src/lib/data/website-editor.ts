import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { legacyContent } from "@/lib/data/settings";
import { editableContent } from "@/lib/website-schema";
import { stripReactActionFields } from "@/lib/form-action-fields";
import { resolveAnnouncement } from "@/lib/storefront-settings";
import { CONTENT_KEYS, type PublicationState } from "@/lib/content-publishing";
import type { ContentDraft, ContentVersion, EditorState } from "@/lib/website-content";

export const publicationKeys = [...Object.values(CONTENT_KEYS).filter((key) => key !== CONTENT_KEYS.media), "announcement", "hero", "promo", "business", "delivery"];
export function publicationFromRows(rows: { key: string; value: unknown }[]): PublicationState {
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const legacy = legacyContent(rows);
  legacy.announcement = resolveAnnouncement(legacy.announcement, legacy.delivery);
  return {
    published: stripReactActionFields(map.get(CONTENT_KEYS.published) as ContentVersion ?? { revision: "legacy", content: editableContent(legacy), savedAt: "", savedBy: "Original website" }),
    draft: stripReactActionFields(map.get(CONTENT_KEYS.draft) as ContentDraft ?? null),
    history: stripReactActionFields((map.get(CONTENT_KEYS.history) as { versions?: ContentVersion[] })?.versions ?? []),
  };
}
export function editorState(state: PublicationState): EditorState {
  return { content: structuredClone(state.draft?.content ?? state.published.content), publishedRevision: state.published.revision, draftRevision: state.draft?.revision ?? "", hasDraft: Boolean(state.draft), history: state.history.map(({ revision, savedAt, savedBy }) => ({ revision, savedAt, savedBy })) };
}
export async function getWebsiteEditorState(): Promise<EditorState> {
  return editorState(publicationFromRows(await db.select().from(siteSettings).where(inArray(siteSettings.key, publicationKeys))));
}

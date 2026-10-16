import type { ContentDraft, ContentVersion, EditableContent } from "@/lib/website-content";

export const CONTENT_KEYS = { published: "website_published", draft: "website_draft", history: "website_history", media: "website_media" } as const;
export type PublicationState = { published: ContentVersion; draft: ContentDraft | null; history: ContentVersion[] };
export function assertRevision(actual: string, expected: string) {
  if (actual !== expected) throw new Error("The saved website changed in another tab. Reload the editor before saving or publishing.");
}
export function draftChange(state: PublicationState, content: EditableContent, expectedDraft: string, expectedPublished: string, revision: string, savedAt: string, savedBy: string): PublicationState {
  assertRevision(state.draft?.revision ?? "", expectedDraft);
  assertRevision(state.published.revision, expectedPublished);
  return { ...state, draft: { content, revision, savedAt, savedBy, baseRevision: state.published.revision } };
}
export function publishChange(state: PublicationState, expectedDraft: string, expectedPublished: string, revision: string, savedAt: string, savedBy: string): PublicationState {
  assertRevision(state.draft?.revision ?? "", expectedDraft);
  assertRevision(state.published.revision, expectedPublished);
  if (!state.draft) throw new Error("Save a draft before publishing.");
  assertRevision(state.published.revision, state.draft.baseRevision);
  return { published: { content: state.draft.content, revision, savedAt, savedBy }, draft: null, history: [state.published, ...state.history].slice(0, 15) };
}
export function restoreChange(state: PublicationState, selectedRevision: string, expectedDraft: string, expectedPublished: string, revision: string, savedAt: string, savedBy: string): PublicationState {
  const version = state.history.find((item) => item.revision === selectedRevision);
  if (!version) throw new Error("This saved version is no longer available.");
  return draftChange(state, structuredClone(version.content), expectedDraft, expectedPublished, revision, savedAt, savedBy);
}

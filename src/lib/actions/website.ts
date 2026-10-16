"use server";

import { randomUUID } from "node:crypto";
import { eq, inArray, sql } from "drizzle-orm";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { getWebsiteEditorState, publicationFromRows, publicationKeys, editorState } from "@/lib/data/website-editor";
import { CONTENT_KEYS, assertRevision, draftChange, publishChange, restoreChange, type PublicationState } from "@/lib/content-publishing";
import { editableContentSchema } from "@/lib/website-schema";
import type { EditableContent, EditorState } from "@/lib/website-content";

type Revisions = { draftRevision: string; publishedRevision: string };
export type EditorResult = { ok: true; state: EditorState; message: string } | { ok: false; message: string };

async function changeWebsite(input: Revisions, operation: "save" | "publish" | "restore" | "discard", content?: EditableContent, selectedRevision?: string): Promise<EditorResult> {
  const admin = await requireAdmin();
  try {
    const state = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext('jis.website.content'))`);
      const current = publicationFromRows(await tx.select().from(siteSettings).where(inArray(siteSettings.key, publicationKeys)));
      const args = [input.draftRevision, input.publishedRevision, randomUUID(), new Date().toISOString(), `${admin.firstName} ${admin.lastName}`.trim()] as const;
      let next: PublicationState;
      if (operation === "save") next = draftChange(current, content!, ...args);
      else if (operation === "publish") {
        if (current.draft) editableContentSchema.parse(current.draft.content);
        next = publishChange(current, ...args);
      } else if (operation === "restore") next = restoreChange(current, selectedRevision!, ...args);
      else {
        assertRevision(current.draft?.revision ?? "", input.draftRevision);
        assertRevision(current.published.revision, input.publishedRevision);
        next = { ...current, draft: null };
      }
      if (next.draft) await tx.insert(siteSettings).values({ key: CONTENT_KEYS.draft, value: next.draft, updatedAt: new Date() }).onConflictDoUpdate({ target: siteSettings.key, set: { value: next.draft, updatedAt: new Date() } });
      else await tx.delete(siteSettings).where(eq(siteSettings.key, CONTENT_KEYS.draft));
      if (operation === "publish") {
        for (const [key, value] of [[CONTENT_KEYS.published, next.published], [CONTENT_KEYS.history, { versions: next.history }]] as const) {
          await tx.insert(siteSettings).values({ key, value, updatedAt: new Date() }).onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
        }
      }
      return editorState(next);
    });
    revalidatePath("/admin/content");
    if (operation === "publish") revalidatePath("/", "layout");
    const message = { save: "Draft saved. Customers still see the published website.", publish: "Website published. The previous version is available in Version history.", restore: "Version restored as a draft. Preview it before publishing.", discard: "Draft discarded. The published website is unchanged." }[operation];
    return { ok: true, state, message };
  } catch (error) {
    console.error("Website editor operation failed", error instanceof Error ? error.message : "Unknown error");
    return { ok: false, message: error instanceof Error && !error.message.startsWith("Failed query") ? error.message : "Could not save the website. Please try again." };
  }
}

export async function saveWebsiteDraftAction(input: Revisions & { content: EditableContent }): Promise<EditorResult> {
  await requireAdmin();
  if (JSON.stringify(input.content).length > 500_000) return { ok: false, message: "This draft is too large. Shorten long text or remove unused sections." };
  const parsed = editableContentSchema.safeParse(input.content);
  if (!parsed.success) return { ok: false, message: parsed.error.issues.slice(0, 3).map((issue) => `${issue.path.join(" → ")}: ${issue.message}`).join(". ") };
  return changeWebsite(input, "save", parsed.data);
}
export async function publishWebsiteAction(input: Revisions) { return changeWebsite(input, "publish"); }
export async function restoreWebsiteAction(input: Revisions & { revision: string }) { return changeWebsite(input, "restore", undefined, input.revision); }
export async function discardWebsiteDraftAction(input: Revisions) { return changeWebsite(input, "discard"); }
export async function startWebsitePreviewAction() {
  await requireAdmin();
  if (!(await getWebsiteEditorState()).hasDraft) redirect("/admin/content");
  (await draftMode()).enable();
  redirect("/");
}
export async function stopWebsitePreviewAction() {
  await requireAdmin();
  (await draftMode()).disable();
  redirect("/admin/content");
}

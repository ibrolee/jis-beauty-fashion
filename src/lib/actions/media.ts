"use server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { CONTENT_KEYS } from "@/lib/content-publishing";
import { safeDestination } from "@/lib/website-schema";
import { getMediaLibrary, mediaAsset, type MediaAsset } from "@/lib/data/media";

export async function listWebsiteMediaAction() { await requireAdmin(); return getMediaLibrary(); }
export async function updateWebsiteMediaAction(url: string, name: string, hidden = false) {
  await requireAdmin();
  if (!url || url.length > 2000 || !safeDestination(url, true)) throw new Error("Choose a valid uploaded image.");
  if (name.length > 120) throw new Error("Image names can have up to 120 characters.");
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('jis.website.media'))`);
    const row = await tx.query.siteSettings.findFirst({ where: eq(siteSettings.key, CONTENT_KEYS.media) });
    const assets = (row?.value as { assets?: MediaAsset[] })?.assets ?? [];
    const asset = { ...mediaAsset(url, name), hidden };
    const previous = assets.find((item) => item.id === asset.id);
    if (previous) asset.createdAt = previous.createdAt;
    const next = [asset, ...assets.filter((item) => item.id !== asset.id)].slice(0, 1000);
    await tx.insert(siteSettings).values({ key: CONTENT_KEYS.media, value: { assets: next }, updatedAt: new Date() }).onConflictDoUpdate({ target: siteSettings.key, set: { value: { assets: next }, updatedAt: new Date() } });
    return asset;
  });
}
export async function registerWebsiteMediaAction(url: string, name: string) { return updateWebsiteMediaAction(url, name, false); }

"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { updateWebsiteMediaAction } from "@/lib/actions/media";
import type { MediaAsset } from "@/lib/data/media";
export function MediaManager({ initial }: { initial: MediaAsset[] }) {
  const [assets, setAssets] = useState(initial);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function change(asset: MediaAsset, hide = asset.hidden) {
    setPending(asset.id); setError("");
    try { const next = await updateWebsiteMediaAction(asset.url, asset.name, hide); setAssets((old) => [next, ...old.filter((item) => item.url !== next.url)]); }
    catch { setError("Could not update this image. Please try again."); } finally { setPending(null); }
  }
  return <div className="space-y-6"><section className="rounded-2xl border border-line bg-white p-5"><h2 className="mb-4 font-serif text-2xl">Upload images</h2><ImageUploader name={null} value={uploaded} onChange={(urls) => { setUploaded(urls); for (const url of urls) if (!assets.some((asset) => asset.url === url)) setAssets((old) => old.some((asset) => asset.url === url) ? old : [...old, { id: url, url, name: url.split("/").at(-1) ?? "Image", createdAt: new Date().toISOString(), hidden: false }]); }} /></section>
    <div className="flex flex-wrap items-center gap-3"><input aria-label="Search media" placeholder="Search images" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-11 min-w-0 flex-1 border border-line px-3" /><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} />Show removed images</label></div>
    <p className="text-sm text-stone">Removing an image hides it from the picker. Pages and saved versions keep their images. Removed images can be restored here.</p>
    {error && <p role="alert" className="text-sale">{error}</p>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{assets.filter((asset) => asset.hidden === hidden && asset.name.toLowerCase().includes(query.toLowerCase())).map((asset) => <article key={asset.id} className="min-w-0 rounded-xl border border-line bg-white p-4"><div className="relative mb-4 aspect-square bg-ivory"><Image src={asset.url} alt={asset.name} fill sizes="300px" className="object-contain" /></div><label className="block text-xs text-stone">Image name<input value={asset.name} onChange={(event) => setAssets((old) => old.map((item) => item.id === asset.id ? { ...item, name: event.target.value } : item))} className="mt-1 min-h-11 w-full border border-line px-3 text-sm text-ink" maxLength={120} /></label><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={pending !== null} onClick={() => void change(asset)} className="min-h-10 border border-line px-3 text-sm">{pending === asset.id ? "Saving…" : "Save name"}</button><button type="button" disabled={pending !== null} onClick={() => void change(asset, !asset.hidden)} className="min-h-10 px-3 text-sm underline">{asset.hidden ? "Restore image" : "Remove from library"}</button></div></article>)}</div>
  </div>;
}

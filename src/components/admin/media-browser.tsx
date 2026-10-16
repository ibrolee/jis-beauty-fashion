"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { listWebsiteMediaAction } from "@/lib/actions/media";
import type { MediaAsset } from "@/lib/data/media";

export function MediaBrowser({ onSelect, disabled }: { onSelect: (url: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const opener = trigger.current;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLInputElement>("input")?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input,a[href]') ?? []);
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener("keydown", keydown); opener?.focus(); };
  }, [open]);
  async function show() {
    setOpen(true); setLoading(true); setError("");
    try { setAssets(await listWebsiteMediaAction()); } catch { setError("Could not load your images. Please try again."); }
    finally { setLoading(false); }
  }
  return <>
    <button ref={trigger} type="button" disabled={disabled} onClick={() => void show()} className="min-h-11 border border-line px-4 py-2 text-xs font-medium uppercase tracking-wider disabled:opacity-50">Choose from media</button>
    {open && <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-3 sm:p-6">
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="Choose an image" className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4"><h2 className="font-serif text-3xl">Your images</h2><button type="button" onClick={() => setOpen(false)} className="min-h-11 px-3 text-sm underline">Close</button></div>
        <input aria-label="Search images" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by image name" className="mb-4 min-h-11 w-full border border-line px-3" />
        {loading && <p role="status">Loading images…</p>}{error && <p role="alert" className="text-sale">{error}</p>}
        <div className="grid min-h-0 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
          {assets.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase())).map((asset) => <button key={asset.id} type="button" onClick={() => { onSelect(asset.url); setOpen(false); }} className="min-w-0 border border-line p-2 text-left hover:border-ink"><span className="relative mb-2 block aspect-square bg-ivory"><Image src={asset.url} alt={asset.name} fill sizes="180px" className="object-contain" /></span><span className="block truncate text-xs">{asset.name}</span></button>)}
        </div>
        {!loading && !assets.length && <p className="py-8 text-sm text-stone">Upload a photo to start your media collection.</p>}
      </div>
    </div>}
  </>;
}

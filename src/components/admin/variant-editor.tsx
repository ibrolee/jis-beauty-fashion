"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/image-uploader";
import type { ProductVariant } from "@/db/schema";

type Draft = {
  key: string;
  id: number | null;
  name: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  images: string[];
};

const input = "h-11 w-full min-w-0 border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none";

export function VariantEditor({ variants }: { variants: ProductVariant[] }) {
  const [rows, setRows] = useState<Draft[]>(() => variants.map((v) => ({
    key: `existing-${v.id}`,
    id: v.id,
    name: v.name,
    sku: v.sku ?? "",
    price: String(v.price),
    salePrice: v.salePrice === null ? "" : String(v.salePrice),
    stock: String(v.stock),
    images: v.images ?? [],
  })));

  function edit(key: string, patch: Partial<Draft>) {
    setRows((old) => old.map((row) => row.key === key ? { ...row, ...patch } : row));
  }

  function add() {
    setRows((old) => [...old, {
      key: `new-${crypto.randomUUID()}`, id: null, name: "", sku: "", price: "", salePrice: "", stock: "0", images: [],
    }]);
  }

  // Variant JSON is decoded and strictly validated by the server. Keep stable IDs on edits
  // to preserve past order references. Removed variants are archived instead of deleted.
  const serialized = JSON.stringify(rows.map(({ id, name, sku, price, salePrice, stock, images }) => ({
    id, name, sku, price, salePrice, stock, images,
  })));

  return (
    <div className="space-y-4">
      <input type="hidden" name="variantsJson" value={serialized} />
      <p className="text-xs leading-relaxed text-stone">Optional: create one option for each scent, size or colour. Each option has its own photos, price and stock. When options exist, the main stock is calculated automatically.</p>
      {rows.map((row, index) => (
        <div key={row.key} className="min-w-0 space-y-4 border border-line bg-ivory/30 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-ink">Option {index + 1}</h3>
            <button type="button" className="text-xs text-sale underline underline-offset-4" onClick={() => setRows((old) => old.filter((v) => v.key !== row.key))}>Remove option</button>
          </div>
          <label className="block space-y-1 text-xs text-ink-soft">
            <span>Option name *</span>
            <input className={input} value={row.name} maxLength={80} placeholder="Merlot · 100ml" onChange={(event) => edit(row.key, { name: event.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block min-w-0 space-y-1 text-xs text-ink-soft"><span>Price (₦) *</span><input className={input} type="number" min="1" step="1" value={row.price} onChange={(event) => edit(row.key, { price: event.target.value })} /></label>
            <label className="block min-w-0 space-y-1 text-xs text-ink-soft"><span>Sale price (₦)</span><input className={input} type="number" min="0" step="1" value={row.salePrice} placeholder="Optional" onChange={(event) => edit(row.key, { salePrice: event.target.value })} /></label>
            <label className="block min-w-0 space-y-1 text-xs text-ink-soft"><span>Stock *</span><input className={input} type="number" min="0" step="1" value={row.stock} onChange={(event) => edit(row.key, { stock: event.target.value })} /></label>
            <label className="block min-w-0 space-y-1 text-xs text-ink-soft"><span>SKU (optional)</span><input className={input} value={row.sku} maxLength={60} placeholder="Optional" onChange={(event) => edit(row.key, { sku: event.target.value })} /></label>
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-xs text-ink-soft">Photos for this option — the first becomes its main photo</p>
            <ImageUploader name={null} maxImages={12} value={row.images} onChange={(images) => edit(row.key, { images })} />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} disabled={rows.length >= 40} className="inline-flex min-h-12 w-full items-center justify-center border border-dashed border-ink px-4 text-xs font-medium uppercase tracking-[0.14em] hover:bg-ivory disabled:opacity-50">
        + Add scent / size / colour option
      </button>
    </div>
  );
}

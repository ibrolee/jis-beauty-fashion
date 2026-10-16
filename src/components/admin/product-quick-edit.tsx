"use client";

import { useActionState } from "react";
import { quickUpdateProductAction } from "@/lib/actions/admin";
import { initialActionState } from "@/types";

/** Only single-SKU products can update aggregate stock directly. */
export function ProductQuickEdit({
  id, price, salePrice, stock, updatedAt, hasVariants,
}: {
  id: number;
  price: number;
  salePrice: number | null;
  stock: number;
  updatedAt: string;
  hasVariants: boolean;
}) {
  const [state, action, pending] = useActionState(quickUpdateProductAction, initialActionState);
  if (hasVariants) {
    return <p className="text-xs text-stone">Has options: edit variants individually to protect stock totals.</p>;
  }
  return (
    <form action={action} className="space-y-2 rounded-sm border border-line bg-cream/70 p-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="expectedUpdatedAt" value={updatedAt} />
      <div className="grid grid-cols-3 gap-2">
        <label className="min-w-0 text-[11px] text-stone">
          Price ₦
          <input aria-label="Regular price in naira" name="price" type="number" min="1" step="1" required defaultValue={price} className="mt-1 h-9 w-full min-w-0 border border-line bg-white px-2 text-sm text-ink" />
        </label>
        <label className="min-w-0 text-[11px] text-stone">
          Sale ₦
          <input aria-label="Sale price in naira" name="salePrice" type="number" min="1" step="1" defaultValue={salePrice ?? ""} placeholder="None" className="mt-1 h-9 w-full min-w-0 border border-line bg-white px-2 text-sm text-ink" />
        </label>
        <label className="min-w-0 text-[11px] text-stone">
          Stock
          <input aria-label="Units in stock" name="stock" type="number" min="0" step="1" required defaultValue={stock} className="mt-1 h-9 w-full min-w-0 border border-line bg-white px-2 text-sm text-ink" />
        </label>
      </div>
      {state.error && <p role="alert" className="text-xs text-sale">{state.error}</p>}
      {state.ok && <p role="status" className="text-xs text-green-700">{state.message}</p>}
      <button type="submit" disabled={pending} className="min-h-9 w-full bg-ink px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
        {pending ? "Saving…" : "Save price & stock"}
      </button>
    </form>
  );
}

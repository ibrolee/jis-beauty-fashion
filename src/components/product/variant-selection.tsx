"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ProductVariant } from "@/db/schema";
import type { ProductDetail } from "@/types";
import { cn, formatNaira } from "@/lib/utils";
import { ProductGallery } from "./product-gallery";

type VariantSelection = {
  variant: ProductVariant | null;
  selectVariant: (variant: ProductVariant) => void;
};
const Context = createContext<VariantSelection | null>(null);

export function VariantSelectionProvider({ product, children }: { product: ProductDetail; children: ReactNode }) {
  const [variant, selectVariant] = useState<ProductVariant | null>(() =>
    product.variants.find((option) => option.stock > 0) ?? product.variants[0] ?? null,
  );
  return <Context.Provider value={{ variant, selectVariant }}>{children}</Context.Provider>;
}

export function useVariantSelection() {
  const selection = useContext(Context);
  if (!selection) throw new Error("Variant selection provider is missing.");
  return selection;
}

export function VariantProductGallery({ product, badges }: {
  product: ProductDetail;
  badges: { tone: "sale" | "new" | "best" | "soldout"; label: string }[];
}) {
  const { variant } = useVariantSelection();
  const images = variant?.images.length ? variant.images : product.images;
  // Remount on option change so gallery starts with the selected option's first photo.
  return <ProductGallery key={variant?.id ?? "base"} images={images} name={`${product.name}${variant ? ` — ${variant.name}` : ""}`} badges={badges} />;
}

/** Place above the photo on mobile and next to the photo on desktop. */
export function VariantChoices({ product, onSelect }: { product: ProductDetail; onSelect?: () => void }) {
  const { variant, selectVariant } = useVariantSelection();
  if (!product.variants.length) return null;

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
        Choose scent {variant && <span className="ml-1 normal-case tracking-normal text-stone">— {variant.name}</span>}
      </legend>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:flex-wrap lg:overflow-visible" aria-label="Available product options">
        {product.variants.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              selectVariant(option);
              onSelect?.();
            }}
            aria-pressed={variant?.id === option.id}
            disabled={option.stock <= 0}
            className={cn(
              "min-h-11 shrink-0 border px-3 py-2 text-left text-xs leading-snug transition-colors sm:text-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through",
              variant?.id === option.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink",
            )}
          >
            <span className="block">{option.name}</span>
            <span className="block pt-0.5 text-[11px] opacity-70">{formatNaira(option.salePrice !== null && option.salePrice < option.price ? option.salePrice : option.price)}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ProductVariant } from "@/db/schema";
import type { ProductDetail } from "@/types";
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

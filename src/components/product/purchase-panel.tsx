"use client";

import { ArrowUpRight, Minus, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { Price } from "@/components/ui/price";
import { SITE, type DeliverySettings } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";
import { VariantChoices, useVariantSelection } from "./variant-selection";

export function PurchasePanel({ product, delivery, whatsappUrl = SITE.whatsappUrl, storeName = SITE.shortName }: { product: ProductDetail; delivery: DeliverySettings; whatsappUrl?: string; storeName?: string }) {
  const { variant } = useVariantSelection();
  const [quantity, setQuantity] = useState(1);
  const stock = variant ? variant.stock : product.stock;
  const soldOut = stock <= 0;
  const priceSource = variant ?? product;
  const safeQuantity = Math.min(quantity, Math.max(1, stock));

  return (
    <div className="space-y-4 sm:space-y-6">
      {product.variants.length > 0 && (
        <div className="hidden border-t border-line pt-5 lg:block">
          <VariantChoices product={product} onSelect={() => setQuantity(1)} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 sm:gap-4 sm:pb-5">
        <Price price={priceSource.price} salePrice={priceSource.salePrice} size="lg" />
        {soldOut && <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-sale" role="status"><span className="h-1.5 w-1.5 rounded-full bg-sale" aria-hidden="true" />Out of stock</p>}
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-stone">Your selection</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex h-12 w-full items-center justify-between border border-line bg-cream sm:h-14 sm:w-36" aria-label="Choose quantity">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={soldOut || safeQuantity <= 1} className="flex h-full w-11 shrink-0 items-center justify-center transition-colors hover:bg-ivory disabled:opacity-40" aria-label="Decrease quantity">
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              type="number"
              min={1}
              max={Math.max(1, stock)}
              value={safeQuantity}
              onChange={(event) => setQuantity(Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(1, stock)))}
              className="h-full w-full min-w-0 bg-transparent text-center text-sm tabular-nums focus:outline-none"
              aria-label="Quantity"
            />
            <button type="button" onClick={() => setQuantity((q) => Math.min(stock, q + 1))} disabled={soldOut || safeQuantity >= stock} className="flex h-full w-11 shrink-0 items-center justify-center transition-colors hover:bg-ivory disabled:opacity-40" aria-label="Increase quantity">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <AddToCartButton product={product} variant={variant} quantity={safeQuantity} size="lg" className="min-h-12 flex-1 sm:min-h-14" />
          <WishlistButton productId={product.id} productName={product.name} withLabel className="min-h-12 justify-center border border-line px-4 transition-colors hover:border-ink sm:min-h-14" />
        </div>

        {soldOut ? (
          <a href={`${whatsappUrl}?text=${encodeURIComponent(`Hello ${storeName}, please notify me when ${product.name} is back in stock.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-ink px-4 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-white">
            Ask about restocking <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <AddToCartButton product={product} variant={variant} quantity={safeQuantity} buyNow appearance="secondary" size="lg" className="min-h-12 w-full sm:min-h-14" />
        )}
      </div>

      <div className="border-y border-line py-3.5 sm:py-5">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-rosewood" strokeWidth={1.5} aria-hidden="true" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.13em] text-ink">Delivery across Nigeria</p>
            <p className="mt-1 text-xs leading-relaxed text-stone">Delivery fees and estimated times are displayed at checkout after you select your state.</p>
          </div>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-stone">
        Need help choosing? <a href={`${whatsappUrl}?text=${encodeURIComponent(`Hello ${storeName}, I have a question about ${product.name}.`)}`} target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline underline-offset-4">Ask us on WhatsApp</a>.
      </p>
    </div>
  );
}

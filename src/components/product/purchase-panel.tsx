"use client";

import { Minus, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { Price } from "@/components/ui/price";
import { SITE } from "@/lib/constants";
import { cn, formatNaira } from "@/lib/utils";
import type { ProductVariant } from "@/db/schema";
import type { ProductDetail } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";

export function PurchasePanel({ product }: { product: ProductDetail }) {
  const variants = product.variants;
  const [variant, setVariant] = useState<ProductVariant | null>(() => variants.find((v) => v.stock > 0) ?? variants[0] ?? null);
  const [quantity, setQuantity] = useState(1);

  const stock = variant ? variant.stock : product.stock;
  const soldOut = stock <= 0;
  const lowStock = !soldOut && stock <= 5;
  const priceSource = variant ?? product;

  return (
    <div className="space-y-6">
      <Price price={priceSource.price} salePrice={priceSource.salePrice} size="lg" />

      {variants.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
            Size {variant && <span className="ml-1 text-stone">— {variant.name}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariant(v);
                  setQuantity(1);
                }}
                aria-pressed={variant?.id === v.id}
                disabled={v.stock <= 0}
                className={cn(
                  "min-w-[72px] border px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through",
                  variant?.id === v.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
                )}
              >
                {v.name}
                <span className="ml-2 text-xs opacity-70">{formatNaira(v.salePrice && v.salePrice < v.price ? v.salePrice : v.price)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Stock status */}
      <p className={cn("flex items-center gap-2 text-sm", soldOut ? "text-sale" : lowStock ? "text-amber-700" : "text-success")} role="status">
        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", soldOut ? "bg-sale" : lowStock ? "bg-amber-500" : "bg-success")} aria-hidden />
        {soldOut ? "Out of stock" : lowStock ? `Only ${stock} left in stock` : "In stock — ready to ship"}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-12 w-full items-center border border-line sm:w-36">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={soldOut || quantity <= 1} className="flex h-full w-12 items-center justify-center disabled:opacity-40" aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            max={Math.max(1, stock)}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(Math.max(1, Number(e.target.value) || 1), Math.max(1, stock)))}
            className="h-full w-full bg-transparent text-center text-sm focus:outline-none"
            aria-label="Quantity"
          />
          <button type="button" onClick={() => setQuantity((q) => Math.min(stock, q + 1))} disabled={soldOut || quantity >= stock} className="flex h-full w-12 items-center justify-center disabled:opacity-40" aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <AddToCartButton product={product} variant={variant} quantity={quantity} className="flex-1" />
        <WishlistButton productId={product.id} productName={product.name} withLabel className="justify-center" />
      </div>

      {soldOut ? (
        <a
          href={`${SITE.whatsappUrl}?text=${encodeURIComponent(`Hello JIS, please notify me when ${product.name} is back in stock.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center border border-ink text-xs font-medium uppercase tracking-[0.16em] hover:bg-ink hover:text-white"
        >
          Notify me on WhatsApp
        </a>
      ) : (
        <AddToCartButton product={product} variant={variant} quantity={quantity} buyNow appearance="secondary" className="w-full" />
      )}

      <ul className="space-y-2 border-t border-line pt-5 text-sm text-ink-soft">
        <li className="flex items-center gap-3">
          <Truck className="h-4 w-4 text-stone" strokeWidth={1.5} aria-hidden /> Lagos delivery in 1–2 days · Nationwide in 3–5 days
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-4 w-4 items-center justify-center text-stone" aria-hidden>✓</span> 100% authentic · Sealed & carefully packaged
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-4 w-4 items-center justify-center text-stone" aria-hidden>₦</span> Free delivery on orders above ₦150,000
        </li>
      </ul>
    </div>
  );
}

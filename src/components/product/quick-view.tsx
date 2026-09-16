"use client";

import { Eye, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import type { ProductListItem } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";

export function QuickViewButton({ product }: { product: ProductListItem }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Quick view ${product.name}`} className="flex h-10 w-10 items-center justify-center border border-line bg-white text-ink transition-colors hover:border-ink">
        <Eye className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`${product.name} quick view`}>
          <button type="button" className="absolute inset-0 bg-ink/50 animate-fade-in" aria-label="Close quick view" onClick={() => setOpen(false)} />
          <div className="relative grid max-h-[92dvh] w-full max-w-3xl overflow-y-auto bg-white animate-fade-up sm:grid-cols-2">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-white/90" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-square bg-ivory sm:aspect-auto sm:min-h-[460px]">
              {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />}
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              {product.brandName && <p className="eyebrow">{product.brandName}</p>}
              <h2 className="mt-2 font-serif text-3xl leading-tight">{product.name}</h2>
              <p className="mt-1 text-sm text-stone">
                {product.volume} · {product.fragranceType}
              </p>
              {product.reviewCount > 0 && <RatingStars rating={product.rating} count={product.reviewCount} className="mt-3" />}
              <Price price={product.price} salePrice={product.salePrice} size="lg" className="mt-4" prefix={product.hasVariants ? "From" : undefined} />
              {product.shortDescription && <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{product.shortDescription}</p>}

              <dl className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
                {product.topNotes && (
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 text-stone">Top</dt>
                    <dd>{product.topNotes}</dd>
                  </div>
                )}
                {product.heartNotes && (
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 text-stone">Heart</dt>
                    <dd>{product.heartNotes}</dd>
                  </div>
                )}
                {product.baseNotes && (
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 text-stone">Base</dt>
                    <dd>{product.baseNotes}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-auto flex gap-2 pt-6">
                {product.hasVariants ? (
                  <ButtonLink href={`/product/${product.slug}`} className="flex-1">
                    Choose size
                  </ButtonLink>
                ) : (
                  <AddToCartButton product={product} className="flex-1" />
                )}
                <WishlistButton productId={product.id} productName={product.name} className="h-12 w-12 rounded-none border border-line shadow-none" />
              </div>
              <Link href={`/product/${product.slug}`} className="mt-4 text-center text-xs font-medium uppercase tracking-[0.18em] underline underline-offset-4">
                View full details
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

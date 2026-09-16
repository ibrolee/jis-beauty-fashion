import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { cn, discountPercent, isOnSale } from "@/lib/utils";
import type { ProductListItem } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";
import { QuickViewButton } from "./quick-view";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product, priority = false, className }: { product: ProductListItem; priority?: boolean; className?: string }) {
  const href = `/product/${product.slug}`;
  const soldOut = product.stock <= 0;
  const [primary, secondary] = product.images;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          {primary ? (
            <>
              <Image
                src={primary}
                alt={`${product.name} by ${product.brandName ?? "JIS"}`}
                fill
                priority={priority}
                sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={cn("object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]", secondary && "group-hover:opacity-0")}
              />
              {secondary && (
                <Image
                  src={secondary}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
                  aria-hidden
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-mist">No image</div>
          )}
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <Badge tone="soldout">Sold out</Badge>
          ) : (
            <>
              {isOnSale(product) && <Badge tone="sale">-{discountPercent(product)}%</Badge>}
              {product.isNewArrival && <Badge tone="new">New</Badge>}
              {product.isBestSeller && !isOnSale(product) && <Badge tone="best">Best seller</Badge>}
            </>
          )}
        </div>

        <div className="absolute right-2 top-2">
          <WishlistButton productId={product.id} productName={product.name} />
        </div>

        {/* Desktop hover actions */}
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full gap-px bg-white/95 p-2 transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0 lg:flex">
          <AddToCartButton product={product} size="sm" className="flex-1" />
          <QuickViewButton product={product} />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        {product.brandName && <p className="eyebrow mb-1">{product.brandName}</p>}
        <h3 className="font-serif text-[19px] leading-snug text-ink">
          <Link href={href} className="hover:text-rosewood">
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-stone">
          {product.volume}
          {product.fragranceType ? ` · ${product.fragranceType}` : ""}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <Price price={product.price} salePrice={product.salePrice} prefix={product.hasVariants ? "From" : undefined} />
          {product.reviewCount > 0 && <RatingStars rating={product.rating} count={product.reviewCount} size="xs" />}
        </div>
        {/* Mobile / tablet action */}
        <div className="mt-3 lg:hidden">
          <AddToCartButton product={product} size="sm" appearance="secondary" className="w-full" />
        </div>
      </div>
    </article>
  );
}

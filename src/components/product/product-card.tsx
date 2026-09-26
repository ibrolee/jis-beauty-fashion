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
  const href = "/product/" + product.slug;
  const soldOut = product.stock <= 0 && !product.hasVariants;
  const [primary, secondary] = product.images;

  return (
    <article className={cn("group relative flex min-w-0 flex-col rounded-[1.7rem] bg-white/72 p-2 pb-5 shadow-[0_10px_38px_rgba(77,27,59,0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_58px_rgba(77,27,59,0.12)]", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.3rem] border border-line/60 bg-ivory">
        <Link href={href} aria-label={"View " + product.name} className="absolute inset-0 z-0">
          {primary ? (
            <>
              <Image
                src={primary}
                alt={product.name + " by " + (product.brandName ?? "JIS")}
                fill
                priority={priority}
                sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={cn("object-cover transition-all duration-700 ease-out group-hover:scale-[1.045]", secondary && "group-hover:opacity-0")}
              />
              {secondary && (
                <Image
                  src={secondary}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.045] group-hover:opacity-100"
                  aria-hidden
                />
              )}
            </>
          ) : (
            <span className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-stone">Image coming soon</span>
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
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

        <div className="absolute right-2 top-2 z-20">
          <WishlistButton productId={product.id} productName={product.name} />
        </div>

        <div className="absolute inset-x-2 bottom-2 z-20 hidden translate-y-[calc(100%+0.5rem)] gap-1 rounded-[1rem] border border-line/70 bg-cream/95 p-1.5 shadow-soft backdrop-blur-sm transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0 lg:flex">
          <AddToCartButton product={product} size="sm" className="min-w-0 flex-1" />
          <QuickViewButton product={product} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2 pt-4 sm:pt-5">
        {product.brandName && <p className="eyebrow mb-2 truncate text-[10px] text-rosewood">{product.brandName}</p>}
        <h3 className="font-serif text-[20px] leading-[1.08] text-ink sm:text-[23px]">
          <Link href={href} className="transition-colors hover:text-rosewood">{product.name}</Link>
        </h3>
        {(product.volume || product.fragranceType) && (
          <p className="mt-2 text-xs leading-relaxed text-stone">
            {product.volume}{product.fragranceType ? " · " + product.fragranceType : ""}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3">
          <Price price={product.price} salePrice={product.salePrice} prefix={product.hasVariants ? "From" : undefined} />
          {product.reviewCount > 0 && <RatingStars rating={product.rating} count={product.reviewCount} size="xs" />}
        </div>
        <div className="mt-4 lg:hidden">
          <AddToCartButton product={product} size="sm" appearance="secondary" className="w-full rounded-full" />
        </div>
      </div>
    </article>
  );
}

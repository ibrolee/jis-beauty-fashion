"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { Product, ProductVariant } from "@/db/schema";
import { effectivePrice, isOnSale } from "@/lib/utils";

type Props = {
  product: Product & { brandName?: string | null; hasVariants?: boolean };
  /** Selected size/volume variant (product page). */
  variant?: ProductVariant | null;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  appearance?: "primary" | "secondary" | "white";
  className?: string;
  label?: string;
  /** Add to cart then go straight to checkout. */
  buyNow?: boolean;
};

export function AddToCartButton({ product, variant = null, quantity = 1, size = "md", appearance = "primary", className, label, buyNow = false }: Props) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const stock = variant ? variant.stock : product.stock;
  const soldOut = stock <= 0;
  const needsSelection = Boolean(product.hasVariants) && !variant;

  function handleClick() {
    if (needsSelection) {
      router.push(`/product/${product.slug}`);
      return;
    }
    const priceSource = variant ?? product;
    addItem(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        slug: product.slug,
        name: product.name,
        variantName: variant?.name ?? null,
        brandName: product.brandName ?? null,
        image: product.images[0] ?? "",
        price: effectivePrice(priceSource),
        compareAtPrice: isOnSale(priceSource) ? priceSource.price : null,
        maxStock: stock,
      },
      quantity,
    );
    if (buyNow) {
      router.push("/checkout");
      return;
    }
    toast(`${product.name}${variant ? ` (${variant.name})` : ""} added to your bag`, { action: { label: "View bag", href: "/cart" } });
  }

  return (
    <Button type="button" onClick={handleClick} disabled={soldOut} size={size} variant={appearance} className={className} aria-label={soldOut ? `${product.name} is sold out` : undefined}>
      {!buyNow && <ShoppingBag className="h-4 w-4" aria-hidden />}
      {soldOut ? "Sold out" : (label ?? (needsSelection ? "Select size" : buyNow ? "Buy now" : "Add to bag"))}
    </Button>
  );
}

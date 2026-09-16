"use client";

import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  productName,
  className,
  withLabel = false,
}: {
  productId: number;
  productName: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { has, toggle, hydrated } = useWishlist();
  const { toast } = useToast();
  const active = hydrated && has(productId);

  function onClick() {
    const added = toggle(productId);
    toast(added ? `${productName} saved to your wishlist` : `${productName} removed from your wishlist`, {
      kind: "info",
      action: added ? { label: "View", href: "/wishlist" } : undefined,
    });
  }

  if (withLabel) {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={cn("inline-flex h-12 items-center gap-2 border border-line px-4 text-xs font-medium uppercase tracking-[0.16em] transition-colors hover:border-ink", className)}>
        <Heart className={cn("h-4 w-4", active && "fill-rosewood text-rosewood")} strokeWidth={1.5} />
        {active ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
      className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:text-rosewood", className)}
    >
      <Heart className={cn("h-[18px] w-[18px] transition-colors", active && "fill-rosewood text-rosewood")} strokeWidth={1.5} />
    </button>
  );
}

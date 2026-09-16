"use client";

import { Heart, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProductListItem } from "@/types";
import { useWishlist } from "./wishlist-provider";

export function WishlistView() {
  const { ids, hydrated } = useWishlist();
  const [fetched, setFetched] = useState<ProductListItem[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const idsKey = ids.join(",");

  useEffect(() => {
    if (!hydrated || !idsKey) return;
    let cancelled = false;
    fetch(`/api/products?ids=${idsKey}`)
      .then((r) => {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
      .then((data: { items: ProductListItem[] }) => {
        if (cancelled) return;
        setError(false);
        setFetched(data.items);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey, hydrated, attempt]);

  // Display list derived from wishlist ids so removals reflect instantly
  const products = useMemo(() => {
    if (!ids.length) return [];
    if (!fetched) return null;
    const order = new Map(ids.map((id, i) => [id, i]));
    return fetched.filter((p) => order.has(p.id)).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [ids, fetched]);

  if (error && !fetched) {
    return (
      <EmptyState icon={WifiOff} title="Couldn't load your wishlist" description="Check your internet connection and try again." action={<Button type="button" onClick={() => setAttempt((a) => a + 1)}>Try again</Button>} />
    );
  }

  if (!hydrated || products === null) {
    return (
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4" aria-busy>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/5] animate-pulse bg-ivory" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it here. Log in to keep your wishlist across devices."
        action={
          <>
            <ButtonLink href="/shop">Discover fragrances</ButtonLink>
            <ButtonLink href="/shop?newArrivals=1" variant="secondary">
              New arrivals
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-stone">{products.length} saved item{products.length === 1 ? "" : "s"}</p>
      <ProductGrid products={products} />
    </>
  );
}

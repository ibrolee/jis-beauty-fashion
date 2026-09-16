"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Wishlist: stored in localStorage for guests and synced to the `wishlists`
 * table (via /api/wishlist) for signed-in customers.
 */
const STORAGE_KEY = "jis_wishlist_v1";

type WishlistContextValue = {
  ids: number[];
  hydrated: boolean;
  has: (productId: number) => boolean;
  toggle: (productId: number) => boolean;
  remove: (productId: number) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children, isAuthenticated }: { children: ReactNode; isAuthenticated: boolean }) {
  const [ids, setIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let local: number[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      local = raw ? (JSON.parse(raw) as number[]).filter((n) => Number.isInteger(n)) : [];
    } catch {
      local = [];
    }
    // Hydrating from localStorage must happen after mount to avoid an SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(local);
    setHydrated(true);

    if (!isAuthenticated) return;
    // Merge local + server wishlist for signed-in users
    fetch("/api/wishlist", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: local }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { ids?: number[] } | null) => {
        if (data?.ids) setIds(data.ids);
      })
      .catch(() => undefined);
  }, [isAuthenticated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids, hydrated]);

  const sync = useCallback(
    (productId: number, method: "POST" | "DELETE") => {
      if (!isAuthenticated) return;
      fetch("/api/wishlist", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) }).catch(() => undefined);
    },
    [isAuthenticated],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      hydrated,
      has: (id) => ids.includes(id),
      toggle: (id) => {
        const exists = ids.includes(id);
        setIds((prev) => (exists ? prev.filter((x) => x !== id) : [...prev, id]));
        sync(id, exists ? "DELETE" : "POST");
        return !exists;
      },
      remove: (id) => {
        setIds((prev) => prev.filter((x) => x !== id));
        sync(id, "DELETE");
      },
    }),
    [ids, hydrated, sync],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

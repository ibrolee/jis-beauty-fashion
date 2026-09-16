"use client";

import { Heart, LayoutDashboard, Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { cn } from "@/lib/utils";

const POPULAR = ["Oud", "Vanilla", "Rose", "Musk", "Perfume oil", "Gift"];

function CountBubble({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const iconBtn = "relative flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-rosewood";

export function HeaderActions({ isAuthenticated, isAdmin }: { isAuthenticated: boolean; isAdmin?: boolean }) {
  const { itemCount, hydrated } = useCart();
  const wishlist = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close the search panel on navigation (state adjustment during render, per React docs)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [searchOpen]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <div className="flex items-center">
        <button type="button" onClick={() => setSearchOpen((v) => !v)} className={iconBtn} aria-label="Search" aria-expanded={searchOpen}>
          <Search className="h-5 w-5" strokeWidth={1.5} />
        </button>
        {isAdmin && (
          <Link href="/admin" className={cn(iconBtn, "hidden lg:flex")} aria-label="Admin dashboard" title="Admin dashboard">
            <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        )}
        <Link href={isAuthenticated ? "/account" : "/login"} className={cn(iconBtn, "hidden lg:flex")} aria-label={isAuthenticated ? "My account" : "Log in"}>
          <User className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <Link href="/wishlist" className={cn(iconBtn, "hidden lg:flex")} aria-label={`Wishlist, ${wishlist.ids.length} items`}>
          <Heart className="h-5 w-5" strokeWidth={1.5} />
          {wishlist.hydrated && <CountBubble count={wishlist.ids.length} />}
        </Link>
        <Link href="/cart" className={iconBtn} aria-label={`Shopping bag, ${itemCount} items`}>
          <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          {hydrated && <CountBubble count={itemCount} />}
        </Link>
      </div>

      {/* Search panel */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-line bg-white shadow-soft animate-fade-in">
          <div className="container-x py-5 sm:py-7">
            <form onSubmit={submit} role="search" className="flex items-center gap-3 border-b border-ink pb-3">
              <Search className="h-5 w-5 shrink-0 text-stone" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search perfumes, notes, brands…"
                aria-label="Search products"
                className="h-10 flex-1 bg-transparent font-serif text-xl text-ink placeholder:text-mist focus:outline-none sm:text-2xl"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-stone hover:text-ink" aria-label="Close search">
                <X className="h-5 w-5" />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1">Popular</span>
              {POPULAR.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(`/search?q=${encodeURIComponent(term)}`);
                  }}
                  className="border border-line px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {searchOpen && <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="fixed inset-0 top-0 z-30 cursor-default bg-ink/20" />}
    </>
  );
}

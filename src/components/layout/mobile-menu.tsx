"use client";

import { ChevronRight, Heart, LayoutDashboard, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import type { SessionUser } from "@/lib/auth/session";
import { SITE } from "@/lib/constants";
import type { CategoryWithCount } from "@/types";
import { Logo } from "./logo";

export function MobileMenu({ categories, user }: { categories: CategoryWithCount[]; user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation (state adjustment during render, per React docs)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const secondary = [
    { label: "About JIS", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="-ml-2 flex h-11 w-11 items-center justify-center text-ink" aria-label="Open menu" aria-expanded={open}>
        <Menu className="h-6 w-6" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-ink/40 animate-fade-in" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-soft animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} className="-mr-2 flex h-11 w-11 items-center justify-center" aria-label="Close menu">
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
              <p className="eyebrow mb-3">Shop</p>
              <ul className="divide-y divide-line border-y border-line">
                <li>
                  <Link href="/shop" className="flex h-14 items-center justify-between font-serif text-xl">
                    Shop All <ChevronRight className="h-4 w-4 text-stone" />
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/shop/${c.slug}`} className="flex h-14 items-center justify-between font-serif text-xl">
                      {c.name} <ChevronRight className="h-4 w-4 text-stone" />
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="mt-6 space-y-1">
                {secondary.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block py-2.5 text-sm text-ink-soft">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-1 border-t border-line pt-6">
                <Link href={user ? "/account" : "/login"} className="flex h-12 items-center gap-3 text-sm">
                  <User className="h-5 w-5" strokeWidth={1.5} /> {user ? `Hi, ${user.firstName}` : "Log in / Register"}
                </Link>
                <Link href="/wishlist" className="flex h-12 items-center gap-3 text-sm">
                  <Heart className="h-5 w-5" strokeWidth={1.5} /> Wishlist
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin" className="flex h-12 items-center gap-3 text-sm">
                    <LayoutDashboard className="h-5 w-5" strokeWidth={1.5} /> Admin dashboard
                  </Link>
                )}
              </div>
            </nav>

            <div className="flex items-center gap-5 border-t border-line px-5 py-4">
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ink-soft"><InstagramIcon className="h-5 w-5" /></a>
              <a href={SITE.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-ink-soft"><TikTokIcon className="h-5 w-5" /></a>
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-ink-soft"><WhatsAppIcon className="h-5 w-5" /></a>
              <span className="ml-auto text-[11px] uppercase tracking-[0.18em] text-stone">@{SITE.instagram}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

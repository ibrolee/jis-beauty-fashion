"use client";

import { ChevronRight, Heart, LayoutDashboard, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import type { SessionUser } from "@/lib/auth/session";
import { DEFAULT_WEBSITE_CONTENT, brandLinks, navigationLinks, type WebsiteContent } from "@/lib/website-content";
import type { CategoryWithCount } from "@/types";
import { Logo } from "./logo";

export function MobileMenu({ categories, user, website = DEFAULT_WEBSITE_CONTENT }: { categories: CategoryWithCount[]; user: SessionUser | null; website?: WebsiteContent }) {
  const links = navigationLinks(website, categories);
  const SITE = brandLinks(website.brand);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  const drawer = open ? (
    <div className="fixed inset-0 z-[9999] lg:hidden" role="presentation">
      <button type="button" aria-label="Close mobile navigation" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/55" />
      <aside ref={dialogRef} role="dialog" aria-modal="true" aria-label="Mobile navigation" className="absolute inset-y-0 left-0 flex w-[88vw] max-w-[390px] flex-col overflow-hidden bg-cream shadow-2xl">
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-line px-5">
          <Logo brand={website.brand} onClick={() => setOpen(false)} />
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center text-ink" aria-label="Close menu"><X className="h-6 w-6" strokeWidth={1.5} /></button>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile site navigation">
          <p className="eyebrow mb-3">Shop</p>
          <ul className="divide-y divide-line border-y border-line">
            {links.map((link) => (
              <li key={link.href}><Link href={link.href} onClick={() => setOpen(false)} className="flex min-h-14 items-center justify-between font-serif text-xl"><span>{link.label}</span><ChevronRight className="h-4 w-4 text-stone" strokeWidth={1.5} aria-hidden="true" /></Link></li>
            ))}
          </ul>
          <div className="mt-7 space-y-1 border-t border-line pt-6">
            <Link href={user ? "/account" : "/login"} onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 text-sm"><User className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />{user ? `Hi, ${user.firstName}` : "Log in / Register"}</Link>
            <Link href="/wishlist" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 text-sm"><Heart className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />Wishlist</Link>
            {user?.role === "admin" && <Link href="/admin" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 text-sm"><LayoutDashboard className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />Admin dashboard</Link>}
          </div>
        </nav>
        <div className="flex shrink-0 items-center gap-5 border-t border-line px-5 py-4">
          {SITE.instagramUrl && <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ink-soft"><InstagramIcon className="h-5 w-5" /></a>}
          {SITE.tiktokUrl && <a href={SITE.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-ink-soft"><TikTokIcon className="h-5 w-5" /></a>}
          {SITE.whatsappUrl && <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-ink-soft"><WhatsAppIcon className="h-5 w-5" /></a>}
          <span className="ml-auto truncate text-[10px] uppercase tracking-[0.14em] text-stone">@{SITE.instagram}</span>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="-ml-2 flex h-11 w-11 items-center justify-center text-ink lg:hidden" aria-label="Open menu" aria-expanded={open} aria-haspopup="dialog"><Menu className="h-6 w-6" strokeWidth={1.5} /></button>
      {open && typeof document !== "undefined" ? createPortal(drawer, document.body) : null}
    </>
  );
}

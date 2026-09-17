"use client";

import {
  ChevronRight,
  Heart,
  LayoutDashboard,
  Menu,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/ui/social-icons";
import type { SessionUser } from "@/lib/auth/session";
import { SITE } from "@/lib/constants";
import type { CategoryWithCount } from "@/types";
import { Logo } from "./logo";

export function MobileMenu({
  categories,
  user,
}: {
  categories: CategoryWithCount[];
  user: SessionUser | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const secondary = [
    { label: "About JIS", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Contact", href: "/contact" },
  ];

  const drawer = open ? (
    <div
      className="fixed inset-0 z-[9999] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/45"
      />

      {/* DRAWER */}
      <aside className="absolute inset-y-0 left-0 flex w-[88vw] max-w-[390px] flex-col overflow-hidden bg-white shadow-2xl">
        {/* DRAWER HEADER */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-line px-5">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center"
          >
            <Logo />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center text-ink"
            aria-label="Close menu"
          >
            <X
              className="h-6 w-6"
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav
          className="min-h-0 flex-1 overflow-y-auto px-5 py-6"
          aria-label="Mobile navigation"
        >
          <p className="eyebrow mb-3">
            Shop
          </p>

          <ul className="divide-y divide-line border-y border-line">
            <li>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center justify-between font-serif text-xl"
              >
                <span>Shop All</span>

                <ChevronRight
                  className="h-4 w-4 text-stone"
                  strokeWidth={1.5}
                />
              </Link>
            </li>

            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop/${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center justify-between font-serif text-xl"
                >
                  <span>{category.name}</span>

                  <ChevronRight
                    className="h-4 w-4 text-stone"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* SECONDARY LINKS */}
          <ul className="mt-7 space-y-1">
            {secondary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm text-ink-soft"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ACCOUNT LINKS */}
          <div className="mt-7 space-y-1 border-t border-line pt-6">
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 text-sm"
            >
              <User
                className="h-5 w-5"
                strokeWidth={1.5}
              />

              {user
                ? `Hi, ${user.firstName}`
                : "Log in / Register"}
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 text-sm"
            >
              <Heart
                className="h-5 w-5"
                strokeWidth={1.5}
              />

              Wishlist
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 text-sm"
              >
                <LayoutDashboard
                  className="h-5 w-5"
                  strokeWidth={1.5}
                />

                Admin dashboard
              </Link>
            )}
          </div>
        </nav>

        {/* SOCIAL FOOTER */}
        <div className="flex shrink-0 items-center gap-5 border-t border-line px-5 py-4">
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-ink-soft"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>

          <a
            href={SITE.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-ink-soft"
          >
            <TikTokIcon className="h-5 w-5" />
          </a>

          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-ink-soft"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>

          <span className="ml-auto truncate text-[10px] uppercase tracking-[0.14em] text-stone">
            @{SITE.instagram}
          </span>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      {/* MENU BUTTON */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-ml-2 flex h-11 w-11 items-center justify-center text-ink lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu
          className="h-6 w-6"
          strokeWidth={1.5}
        />
      </button>

      {/* RENDER DRAWER DIRECTLY INTO BODY */}
      {mounted && open
        ? createPortal(drawer, document.body)
        : null}
    </>
  );
}
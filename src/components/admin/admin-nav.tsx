"use client";

import {
  ChevronDown,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquareText,
  Package,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MAIN_NAV } from "@/lib/constants";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/content", label: "Site content", icon: LayoutTemplate },
];

export function AdminNav() {
  const pathname = usePathname();
  const [mainOpen, setMainOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <nav aria-label="Admin navigation" className="w-full min-w-0">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setMainOpen((open) => !open)}
          aria-expanded={mainOpen}
          className="flex h-12 w-full items-center justify-between border-b border-line px-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-ink"
        >
          <span>Main navigation</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              mainOpen && "rotate-180"
            )}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>

        {mainOpen && (
          <ul className="w-full space-y-1">
            {MAIN_NAV.map(({ href, label }) => {
              const active = pathname === href;

              return (
                <li key={href} className="w-full min-w-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 w-full min-w-0 items-center px-3 text-sm transition-colors",
                      active
                        ? "bg-ink text-white"
                        : "text-ink-soft hover:bg-ivory"
                    )}
                  >
                    <span className="min-w-0 truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setAdminOpen((open) => !open)}
          aria-expanded={adminOpen}
          className="flex h-12 w-full items-center justify-between border-b border-line px-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-ink"
        >
          <span>Admin navigation</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              adminOpen && "rotate-180"
            )}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>

        {adminOpen && (
          <ul className="w-full space-y-1">
            {ADMIN_LINKS.map(({ href, label, icon: Icon, exact }) => {
              const active = exact
                ? pathname === href
                : pathname.startsWith(href);

              return (
                <li key={href} className="w-full min-w-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 w-full min-w-0 items-center gap-3 px-3 text-sm transition-colors",
                      active
                        ? "bg-ink text-white"
                        : "text-ink-soft hover:bg-ivory"
                    )}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span className="min-w-0 truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}

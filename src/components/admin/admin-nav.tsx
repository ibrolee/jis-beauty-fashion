"use client";

import {
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
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: Tag,
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: Users,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: MessageSquareText,
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: Inbox,
  },
  {
    href: "/admin/content",
    label: "Homepage content",
    icon: LayoutTemplate,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="w-full min-w-0">
      <ul className="flex w-full min-w-0 flex-col gap-1">
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
                  "flex h-11 w-full min-w-0 items-center gap-3 px-3 text-sm transition-colors",
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
    </nav>
  );
}
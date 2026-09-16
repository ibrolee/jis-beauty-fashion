"use client";

import { FolderTree, Inbox, LayoutDashboard, LayoutTemplate, MessageSquareText, Package, ShoppingCart, Tag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/content", label: "Homepage content", icon: LayoutTemplate },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-4 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {ADMIN_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-10 items-center gap-3 whitespace-nowrap px-3 text-sm transition-colors", active ? "bg-ink text-white" : "text-ink-soft hover:bg-ivory")}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

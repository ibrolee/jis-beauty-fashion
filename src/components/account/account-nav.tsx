"use client";

import { Heart, LogOut, MapPin, Package, User, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-11 items-center gap-3 border-b-2 px-3 text-sm transition-colors lg:border-b-0 lg:border-l-2 lg:px-4", active ? "border-ink text-ink" : "border-transparent text-stone hover:text-ink")}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0">
          <form action={logoutAction}>
            <button type="submit" className="flex h-11 items-center gap-3 border-b-2 border-transparent px-3 text-sm text-stone transition-colors hover:text-ink lg:border-b-0 lg:border-l-2 lg:px-4">
              <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Log out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}

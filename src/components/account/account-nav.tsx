"use client";

import { Heart, LogOut, MapPin, Package, User, LayoutGrid, ArrowUpRight } from "lucide-react";
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
    <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4 no-scrollbar lg:sticky lg:top-36 lg:mx-0 lg:overflow-visible lg:border lg:border-line lg:bg-cream lg:p-4">
      <p className="eyebrow mb-3 hidden px-3 pt-3 lg:block">Your account</p>
      <ul className="flex gap-1 border-b border-line pb-2 lg:flex-col lg:border-0 lg:pb-0">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-h-12 items-center gap-3 whitespace-nowrap border-b-2 px-3 text-sm transition-colors lg:border-b-0 lg:px-4", active ? "border-rosewood bg-ivory text-ink lg:bg-ivory" : "border-transparent text-stone hover:bg-ivory hover:text-ink")}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {active && <ArrowUpRight className="hidden h-3.5 w-3.5 lg:block" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 lg:mt-3 lg:border-t lg:border-line lg:pt-3">
          <form action={logoutAction}>
            <button type="submit" className="flex min-h-12 w-full items-center gap-3 whitespace-nowrap border-b-2 border-transparent px-3 text-sm text-stone transition-colors hover:bg-ivory hover:text-ink lg:border-0 lg:px-4">
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              Log out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}

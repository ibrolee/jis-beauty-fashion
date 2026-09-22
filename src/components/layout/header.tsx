import Link from "next/link";
import type { SessionUser } from "@/lib/auth/session";
import { MAIN_NAV } from "@/lib/constants";
import type { CategoryWithCount } from "@/types";
import { HeaderActions } from "./header-actions";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export function Header({ user, categories }: { user: SessionUser | null; categories: CategoryWithCount[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 shadow-[0_4px_20px_-18px_rgba(23,21,17,0.4)] backdrop-blur-xl supports-[backdrop-filter]:bg-cream/90">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>

      <div className="container-x grid h-[70px] grid-cols-[1fr_auto_1fr] items-center gap-2 lg:h-[82px]">
        <div className="flex min-w-0 items-center lg:hidden">
          <MobileMenu categories={categories} user={user} />
        </div>
        <div className="hidden min-w-0 items-center lg:flex">
          <span className="border-l border-rosewood/60 pl-3 text-[10px] font-medium uppercase leading-[1.7] tracking-[0.2em] text-stone">
            The fragrance edit<br />Curated in Lagos
          </span>
        </div>

        <div className="flex justify-center">
          <Logo className="shrink-0" />
        </div>

        <div className="flex min-w-0 items-center justify-end">
          <HeaderActions isAuthenticated={Boolean(user)} isAdmin={user?.role === "admin"} />
        </div>
      </div>

      <nav aria-label="Main" className="hidden border-t border-line/70 lg:block">
        <ul className="container-x flex min-h-[43px] items-center justify-center gap-6 xl:gap-10">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group relative inline-flex min-h-[43px] items-center whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.19em] text-ink-soft transition-colors hover:text-rosewood focus-visible:text-rosewood"
              >
                {item.label}
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] origin-center scale-x-0 bg-rosewood transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

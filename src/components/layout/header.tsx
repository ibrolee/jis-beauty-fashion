import Link from "next/link";
import type { SessionUser } from "@/lib/auth/session";
import { MAIN_NAV } from "@/lib/constants";
import type { CategoryWithCount } from "@/types";
import { HeaderActions } from "./header-actions";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export function Header({ user, categories }: { user: SessionUser | null; categories: CategoryWithCount[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[76px]">
        {/* Mobile: hamburger */}
        <div className="flex w-20 items-center lg:hidden">
          <MobileMenu categories={categories} user={user} />
        </div>

        {/* Logo */}
        <div className="flex flex-1 justify-center lg:flex-none lg:justify-start">
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform hover:after:scale-x-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex w-20 justify-end lg:w-auto">
          <HeaderActions isAuthenticated={Boolean(user)} isAdmin={user?.role === "admin"} />
        </div>
      </div>
    </header>
  );
}

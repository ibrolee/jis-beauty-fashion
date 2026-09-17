import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/layout/logo";
import { logoutAction } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · JIS Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Admin area — protected by role (see requireAdmin).
 * Every page under /admin inherits this check, and every
 * mutation re-checks inside its server action.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-hidden bg-cream">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 min-w-0 max-w-[1500px] items-center justify-between gap-3 px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Logo />

            <span className="hidden border-l border-line pl-4 text-[11px] font-medium uppercase tracking-[0.2em] text-stone sm:inline">
              Store manager
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3 text-sm sm:gap-4">
            <Link
              href="/"
              className="text-xs font-medium uppercase tracking-[0.16em] underline underline-offset-4"
            >
              View store
            </Link>

            <span className="hidden text-stone sm:inline">
              {admin.firstName}
            </span>

            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-medium uppercase tracking-[0.16em] text-stone hover:text-ink"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full min-w-0 max-w-[1500px] flex-1 gap-6 px-3 py-5 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <AdminNav />
        </aside>

        <main className="min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
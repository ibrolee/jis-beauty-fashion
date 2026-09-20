import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { requireUser } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/account");

  return (
    <div className="pb-20 lg:pb-28">
      <header className="border-b border-line bg-ivory py-12 sm:py-16 lg:py-20">
        <div className="container-x flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-5">Your world of JIS / My account</p>
            <h1 className="font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">Welcome back, <span className="italic text-rosewood">{user.firstName}.</span></h1>
          </div>
          <p className="max-w-full break-all border-t border-line pt-3 text-xs text-stone sm:border-0 sm:pt-0">{user.email}</p>
        </div>
      </header>
      <div className="container-x mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
        <aside className="lg:col-span-3">
          <AccountNav />
        </aside>
        <main className="min-w-0 lg:col-span-9" aria-label="Account content">{children}</main>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { requireUser } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/account");

  return (
    <div className="container-x py-10 lg:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow mb-2">My account</p>
          <h1 className="font-serif text-4xl">Hello, {user.firstName}</h1>
        </div>
        <p className="text-sm text-stone">{user.email}</p>
      </header>
      <div className="grid gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <AccountNav />
        </aside>
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}

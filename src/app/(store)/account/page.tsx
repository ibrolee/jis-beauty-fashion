import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/orders/order-details";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/data/orders";
import { getUserAddresses } from "@/lib/data/users";
import { formatDate, formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountOverviewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const [{ error }, orders, addresses] = await Promise.all([searchParams, getOrdersForUser(user.id), getUserAddresses(user.id)]);
  const recent = orders.slice(0, 3);
  const totalSpent = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-10">
      {error === "forbidden" && <p className="border border-sale/30 bg-red-50 px-4 py-3 text-sm text-sale">You don’t have permission to access that page.</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Orders", String(orders.length)],
          ["Total spent", formatNaira(totalSpent)],
          ["Saved addresses", String(addresses.length)],
        ].map(([label, value]) => (
          <div key={label} className="border border-line p-5">
            <p className="eyebrow">{label}</p>
            <p className="mt-2 font-serif text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-heading" className="font-serif text-2xl">Recent orders</h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em]">
              All orders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        {recent.length ? (
          <ul className="divide-y divide-line border-y border-line">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.orderNumber}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-cream">
                  <div>
                    <p className="text-sm font-medium">{o.orderNumber}</p>
                    <p className="text-xs text-stone">
                      {formatDate(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={o.status} />
                    <span className="text-sm font-medium tabular-nums">{formatNaira(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-dashed border-line p-8 text-center">
            <p className="text-sm text-stone">You haven’t placed any orders yet.</p>
            <ButtonLink href="/shop" variant="secondary" className="mt-4">
              Start shopping
            </ButtonLink>
          </div>
        )}
      </section>
    </div>
  );
}

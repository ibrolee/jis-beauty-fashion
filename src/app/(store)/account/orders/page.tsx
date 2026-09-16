import { Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/order-details";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/data/orders";
import { formatDate, formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await getOrdersForUser(user.id);

  if (!orders.length) {
    return <EmptyState icon={Package} title="No orders yet" description="When you place an order it will show up here with live status updates." action={<ButtonLink href="/shop">Browse fragrances</ButtonLink>} className="py-12" />;
  }

  return (
    <div>
      <h2 className="mb-4 font-serif text-2xl">Order history</h2>
      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="border border-line p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-xs text-stone">Placed {formatDate(o.createdAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PaymentStatusBadge status={o.paymentStatus} />
                <OrderStatusBadge status={o.status} />
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{o.items.map((i) => `${i.name}${i.variantName ? ` (${i.variantName})` : ""} × ${i.quantity}`).join(", ")}</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="font-medium tabular-nums">{formatNaira(o.total)}</p>
              <Link href={`/account/orders/${o.orderNumber}`} className="text-xs font-medium uppercase tracking-[0.16em] underline underline-offset-4">
                View details
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

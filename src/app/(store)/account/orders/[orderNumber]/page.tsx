import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderItemsList, OrderMeta, OrderStatusTracker, OrderTotals } from "@/components/orders/order-details";
import { RetryPaymentButton } from "@/components/orders/retry-payment-button";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { SITE } from "@/lib/constants";
import { getOrderForUser } from "@/lib/data/orders";
import { isOnlinePaymentEnabled } from "@/lib/payments";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function AccountOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const user = await requireUser(`/account/orders/${orderNumber}`);
  const order = await getOrderForUser(orderNumber, user.id);
  if (!order) notFound();

  const unpaid = order.paymentStatus !== "paid" && order.status !== "cancelled";

  return (
    <div className="space-y-8">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em]">
        <ChevronLeft className="h-3.5 w-3.5" /> All orders
      </Link>
      <div>
        <p className="eyebrow">Order</p>
        <h2 className="mt-1 font-serif text-3xl">{order.orderNumber}</h2>
      </div>

      <OrderStatusTracker status={order.status} />

      {unpaid && (
        <div className="flex flex-col gap-3 border border-line bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-soft">This order is awaiting payment. Complete payment to have it processed.</p>
          <div className="flex gap-2">
            {isOnlinePaymentEnabled() && <RetryPaymentButton orderNumber={order.orderNumber} />}
            <ButtonLink href={`${SITE.whatsappUrl}?text=${encodeURIComponent(`Hello JIS, regarding my order ${order.orderNumber}`)}`} variant="secondary">
              WhatsApp us
            </ButtonLink>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="border-y border-line lg:col-span-3">
          <OrderItemsList items={order.items} />
        </div>
        <div className="border border-line p-5 lg:col-span-2">
          <OrderTotals order={order} />
        </div>
      </div>

      <OrderMeta order={order} />
    </div>
  );
}

import { AlertTriangle, CheckCircle2, Clock, Copy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderItemsList, OrderMeta, OrderStatusTracker, OrderTotals } from "@/components/orders/order-details";
import { RetryPaymentButton } from "@/components/orders/retry-payment-button";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { SITE } from "@/lib/constants";
import { getOrderByNumber } from "@/lib/data/orders";
import { BANK_TRANSFER_DETAILS, isOnlinePaymentEnabled } from "@/lib/payments";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

type Props = { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ payment?: string }> };

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const [{ orderNumber }, { payment }, user] = await Promise.all([params, searchParams, getCurrentUser()]);
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const paid = order.paymentStatus === "paid";
  const failed = payment === "failed" || order.paymentStatus === "failed";
  const cancelled = order.status === "cancelled";
  const whatsappMessage = encodeURIComponent(`Hello JIS, I've placed order ${order.orderNumber} (${formatNaira(order.total)}). ${order.paymentMethod === "bank_transfer" ? "Here is my proof of payment." : ""}`);

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        {/* Status header */}
        <header className="border-b border-line pb-8 text-center">
          {cancelled ? (
            <AlertTriangle className="mx-auto h-10 w-10 text-sale" strokeWidth={1.25} />
          ) : paid ? (
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" strokeWidth={1.25} />
          ) : failed ? (
            <AlertTriangle className="mx-auto h-10 w-10 text-sale" strokeWidth={1.25} />
          ) : (
            <Clock className="mx-auto h-10 w-10 text-ink" strokeWidth={1.25} />
          )}
          <p className="eyebrow mt-5">Order {order.orderNumber}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            {cancelled ? "This order was cancelled" : paid ? `Thank you, ${order.firstName}!` : failed ? "Payment didn't go through" : "Order received"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-stone">
            {cancelled
              ? "If you have any questions about this order, reach us on WhatsApp and we'll help right away."
              : paid
                ? `Your payment was confirmed and we're preparing your order. A confirmation has been sent to ${order.email}.`
                : failed
                  ? "Your order has been saved but we couldn't confirm the payment. You can try again or switch to bank transfer — your items stay reserved."
                  : order.paymentMethod === "bank_transfer"
                    ? "Complete your bank transfer to confirm the order. Your items are reserved for 24 hours."
                    : order.paymentMethod === "pay_on_delivery"
                      ? "We'll confirm your order shortly and you can pay when it arrives."
                      : "We're confirming your payment. This page will update once it's confirmed."}
          </p>
        </header>

        {/* Payment instructions */}
        {!paid && !cancelled && (
          <section className="mt-8 border border-line bg-cream p-6" aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="font-serif text-2xl">
              {failed ? "Complete your payment" : order.paymentMethod === "bank_transfer" ? "Bank transfer details" : "Next steps"}
            </h2>

            {(order.paymentMethod === "bank_transfer" || failed) && (
              <div className="mt-4 space-y-4">
                {BANK_TRANSFER_DETAILS.configured ? (
                  <dl className="grid gap-3 text-sm sm:grid-cols-3">
                    <div><dt className="text-stone">Bank</dt><dd className="font-medium">{BANK_TRANSFER_DETAILS.bankName}</dd></div>
                    <div><dt className="text-stone">Account name</dt><dd className="font-medium">{BANK_TRANSFER_DETAILS.accountName}</dd></div>
                    <div><dt className="text-stone">Account number</dt><dd className="flex items-center gap-2 font-medium tabular-nums">{BANK_TRANSFER_DETAILS.accountNumber} <Copy className="h-3.5 w-3.5 text-stone" aria-hidden /></dd></div>
                  </dl>
                ) : (
                  <p className="text-sm text-ink-soft">
                    Our account details will be sent to you on WhatsApp and by email within a few minutes. You can also message us directly to receive them instantly.
                  </p>
                )}
                <p className="text-sm text-ink-soft">
                  Transfer exactly <span className="font-medium">{formatNaira(order.total)}</span> and use <span className="font-medium">{order.orderNumber}</span> as the narration, then send your proof of payment on WhatsApp.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {(failed || order.paymentMethod === "paystack") && isOnlinePaymentEnabled() && <RetryPaymentButton orderNumber={order.orderNumber} />}
              <ButtonLink href={`${SITE.whatsappUrl}?text=${whatsappMessage}`} variant={failed && isOnlinePaymentEnabled() ? "secondary" : "primary"} size="lg">
                Send proof on WhatsApp
              </ButtonLink>
            </div>
          </section>
        )}

        {/* Tracker */}
        <section className="mt-10" aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="sr-only">Order progress</h2>
          <OrderStatusTracker status={order.status} />
        </section>

        {/* Details */}
        <section className="mt-10 grid gap-10 lg:grid-cols-5" aria-labelledby="details-heading">
          <div className="lg:col-span-3">
            <h2 id="details-heading" className="font-serif text-2xl">Items</h2>
            <div className="mt-3 border-y border-line">
              <OrderItemsList items={order.items} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl">Summary</h2>
            <div className="mt-3 border border-line p-5">
              <OrderTotals order={order} />
            </div>
          </div>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <OrderMeta order={order} />
        </section>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <ButtonLink href="/shop" variant="secondary">
            Continue shopping
          </ButtonLink>
          {user ? (
            <Link href="/account/orders" className="text-xs font-medium uppercase tracking-[0.16em] underline underline-offset-4">
              View all my orders
            </Link>
          ) : (
            <p className="text-sm text-stone">
              <Link href={`/register?next=/order/${order.orderNumber}`} className="text-ink underline underline-offset-4">Create an account</Link> to track this order and check out faster next time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

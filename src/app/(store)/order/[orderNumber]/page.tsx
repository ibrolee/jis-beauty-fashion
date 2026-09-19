import { AlertTriangle, CheckCircle2, Clock, Copy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderItemsList, OrderMeta, OrderStatusTracker, OrderTotals } from "@/components/orders/order-details";
import { TransferSubmissionButton } from "@/components/orders/transfer-submission-button";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { SITE } from "@/lib/constants";
import { getOrderByNumber } from "@/lib/data/orders";
import { BANK_TRANSFER_DETAILS } from "@/lib/payments";
import { bankTransferDeadline } from "@/lib/orders/reservations";
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
  const bankTransfer = order.paymentMethod === "bank_transfer";
  const deadline = bankTransferDeadline(order.createdAt);
  const submitted = order.payments?.some((entry) => entry.channel === "transfer_submitted") ?? false;
  const whatsappMessage = encodeURIComponent(
    cancelled ? `Hello JIS, I need help with cancelled order ${order.orderNumber} (${formatNaira(order.total)}).` :
    bankTransfer ? `Hello JIS, I need help with bank transfer for order ${order.orderNumber} (${formatNaira(order.total)}). Please help me verify my payment.` :
    `Hello JIS, I placed order ${order.orderNumber} (${formatNaira(order.total)}). Please send me your bank account details so I can pay now.`,
  );

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-line pb-8 text-center">
          {cancelled ? <AlertTriangle className="mx-auto h-10 w-10 text-sale" strokeWidth={1.25} /> : paid ? <CheckCircle2 className="mx-auto h-10 w-10 text-success" strokeWidth={1.25} /> : failed ? <AlertTriangle className="mx-auto h-10 w-10 text-sale" strokeWidth={1.25} /> : <Clock className="mx-auto h-10 w-10 text-ink" strokeWidth={1.25} />}
          <p className="eyebrow mt-5">Order {order.orderNumber}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{cancelled ? "This order was cancelled" : paid ? `Thank you, ${order.firstName}!` : failed ? "Payment needs attention" : submitted ? "Transfer submitted" : "Order received"}</h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-stone">
            {cancelled ? "This reservation has been cancelled. Contact us if you transferred money or need assistance." : paid ? "Your payment was verified and we are preparing your order." : submitted ? "We have recorded your transfer submission. Your payment is not confirmed until we verify receipt; delivery begins only after verification." : bankTransfer ? "Transfer the exact amount below, then select ‘I have transferred the amount’. We verify payment before preparing delivery. Unconfirmed orders are cancelled after six hours." : "Contact us on WhatsApp with your order reference and request account details to pay now. Payment must be verified before delivery begins."}
          </p>
        </header>

        {!paid && !cancelled && (
          <section className="mt-8 border border-line bg-cream p-6" aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="font-serif text-2xl">{bankTransfer ? "Bank transfer details" : "Pay instantly on WhatsApp"}</h2>
            <p className="mt-3 text-sm font-medium text-ink">Payment deadline: {deadline.toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })} (Lagos time).</p>
            {bankTransfer ? (
              <div className="mt-4 space-y-5">
                {BANK_TRANSFER_DETAILS.configured ? (
                  <dl className="grid gap-3 text-sm sm:grid-cols-3">
                    <div><dt className="text-stone">Bank</dt><dd className="font-medium">{BANK_TRANSFER_DETAILS.bankName}</dd></div>
                    <div><dt className="text-stone">Account name</dt><dd className="font-medium">{BANK_TRANSFER_DETAILS.accountName}</dd></div>
                    <div><dt className="text-stone">Account number</dt><dd className="flex items-center gap-2 font-medium tabular-nums">{BANK_TRANSFER_DETAILS.accountNumber} <Copy className="h-3.5 w-3.5 text-stone" aria-hidden /></dd></div>
                  </dl>
                ) : <p className="text-sm text-ink-soft">Request verified account details on WhatsApp before paying.</p>}
                <p className="text-sm text-ink-soft">Transfer exactly <strong>{formatNaira(order.total)}</strong> and use <strong>{order.orderNumber}</strong> as the narration. Only select the button after making the transfer. We will verify receipt before marking the order paid and starting delivery.</p>
                <TransferSubmissionButton orderNumber={order.orderNumber} submitted={submitted} />
              </div>
            ) : <p className="mt-4 text-sm text-ink-soft">Open WhatsApp to request account details. Include your order reference and exact total when paying. We will confirm receipt before preparing delivery.</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`${SITE.whatsappUrl}?text=${whatsappMessage}`} variant="primary" size="lg">{bankTransfer ? "Get payment help on WhatsApp" : "Pay now on WhatsApp"}</ButtonLink>
            </div>
          </section>
        )}

        <section className="mt-10" aria-labelledby="progress-heading"><h2 id="progress-heading" className="sr-only">Order progress</h2><OrderStatusTracker status={order.status} /></section>
        <section className="mt-10 grid gap-10 lg:grid-cols-5" aria-labelledby="details-heading">
          <div className="lg:col-span-3"><h2 id="details-heading" className="font-serif text-2xl">Items</h2><div className="mt-3 border-y border-line"><OrderItemsList items={order.items} /></div></div>
          <div className="lg:col-span-2"><h2 className="font-serif text-2xl">Summary</h2><div className="mt-3 border border-line p-5"><OrderTotals order={order} /></div></div>
        </section>
        <section className="mt-10 border-t border-line pt-8"><OrderMeta order={order} /></section>
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <ButtonLink href="/shop" variant="secondary">Continue shopping</ButtonLink>
          {user ? <Link href="/account/orders" className="text-xs font-medium uppercase tracking-[0.16em] underline underline-offset-4">View all my orders</Link> : <p className="text-sm text-stone"><Link href={`/register?next=/order/${order.orderNumber}`} className="text-ink underline underline-offset-4">Create an account</Link> to track your order.</p>}
        </div>
      </div>
    </div>
  );
}

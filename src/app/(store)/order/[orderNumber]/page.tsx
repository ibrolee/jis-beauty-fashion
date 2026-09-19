import { AlertTriangle, CheckCircle2, Clock, Copy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderItemsList, OrderMeta, OrderStatusTracker, OrderTotals } from "@/components/orders/order-details";
import { RetryPaymentButton } from "@/components/orders/retry-payment-button";
import { TransferSubmissionButton } from "@/components/orders/transfer-submission-button";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { SITE } from "@/lib/constants";
import { getOrderByNumber } from "@/lib/data/orders";
import { BANK_TRANSFER_DETAILS, isOnlinePaymentEnabled } from "@/lib/payments";
import { bankTransferDeadline } from "@/lib/orders/reservations";
import { whatsappCheckoutMessage } from "@/lib/orders/whatsapp-checkout";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };
type Props = { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ payment?: string }> };

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const [{ orderNumber }, { payment }, user] = await Promise.all([params, searchParams, getCurrentUser()]);
  // The order query checks overdue, unreported reservations before rendering.
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const paid = order.paymentStatus === "paid";
  const failed = payment === "failed" || order.paymentStatus === "failed";
  const cancelled = order.status === "cancelled";
  const latestManualPayment = order.payments.find((entry) => entry.provider === "manual");
  // Both channels use the historical bank_transfer DB enum; payment.channel keeps them distinct.
  const whatsappCheckout = order.paymentMethod === "bank_transfer" && latestManualPayment?.channel === "whatsapp";
  const websiteTransfer = order.paymentMethod === "bank_transfer" && !whatsappCheckout;
  const submitted = (websiteTransfer || whatsappCheckout) && order.payments.some((entry) =>
    entry.channel === "transfer_submitted" || typeof entry.metadata?.transferReportedAt === "string",
  );
  const deadline = bankTransferDeadline(order.createdAt);
  const whatsappMessage = cancelled
    ? `Hello JIS, I need assistance with cancelled order ${order.orderNumber} (${formatNaira(order.total)}).`
    : submitted
      ? `Hello JIS, I have reported payment for order ${order.orderNumber} (${formatNaira(order.total)}). Please verify receipt in your bank account. Order details: ${orderNumber}.`
      : whatsappCheckout
        ? whatsappCheckoutMessage({
            orderNumber: order.orderNumber,
            total: order.total,
            items: order.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              variantName: item.variantName,
              productSlug: item.product?.slug ?? null,
            })),
          })
        : websiteTransfer
          ? `Hello JIS, I need help confirming my transfer for order ${order.orderNumber} (${formatNaira(order.total)}). Order details: ${orderNumber}.`
          : `Hello JIS, I need payment assistance for order ${order.orderNumber} (${formatNaira(order.total)}).`;

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-line pb-8 text-center">
          {cancelled ? <AlertTriangle className="mx-auto h-10 w-10 text-sale" strokeWidth={1.25} /> : paid ? <CheckCircle2 className="mx-auto h-10 w-10 text-success" strokeWidth={1.25} /> : failed ? <AlertTriangle className="mx-auto h-10 w-10 text-sale" strokeWidth={1.25} /> : <Clock className="mx-auto h-10 w-10 text-ink" strokeWidth={1.25} />}
          <p className="eyebrow mt-5">Order {order.orderNumber}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            {cancelled ? "This order was cancelled" : paid ? `Thank you, ${order.firstName}!` : submitted ? "Payment reported — awaiting verification" : failed ? "Payment needs attention" : "Order received"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-stone">
            {cancelled
              ? "Your reservation was cancelled. Do not transfer money to this order. If you already paid, contact us for assistance."
              : paid
                ? "Your payment was verified and we are preparing your order."
                : submitted
                  ? "Your payment report is recorded and the reservation is held for manual review. Payment is still pending until we check our bank account; we will contact you if verification is unsuccessful."
                  : whatsappCheckout
                    ? "Open WhatsApp to request account details and pay within six hours. After transferring, return here and select ‘I have paid — request verification’ so your reservation is held for manual review. We verify receipt before fulfilment."
                    : websiteTransfer
                      ? "Transfer the exact amount below within six hours and select ‘I have transferred the amount’. Unreported, unpaid reservations become eligible for cancellation after six hours; payment is verified manually."
                      : order.paymentMethod === "pay_on_delivery"
                        ? "We will contact you to confirm your order. You can pay when it arrives."
                        : "We are checking your payment. Contact us if you need help."}
          </p>
        </header>

        {!paid && !cancelled && (
          <section className="mt-8 border border-line bg-cream p-6" aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="font-serif text-2xl">
              {submitted ? "Payment report under review" : whatsappCheckout ? "Pay now on WhatsApp" : websiteTransfer ? "Bank transfer details" : "Payment information"}
            </h2>
            {(whatsappCheckout || websiteTransfer) && (
              submitted
                ? <p className="mt-3 text-sm font-medium text-ink">Your reservation is held for manual review. Do not pay again unless our team confirms you need to.</p>
                : <p className="mt-3 text-sm font-medium text-ink">Payment window: until {deadline.toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })} (Lagos time). Unreported orders are eligible for cancellation afterward. Check that your order is still pending before transferring.</p>
            )}

            {websiteTransfer && !submitted && (
              <div className="mt-4 space-y-5">
                {BANK_TRANSFER_DETAILS.configured ? (
                  <dl className="grid gap-3 text-sm sm:grid-cols-3">
                    <div><dt className="text-stone">Bank</dt><dd className="font-medium">{BANK_TRANSFER_DETAILS.bankName}</dd></div>
                    <div><dt className="text-stone">Account name</dt><dd className="font-medium">{BANK_TRANSFER_DETAILS.accountName}</dd></div>
                    <div><dt className="text-stone">Account number</dt><dd className="flex items-center gap-2 font-medium tabular-nums">{BANK_TRANSFER_DETAILS.accountNumber} <Copy className="h-3.5 w-3.5 text-stone" aria-hidden /></dd></div>
                  </dl>
                ) : <p className="text-sm text-ink-soft">Request and verify our account details on WhatsApp before paying.</p>}
                <p className="text-sm text-ink-soft">
                  Transfer exactly <strong>{formatNaira(order.total)}</strong> and use <strong>{order.orderNumber}</strong> as your narration. Only press the button after making your transfer. We will verify receipt before marking the order paid.
                </p>
              </div>
            )}
            {whatsappCheckout && !submitted && (
              <p className="mt-4 text-sm text-ink-soft">
                Your WhatsApp message includes the products, product links, order reference and total of <strong>{formatNaira(order.total)}</strong>. Request our bank details and pay within six hours. Return to this page to report your transfer. Merely opening or sending a WhatsApp message does not confirm payment or hold the order for review.
              </p>
            )}
            {(websiteTransfer || whatsappCheckout) && (
              <div className="mt-5">
                <TransferSubmissionButton orderNumber={order.orderNumber} submitted={submitted} channel={whatsappCheckout ? "whatsapp" : "bank_transfer"} />
              </div>
            )}
            {order.paymentMethod === "pay_on_delivery" && <p className="mt-4 text-sm text-ink-soft">Our team will contact you about delivery and payment.</p>}
            {order.paymentMethod === "paystack" && <p className="mt-4 text-sm text-ink-soft">Your existing online payment has not been confirmed. Retry securely if the option is available.</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {order.paymentMethod === "paystack" && isOnlinePaymentEnabled() && <RetryPaymentButton orderNumber={order.orderNumber} />}
              <ButtonLink href={`${SITE.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`} variant="primary" size="lg">
                {submitted ? "Ask about verification on WhatsApp" : whatsappCheckout ? "Request bank details on WhatsApp" : websiteTransfer ? "Get payment help on WhatsApp" : "Contact us on WhatsApp"}
              </ButtonLink>
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

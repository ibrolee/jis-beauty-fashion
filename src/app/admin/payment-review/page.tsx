import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPageHeader } from "@/components/admin/ui";
import { getBankReviewQueueAdmin } from "@/lib/data/orders";
import { isTransferReported, manualCheckoutChannel } from "@/lib/orders/payment-review";
import { formatDate, formatNaira } from "@/lib/utils";

export const metadata = { title: "Check payments" };

export default async function PaymentReviewPage() {
  await requireAdmin();
  const { items, total } = await getBankReviewQueueAdmin();

  return <div className="space-y-5">
    <AdminPageHeader title="Payments to check" description="Customers have reported a bank transfer. Confirm the money in your actual bank account before accepting any order." />
    <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" aria-label="Bank verification instructions">
      <p className="font-semibold">How to check a payment</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>Open the order below and check its exact amount.</li>
        <li>Check your bank account independently. Match the amount and payment reference or sender.</li>
        <li>Only then open the order, change Payment status to Paid, and save. A customer's WhatsApp message or screenshot is not proof.</li>
      </ol>
      <p className="mt-2">Do not prepare or dispatch products until the transfer is verified.</p>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-medium">{total === 0 ? "No reported transfers awaiting verification." : `${total} reported transfer${total === 1 ? "" : "s"} awaiting bank verification`}</p>
      <Link href="/admin/orders" className="text-sm underline underline-offset-4">See all orders</Link>
    </div>
    <div className="grid gap-3">
      {items.map((order) => {
        const reported = order.payments.find(isTransferReported);
        const channel = manualCheckoutChannel(order.paymentMethod, order.payments);
        return <article key={order.id} className="rounded-lg border border-line bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-900">Reported — not yet paid</p>
              <h2 className="mt-1 break-all font-serif text-xl">{order.orderNumber}</h2>
              <p className="mt-1 text-sm">{order.firstName} {order.lastName} · {order.phone}</p>
              <p className="mt-1 text-xs text-stone">Ordered {formatDate(order.createdAt)} · {channel === "whatsapp" ? "WhatsApp checkout" : "Website bank transfer"}</p>
              {reported && <p className="mt-1 text-xs text-stone">Report recorded {formatDate(reported.createdAt)}</p>}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-stone">Amount to verify</p>
              <p className="text-xl font-semibold tabular-nums">{formatNaira(order.total)}</p>
            </div>
          </div>
          <Link href={`/admin/orders/${order.id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white sm:w-auto">Open order & check payment</Link>
        </article>;
      })}
    </div>
    {total > items.length && <p className="text-sm text-amber-900">Showing the newest {items.length} reports out of {total}. Review these and reload to see the remaining reports.</p>}
  </div>;
}

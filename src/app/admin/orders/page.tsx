import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/order-details";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { getAllOrdersAdmin, getBankReviewQueueAdmin } from "@/lib/data/orders";
import { isTransferReported, manualCheckoutChannel } from "@/lib/orders/payment-review";
import { cn, formatDate, formatNaira } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const [orders, reviewQueue] = await Promise.all([getAllOrdersAdmin(active), getBankReviewQueueAdmin(1)]);

  return (
    <div>
      <AdminPageHeader title="Orders" description="Verify incoming payments before preparing or dispatching orders." />
      {reviewQueue.total > 0 && (
        <p role="status" className="mb-4 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {reviewQueue.total} reported transfer{reviewQueue.total === 1 ? "" : "s"} awaiting your bank verification. <Link href="/admin/payment-review" className="font-bold underline underline-offset-4">Open the payment review inbox</Link>. A report alone is not proof of payment.
        </p>
      )}
      <div className="mb-4 flex max-w-full gap-1 overflow-x-auto pb-2">
        <Link href="/admin/orders" className={cn("h-10 shrink-0 whitespace-nowrap border px-3 text-xs uppercase tracking-[0.12em] leading-10", !active ? "border-ink bg-ink text-white" : "border-line bg-white")}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={cn("h-10 shrink-0 whitespace-nowrap border px-3 text-xs uppercase tracking-[0.12em] leading-10", active === s ? "border-ink bg-ink text-white" : "border-line bg-white")}>
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>
      <div className="space-y-3 md:hidden">
        {orders.length === 0 && <p className="border border-line bg-white p-4 text-sm text-stone">No orders in this view.</p>}
        {orders.map((o) => {
          const reportPending = o.status === "pending" && o.paymentStatus === "pending" && o.payments.some(isTransferReported);
          return <article key={o.id} className={cn("rounded-xl border bg-white p-4", reportPending ? "border-amber-400" : "border-line")}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="break-all text-sm font-semibold">{o.orderNumber}</h2>
                <p className="mt-1 text-sm">{o.firstName} {o.lastName}</p>
                <p className="text-xs text-stone">{formatDate(o.createdAt)} · {o.state}</p>
              </div>
              <p className="font-semibold tabular-nums">{formatNaira(o.total)}</p>
            </div>
            {reportPending && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs font-semibold text-amber-950">Customer reported a transfer — check your bank.</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2"><PaymentStatusBadge status={o.paymentStatus} /><OrderStatusBadge status={o.status} /></div>
            <Link href={`/admin/orders/${o.id}`} className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-ink px-3 text-sm font-semibold text-white">View order details</Link>
          </article>;
        })}
      </div>
      <div className="hidden md:block"><Table>
        <thead><tr>
          <th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Items</th><th className={th}>Total</th><th className={th}>Payment</th><th className={th}>Status</th>
        </tr></thead>
        <tbody>
          {orders.length === 0 && <tr><td className={td} colSpan={6}>No orders {active ? `with status "${ORDER_STATUS_LABELS[active]}"` : "yet"}.</td></tr>}
          {orders.map((o) => {
            const reportPending = o.status === "pending" && o.paymentStatus === "pending" && o.payments.some(isTransferReported);
            const channel = manualCheckoutChannel(o.paymentMethod, o.payments);
            return (
              <tr key={o.id} className={cn("hover:bg-cream", reportPending && "bg-amber-50")}>
                <td className={td}>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">{o.orderNumber}</Link>
                  <p className="text-xs text-stone">{formatDate(o.createdAt, { hour: "2-digit", minute: "2-digit" })}</p>
                </td>
                <td className={td}>{o.firstName} {o.lastName}<p className="text-xs text-stone">{o.phone} · {o.state}</p></td>
                <td className={td}>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className={`${td} tabular-nums`}>{formatNaira(o.total)}</td>
                <td className={td}>
                  <PaymentStatusBadge status={o.paymentStatus} />
                  {channel && <p className="mt-1 text-xs text-stone">{channel === "whatsapp" ? "WhatsApp" : "Website transfer"}</p>}
                  {reportPending && <p className="mt-1 text-xs font-semibold text-amber-900">Transfer reported · verify bank receipt</p>}
                </td>
                <td className={td}><OrderStatusBadge status={o.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </Table></div>
      {orders.length === 100 && <p className="mt-3 text-xs text-stone">Showing the most recent 100 orders in this view. Use the payment inbox for transfer reports that need attention.</p>}
    </div>
  );
}

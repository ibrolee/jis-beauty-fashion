import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/order-details";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { getAllOrdersAdmin } from "@/lib/data/orders";
import { isTransferReported, manualCheckoutChannel } from "@/lib/orders/payment-review";
import { cn, formatDate, formatNaira } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const orders = await getAllOrdersAdmin(active);
  const awaitingReview = orders.filter((order) => order.status === "pending" && order.paymentStatus === "pending" && order.payments.some(isTransferReported)).length;

  return (
    <div>
      <AdminPageHeader title="Orders" description="Verify incoming payments before preparing or dispatching orders." />
      {awaitingReview > 0 && (
        <p role="status" className="mb-4 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {awaitingReview} order{awaitingReview === 1 ? "" : "s"} in this view report a transfer awaiting your bank verification. Open each order, verify actual receipt and amount, then mark Paid. A report alone is not proof of payment.
        </p>
      )}
      <div className="mb-4 flex flex-wrap gap-1">
        <Link href="/admin/orders" className={cn("h-9 border px-3 text-xs uppercase tracking-[0.12em] leading-9", !active ? "border-ink bg-ink text-white" : "border-line bg-white")}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={cn("h-9 border px-3 text-xs uppercase tracking-[0.12em] leading-9", active === s ? "border-ink bg-ink text-white" : "border-line bg-white")}>
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>
      <Table>
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
      </Table>
    </div>
  );
}

import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/order-details";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { getAllOrdersAdmin } from "@/lib/data/orders";
import { cn, formatDate, formatNaira } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const { status } = await searchParams;
  const active = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const orders = await getAllOrdersAdmin(active);

  return (
    <div>
      <AdminPageHeader title="Orders" description="Update statuses as orders move through fulfilment." />
      <div className="mb-4 flex flex-wrap gap-1">
        <Link href="/admin/orders" className={cn("h-9 border px-3 text-xs uppercase tracking-[0.12em] leading-9", !active ? "border-ink bg-ink text-white" : "border-line bg-white")}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={cn("h-9 border px-3 text-xs uppercase tracking-[0.12em] leading-9", active === s ? "border-ink bg-ink text-white" : "border-line bg-white")}>
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>
      <Table>
        <thead>
          <tr>
            <th className={th}>Order</th>
            <th className={th}>Customer</th>
            <th className={th}>Items</th>
            <th className={th}>Total</th>
            <th className={th}>Payment</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td className={td} colSpan={6}>No orders {active ? `with status "${ORDER_STATUS_LABELS[active]}"` : "yet"}.</td>
            </tr>
          )}
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-cream">
              <td className={td}>
                <Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">{o.orderNumber}</Link>
                <p className="text-xs text-stone">{formatDate(o.createdAt, { hour: "2-digit", minute: "2-digit" })}</p>
              </td>
              <td className={td}>
                {o.firstName} {o.lastName}
                <p className="text-xs text-stone">{o.phone} · {o.state}</p>
              </td>
              <td className={td}>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
              <td className={`${td} tabular-nums`}>{formatNaira(o.total)}</td>
              <td className={td}><PaymentStatusBadge status={o.paymentStatus} /></td>
              <td className={td}><OrderStatusBadge status={o.status} /></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

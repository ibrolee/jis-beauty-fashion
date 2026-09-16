import { requireAdmin } from "@/lib/auth/session";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { AdminPageHeader, Card } from "@/components/admin/ui";
import { OrderItemsList, OrderMeta, OrderStatusTracker, OrderTotals, PaymentStatusBadge } from "@/components/orders/order-details";
import { getOrderByIdAdmin } from "@/lib/data/orders";
import { formatDate, formatNaira, toWhatsAppNumber } from "@/lib/utils";

export const metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const { id } = await params;
  const order = await getOrderByIdAdmin(Number(id));
  if (!order) notFound();

  const wa = `https://wa.me/${toWhatsAppNumber(order.whatsapp || order.phone)}?text=${encodeURIComponent(`Hello ${order.firstName}, this is JIS Beauty & Fashion regarding your order ${order.orderNumber}.`)}`;

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em]"><ChevronLeft className="h-3.5 w-3.5" /> Orders</Link>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed ${formatDate(order.createdAt, { hour: "2-digit", minute: "2-digit" })} · ${order.email}${order.user ? " · Registered customer" : " · Guest"}`}
        actions={<a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center border border-ink px-4 text-xs font-medium uppercase tracking-[0.16em] hover:bg-ink hover:text-white">WhatsApp customer</a>}
      />

      <Card>
        <OrderStatusTracker status={order.status} />
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Items">
            <OrderItemsList items={order.items} />
            <div className="mt-4 border-t border-line pt-4">
              <OrderTotals order={order} />
            </div>
          </Card>
          <Card title="Customer & delivery">
            <OrderMeta order={order} />
          </Card>
          <Card title="Payment attempts">
            {order.payments.length === 0 ? (
              <p className="text-sm text-stone">No payment records.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="font-mono text-xs">{p.reference}</p>
                      <p className="text-xs text-stone">{p.provider} · {formatDate(p.createdAt, { hour: "2-digit", minute: "2-digit" })}{p.channel ? ` · ${p.channel}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums">{formatNaira(p.amount)}</span>
                      <PaymentStatusBadge status={p.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div>
          <Card title="Update status">
            <OrderStatusForm order={order} />
          </Card>
        </div>
      </div>
    </div>
  );
}

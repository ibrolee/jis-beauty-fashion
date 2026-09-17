import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/order-details";
import { AdminPageHeader, Card, Table, td, th } from "@/components/admin/ui";
import { MobileOrderActions } from "@/components/admin/mobile-order-actions";
import { getDashboardStats } from "@/lib/data/orders";
import { formatDate, formatNaira } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Revenue (paid)",
      value: formatNaira(stats.revenue),
    },
    {
      label: "Orders",
      value: String(stats.orders),
      hint: `${stats.pendingOrders} pending`,
    },
    {
      label: "Customers",
      value: String(stats.customers),
    },
    {
      label: "Active products",
      value: String(stats.products),
      hint: `${stats.lowStock.length} low stock`,
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="A snapshot of how the store is doing."
      />

      {/* Dashboard statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="min-w-0 border border-line bg-white p-5"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone">
              {c.label}
            </p>

            <p className="mt-2 break-words font-serif text-3xl">
              {c.value}
            </p>

            {c.hint && (
              <p className="mt-1 text-xs text-stone">
                {c.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        {/* Recent orders */}
        <div className="min-w-0 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">
              Recent orders
            </h2>

            <Link
              href="/admin/orders"
              className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] underline underline-offset-4"
            >
              All orders
            </Link>
          </div>

          {/* =========================
              DESKTOP TABLE
             ========================= */}
          <div className="hidden sm:block">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Total</th>
                  <th className={th}>Payment</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td className={td} colSpan={5}>
                      No orders yet.
                    </td>
                  </tr>
                )}

                {stats.recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-cream"
                  >
                    <td className={td}>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {o.orderNumber}
                      </Link>

                      <p className="text-xs text-stone">
                        {formatDate(o.createdAt)}
                      </p>
                    </td>

                    <td className={td}>
                      {o.firstName} {o.lastName}

                      <p className="text-xs text-stone">
                        {o.state}
                      </p>
                    </td>

                    <td className={`${td} tabular-nums`}>
                      {formatNaira(o.total)}
                    </td>

                    <td className={td}>
                      <PaymentStatusBadge
                        status={o.paymentStatus}
                      />
                    </td>

                    <td className={td}>
                      <OrderStatusBadge
                        status={o.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* =========================
              MOBILE ORDER CARDS
             ========================= */}
          <div className="space-y-3 sm:hidden">
            {stats.recentOrders.length === 0 && (
              <div className="border border-line bg-white p-5 text-sm text-stone">
                No orders yet.
              </div>
            )}

            {stats.recentOrders.map((o) => (
              <div
                key={o.id}
                className="min-w-0 overflow-hidden border border-line bg-white"
              >
                {/* Order heading */}
                <div className="border-b border-line px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="block truncate font-medium underline-offset-4 hover:underline"
                      >
                        {o.orderNumber}
                      </Link>

                      <p className="mt-1 text-xs text-stone">
                        {formatDate(o.createdAt)}
                      </p>
                    </div>

                    <span className="shrink-0 font-medium tabular-nums">
                      {formatNaira(o.total)}
                    </span>
                  </div>
                </div>

                {/* Customer */}
                <div className="grid grid-cols-2 gap-4 border-b border-line px-4 py-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone">
                      Customer
                    </p>

                    <p className="mt-1 truncate text-sm">
                      {o.firstName} {o.lastName}
                    </p>

                    <p className="truncate text-xs text-stone">
                      {o.state}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone">
                      Current status
                    </p>

                    <div className="mt-2">
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone">
                    Payment
                  </p>

                  <PaymentStatusBadge
                    status={o.paymentStatus}
                  />
                </div>

                {/* Direct mobile controls */}
                <div className="px-4 py-4">
                  <MobileOrderActions
                    orderId={o.id}
                    status={o.status}
                    paymentStatus={o.paymentStatus}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side dashboard cards */}
        <div className="space-y-8">
          <Card title="Top sellers (30 days)">
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-stone">
                No sales in the last 30 days.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {stats.topProducts.map((p) => (
                  <li
                    key={`${p.productId}-${p.name}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="min-w-0 truncate">
                      {p.name}
                    </span>

                    <span className="shrink-0 text-xs text-stone">
                      {p.units} sold · {formatNaira(p.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Low stock (≤ 5)">
            {stats.lowStock.length === 0 ? (
              <p className="text-sm text-stone">
                All products are well stocked.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {stats.lowStock.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="min-w-0 truncate underline-offset-4 hover:underline"
                    >
                      {p.name}
                    </Link>

                    <span
                      className={
                        p.stock === 0
                          ? "shrink-0 text-sale"
                          : "shrink-0 text-amber-700"
                      }
                    >
                      {p.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
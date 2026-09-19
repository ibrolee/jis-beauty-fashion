import { and, count, desc, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, users, type OrderStatus } from "@/db/schema";
import { expireUnpaidBankTransfers } from "@/lib/orders/reservations";

export async function getOrderByNumber(orderNumber: string) {
  await expireUnpaidBankTransfers();
  return db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: {
      items: { with: { product: { columns: { slug: true } } } },
      payments: { orderBy: (p, { desc }) => [desc(p.createdAt)] },
    },
  });
}

export async function getOrdersForUser(userId: number) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
  });
}

export async function getOrderForUser(orderNumber: string, userId: number) {
  return db.query.orders.findFirst({
    where: and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId)),
    with: { items: true, payments: true },
  });
}

/* --------------------------------- Admin --------------------------------- */

export async function getAllOrdersAdmin(status?: OrderStatus, limit = 100) {
  await expireUnpaidBankTransfers();
  return db.query.orders.findMany({
    where: status ? eq(orders.status, status) : undefined,
    with: { items: true },
    orderBy: [desc(orders.createdAt)],
    limit,
  });
}

export async function getOrderByIdAdmin(id: number) {
  await expireUnpaidBankTransfers();
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true, payments: true, user: true },
  });
}

export async function getDashboardStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [[revenue], [orderCount], [customerCount], [productCount], [pending], lowStock, recentOrders, topProducts] =
    await Promise.all([
      db.select({ value: sum(orders.total) }).from(orders).where(eq(orders.paymentStatus, "paid")),
      db.select({ value: count() }).from(orders),
      db.select({ value: count() }).from(users).where(eq(users.role, "customer")),
      db.select({ value: count() }).from(products).where(eq(products.isActive, true)),
      db.select({ value: count() }).from(orders).where(eq(orders.status, "pending")),
      db
        .select({ id: products.id, name: products.name, stock: products.stock, slug: products.slug })
        .from(products)
        .where(and(eq(products.isActive, true), sql`${products.stock} <= 5`))
        .orderBy(products.stock)
        .limit(6),
      db.query.orders.findMany({ orderBy: [desc(orders.createdAt)], limit: 8 }),
      db
        .select({
          productId: orderItems.productId,
          name: orderItems.name,
          units: sum(orderItems.quantity),
          revenue: sum(orderItems.lineTotal),
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(gte(orders.createdAt, thirtyDaysAgo))
        .groupBy(orderItems.productId, orderItems.name)
        .orderBy(desc(sum(orderItems.quantity)))
        .limit(5),
    ]);

  return {
    revenue: Number(revenue?.value ?? 0),
    orders: orderCount.value,
    customers: customerCount.value,
    products: productCount.value,
    pendingOrders: pending.value,
    lowStock,
    recentOrders,
    topProducts: topProducts.map((t) => ({ ...t, units: Number(t.units ?? 0), revenue: Number(t.revenue ?? 0) })),
  };
}

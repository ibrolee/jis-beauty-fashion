import { and, eq, lte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { coupons, orderItems, orders, payments, products, productVariants, type PaymentStatus } from "@/db/schema";

export const BANK_TRANSFER_RESERVATION_HOURS = 6;
const RESERVATION_MS = BANK_TRANSFER_RESERVATION_HOURS * 60 * 60 * 1000;

export function bankTransferDeadline(createdAt: Date): Date {
  return new Date(createdAt.getTime() + RESERVATION_MS);
}

/**
 * A cancelled order releases its inventory exactly once. The conditional UPDATE
 * acquires the order row lock; concurrent cron and admin cancellations cannot
 * both pass it. Do not call this for payments or statuses other than cancellation.
 */
export async function cancelOrderAndRelease(
  id: number,
  options: {
    expiredOnly?: boolean;
    paymentStatus?: PaymentStatus;
    adminNotes?: string | null;
  } = {},
): Promise<boolean> {
  const cutoff = new Date(Date.now() - RESERVATION_MS);

  return db.transaction(async (tx) => {
    const conditions = [eq(orders.id, id), ne(orders.status, "cancelled")];
    if (options.expiredOnly) {
      conditions.push(
        eq(orders.status, "pending"),
        eq(orders.paymentMethod, "bank_transfer"),
        eq(orders.paymentStatus, "pending"),
        lte(orders.createdAt, cutoff),
      );
    }

    const [cancelled] = await tx.update(orders).set({
      status: "cancelled",
      ...(options.paymentStatus === undefined ? {} : { paymentStatus: options.paymentStatus }),
      ...(options.expiredOnly
        ? { adminNotes: "Automatically cancelled: bank transfer not confirmed within six hours." }
        : options.adminNotes === undefined ? {} : { adminNotes: options.adminNotes }),
      updatedAt: new Date(),
    }).where(and(...conditions)).returning({
      id: orders.id,
      orderNumber: orders.orderNumber,
      couponCode: orders.couponCode,
    });

    if (!cancelled) return false;

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
    for (const item of items) {
      if (item.variantId !== null) {
        await tx.update(productVariants)
          .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }
      // The parent stock is deducted even for variant purchases. Restore it
      // independently of whether an option was subsequently deactivated.
      if (item.productId !== null) {
        await tx.update(products).set({
          stock: sql`${products.stock} + ${item.quantity}`,
          salesCount: sql`greatest(0, ${products.salesCount} - ${item.quantity})`,
        }).where(eq(products.id, item.productId));
      }
    }

    if (cancelled.couponCode) {
      await tx.update(coupons)
        .set({ usedCount: sql`greatest(0, ${coupons.usedCount} - 1)` })
        .where(eq(coupons.code, cancelled.couponCode));
    }

    if (options.paymentStatus !== undefined) {
      const [latest] = await tx.select({ id: payments.id })
        .from(payments).where(eq(payments.orderId, id))
        .orderBy(sql`${payments.createdAt} desc`).limit(1);
      if (latest) {
        await tx.update(payments).set({
          status: options.paymentStatus,
          paidAt: options.paymentStatus === "paid" ? new Date() : null,
          updatedAt: new Date(),
        }).where(eq(payments.id, latest.id));
      }
    }

    return true;
  });
}

/**
 * Safe to run on page requests and from a scheduled task. Recheck the age and
 * payment status inside each transaction to avoid cancelling confirmed payments.
 * A bound keeps individual requests short even if a large backlog accumulates.
 */
export async function expireUnpaidBankTransfers(limit = 40): Promise<number> {
  const cutoff = new Date(Date.now() - RESERVATION_MS);
  const candidates = await db.select({ id: orders.id }).from(orders)
    .where(and(
      eq(orders.status, "pending"),
      eq(orders.paymentMethod, "bank_transfer"),
      eq(orders.paymentStatus, "pending"),
      lte(orders.createdAt, cutoff),
    ))
    .orderBy(orders.createdAt).limit(Math.max(1, Math.min(limit, 100)));

  let expired = 0;
  for (const candidate of candidates) {
    if (await cancelOrderAndRelease(candidate.id, { expiredOnly: true })) expired++;
  }
  return expired;
}

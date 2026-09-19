"use server";

import { and, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { bankTransferDeadline } from "@/lib/orders/reservations";

export type TransferSubmissionResult = { ok: true } | { ok: false; error: string };

/** Customer acknowledgement is NOT proof of payment. Only an administrator may mark an order paid. */
export async function submitBankTransfer(orderNumber: string): Promise<TransferSubmissionResult> {
  if (!/^JIS-[A-Za-z0-9-]{8,36}$/.test(orderNumber)) {
    return { ok: false, error: "Invalid order reference." };
  }

  return db.transaction(async (tx): Promise<TransferSubmissionResult> => {
    const [order] = await tx.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (!order) return { ok: false, error: "Order not found." };
    if (order.paymentMethod !== "bank_transfer" || order.status !== "pending" || order.paymentStatus !== "pending") {
      return { ok: false, error: "This order is no longer awaiting a bank transfer." };
    }
    if (bankTransferDeadline(order.createdAt).getTime() <= Date.now()) {
      return { ok: false, error: "The six-hour payment window has expired. Please contact us before transferring." };
    }

    const [changed] = await tx.update(orders).set({ updatedAt: new Date() }).where(and(
      eq(orders.id, order.id), eq(orders.status, "pending"), eq(orders.paymentStatus, "pending"),
      gt(orders.createdAt, new Date(Date.now() - 6 * 60 * 60 * 1000)),
    )).returning({ id: orders.id });
    if (!changed) return { ok: false, error: "This order changed. Please refresh and check its status." };

    // Payment channel records the customer's claim; payment status deliberately remains pending.
    await tx.update(payments).set({ channel: "transfer_submitted", updatedAt: new Date() }).where(and(
      eq(payments.orderId, order.id), eq(payments.provider, "manual"), eq(payments.status, "pending"),
    ));
    revalidatePath(`/order/${order.orderNumber}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);
    return { ok: true };
  });
}

"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";

export type TransferSubmissionResult = { ok: true } | { ok: false; error: string };

/**
 * A customer report only requests manual review; it must NEVER confirm a payment.
 * The opaque order reference is a capability for guest checkout, as on the order page.
 * Lock the order before touching payment metadata to serialize with cron/admin cancellation.
 */
export async function submitBankTransfer(orderNumber: string): Promise<TransferSubmissionResult> {
  if (!/^JIS-[A-Za-z0-9-]{8,36}$/.test(orderNumber)) {
    return { ok: false, error: "Invalid order reference." };
  }

  const result = await db.transaction(async (tx): Promise<TransferSubmissionResult & { orderId?: number }> => {
    // A guarded UPDATE obtains an order-row lock. If cancellation wins the lock first,
    // the customer is told not to pay; if this report wins, cron rechecks metadata.
    const [order] = await tx.update(orders).set({ updatedAt: new Date() }).where(and(
      eq(orders.orderNumber, orderNumber),
      eq(orders.paymentMethod, "bank_transfer"),
      eq(orders.status, "pending"),
      eq(orders.paymentStatus, "pending"),
    )).returning({ id: orders.id });
    if (!order) {
      return { ok: false, error: "This order is no longer awaiting payment. Check its status and contact us if you have transferred money." };
    }

    const [latest] = await tx.select().from(payments)
      .where(eq(payments.orderId, order.id)).orderBy(desc(payments.createdAt)).limit(1);
    if (!latest || latest.provider !== "manual" || latest.status !== "pending" ||
      !["whatsapp", "bank_transfer", "transfer_submitted"].includes(latest.channel ?? "bank_transfer")) {
      return { ok: false, error: "This order is no longer awaiting a manual transfer. Please contact us." };
    }
    if (typeof latest.metadata?.transferReportedAt === "string" || latest.channel === "transfer_submitted") {
      return { ok: true, orderId: order.id };
    }

    // An unreported order is eligible for cancellation after six hours, but it
    // might still be pending if the scheduled job was delayed. Allow a genuine
    // customer to report until cancellation actually commits; never promise stock
    // or let them pay after cancellation. Preserve the original checkout channel.
    const [reported] = await tx.update(payments).set({
      channel: latest.channel ?? "bank_transfer",
      metadata: { ...(latest.metadata ?? {}), transferReportedAt: new Date().toISOString() },
      updatedAt: new Date(),
    }).where(and(eq(payments.id, latest.id), eq(payments.provider, "manual"), eq(payments.status, "pending")))
      .returning({ id: payments.id });
    if (!reported) return { ok: false, error: "Payment details changed. Refresh and check your order." };
    return { ok: true, orderId: order.id };
  });

  if (result.ok) {
    revalidatePath(`/order/${orderNumber}`);
    revalidatePath("/admin/orders");
    if (result.orderId) revalidatePath(`/admin/orders/${result.orderId}`);
  }
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

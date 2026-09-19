"use server";

import { and, desc, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { BANK_TRANSFER_RESERVATION_HOURS, bankTransferDeadline } from "@/lib/orders/reservations";

export type TransferSubmissionResult = { ok: true } | { ok: false; error: string };

/** A customer's claim is never proof of payment. Only the admin can mark an order paid. */
export async function submitBankTransfer(orderNumber: string): Promise<TransferSubmissionResult> {
  if (!/^JIS-[A-Za-z0-9-]{8,36}$/.test(orderNumber)) {
    return { ok: false, error: "Invalid order reference." };
  }

  const result = await db.transaction(async (tx): Promise<TransferSubmissionResult & { orderId?: number }> => {
    const [order] = await tx.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (!order) return { ok: false, error: "Order not found." };
    if (order.paymentMethod !== "bank_transfer" || order.status !== "pending" || order.paymentStatus !== "pending") {
      return { ok: false, error: "This order is no longer awaiting a bank transfer." };
    }
    if (bankTransferDeadline(order.createdAt).getTime() <= Date.now()) {
      return { ok: false, error: "The six-hour payment window has expired. Please contact us before transferring." };
    }

    const [latest] = await tx.select().from(payments)
      .where(eq(payments.orderId, order.id)).orderBy(desc(payments.createdAt)).limit(1);
    if (!latest || latest.provider !== "manual" || latest.status !== "pending" || latest.channel === "whatsapp") {
      return { ok: false, error: "This order uses WhatsApp payment or is no longer awaiting a website transfer." };
    }
    if (typeof latest.metadata?.transferReportedAt === "string" || latest.channel === "transfer_submitted") {
      return { ok: true, orderId: order.id };
    }

    // Lock the order row and recheck the exact six-hour deadline against cancellations/confirmations.
    const [changed] = await tx.update(orders).set({ updatedAt: new Date() }).where(and(
      eq(orders.id, order.id), eq(orders.status, "pending"), eq(orders.paymentStatus, "pending"),
      eq(orders.paymentMethod, "bank_transfer"),
      gt(orders.createdAt, new Date(Date.now() - BANK_TRANSFER_RESERVATION_HOURS * 60 * 60 * 1000)),
    )).returning({ id: orders.id });
    if (!changed) return { ok: false, error: "This order changed. Please refresh and check its status." };

    // Preserve the original payment channel: WhatsApp and website transfers must not become indistinguishable.
    const [reported] = await tx.update(payments).set({
      channel: latest.channel ?? "bank_transfer",
      metadata: { ...(latest.metadata ?? {}), transferReportedAt: new Date().toISOString() },
      updatedAt: new Date(),
    }).where(and(eq(payments.id, latest.id), eq(payments.provider, "manual"), eq(payments.status, "pending")))
      .returning({ id: payments.id });
    if (!reported) return { ok: false, error: "Payment details changed. Please refresh and try again." };
    return { ok: true, orderId: order.id };
  });

  if (result.ok) {
    revalidatePath(`/order/${orderNumber}`);
    revalidatePath("/admin/orders");
    if (result.orderId) revalidatePath(`/admin/orders/${result.orderId}`);
  }
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

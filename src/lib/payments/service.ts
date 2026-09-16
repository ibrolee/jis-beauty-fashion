import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { getPaymentProvider } from "./index";

/**
 * Reconciles a provider payment with our records. Idempotent: safe to call from
 * both the browser callback and the webhook.
 */
export async function reconcilePayment(providerId: string, reference: string) {
  const provider = getPaymentProvider(providerId);
  const payment = await db.query.payments.findFirst({
    where: eq(payments.reference, reference),
    with: { order: true },
  });

  if (!payment) return { found: false as const, status: "failed" as const, orderNumber: null };

  if (payment.status === "paid") {
    return { found: true as const, status: "paid" as const, orderNumber: payment.order.orderNumber };
  }

  const result = await provider.verify(reference);
  const amountMatches = result.amount >= payment.amount;
  const finalStatus = result.status === "paid" && amountMatches ? "paid" : result.status === "pending" ? "pending" : "failed";

  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({
        status: finalStatus,
        channel: result.channel ?? null,
        paidAt: result.paidAt ?? null,
        metadata: result.raw,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    if (finalStatus === "paid") {
      await tx
        .update(orders)
        .set({ paymentStatus: "paid", status: "payment_confirmed", updatedAt: new Date() })
        .where(eq(orders.id, payment.orderId));
    } else if (finalStatus === "failed") {
      await tx
        .update(orders)
        .set({ paymentStatus: "failed", updatedAt: new Date() })
        .where(eq(orders.id, payment.orderId));
    }
  });

  return { found: true as const, status: finalStatus, orderNumber: payment.order.orderNumber };
}

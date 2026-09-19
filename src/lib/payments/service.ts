import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { getPaymentProvider } from "./index";

/**
 * Reconcile a provider payment. Provider verification happens outside the DB
 * transaction; conditional order updates prevent delayed callbacks from
 * reviving a cancelled order or downgrading a payment already marked paid.
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
    // A duplicate failed callback must not overwrite a previously paid attempt.
    await tx.update(payments).set({
      status: finalStatus,
      channel: result.channel ?? null,
      paidAt: result.paidAt ?? null,
      metadata: result.raw,
      updatedAt: new Date(),
    }).where(and(eq(payments.id, payment.id), ne(payments.status, "paid")));

    if (finalStatus === "paid") {
      // Paid funds for a cancelled order need manual review/refund. Do NOT
      // reactivate it: its stock may already have been sold to someone else.
      const [confirmed] = await tx.update(orders)
        .set({ paymentStatus: "paid", status: "payment_confirmed", updatedAt: new Date() })
        .where(and(eq(orders.id, payment.orderId), ne(orders.status, "cancelled"), ne(orders.paymentStatus, "paid")))
        .returning({ id: orders.id });
      if (!confirmed) {
        const [cancelled] = await tx.update(orders).set({
          paymentStatus: "paid",
          adminNotes: "Payment received after order cancellation. Do not fulfil without manually checking stock; arrange a refund or contact the customer.",
          updatedAt: new Date(),
        }).where(and(eq(orders.id, payment.orderId), eq(orders.status, "cancelled"), ne(orders.paymentStatus, "paid")))
          .returning({ id: orders.id });
        if (cancelled) console.warn("Payment received for a cancelled order; admin review required", payment.orderId);
      }
    } else if (finalStatus === "failed") {
      await tx.update(orders)
        .set({ paymentStatus: "failed", updatedAt: new Date() })
        .where(and(eq(orders.id, payment.orderId), ne(orders.paymentStatus, "paid"), ne(orders.status, "cancelled")));
    }
  });

  return { found: true as const, status: finalStatus, orderNumber: payment.order.orderNumber };
}

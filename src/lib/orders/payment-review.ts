/** Pure payment-state helpers shared by customer and admin screens. No database access. */
export type PaymentReviewRecord = {
  provider: string;
  channel: string | null;
  metadata: Record<string, unknown> | null;
};

export function isTransferReported(payment: PaymentReviewRecord): boolean {
  return payment.channel === "transfer_submitted" ||
    typeof payment.metadata?.transferReportedAt === "string";
}

/** WhatsApp and website checkout both use the existing bank_transfer database enum. */
export function manualCheckoutChannel(
  paymentMethod: string,
  payments: readonly PaymentReviewRecord[],
): "whatsapp" | "website_transfer" | null {
  if (paymentMethod !== "bank_transfer") return null;
  const manual = payments.find((payment) => payment.provider === "manual");
  return manual?.channel === "whatsapp" ? "whatsapp" : "website_transfer";
}

/** Never begin preparing or delivering an order while its payment is unverified. */
export function isFulfillmentTransitionAllowed(orderStatus: string, paymentStatus: string): boolean {
  if (["payment_confirmed", "processing", "shipped", "delivered"].includes(orderStatus)) {
    return paymentStatus === "paid";
  }
  return true;
}

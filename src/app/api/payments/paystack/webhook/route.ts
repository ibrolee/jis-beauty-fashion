import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { reconcilePayment } from "@/lib/payments/service";

/**
 * Paystack webhook — set this URL in your Paystack dashboard:
 *   https://<your-domain>/api/payments/paystack/webhook
 * The signature (x-paystack-signature) is verified with PAYSTACK_SECRET_KEY.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const provider = getPaymentProvider("paystack");

  if (!provider.verifyWebhookSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as { event: string; data?: { reference?: string } };

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await reconcilePayment("paystack", event.data.reference);
    } catch (error) {
      console.error("Webhook reconcile failed:", error);
      return NextResponse.json({ received: true, reconciled: false }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from "next/server";
import { reconcilePayment } from "@/lib/payments/service";
import { absoluteUrl } from "@/lib/utils";

/**
 * Paystack redirects the customer here after payment (callback_url).
 * We verify the transaction server-side and send the customer to the order page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  if (!reference) return NextResponse.redirect(absoluteUrl("/cart?payment=missing-reference"));

  try {
    const result = await reconcilePayment("paystack", reference);
    if (!result.found || !result.orderNumber) return NextResponse.redirect(absoluteUrl("/cart?payment=unknown"));
    const status = result.status === "paid" ? "success" : result.status === "pending" ? "pending" : "failed";
    return NextResponse.redirect(absoluteUrl(`/order/${result.orderNumber}?payment=${status}`));
  } catch (error) {
    console.error("Paystack callback error:", error);
    return NextResponse.redirect(absoluteUrl("/cart?payment=error"));
  }
}

"use server";

import { requireAdmin } from "@/lib/auth/session";
import { updateOrderAction } from "@/lib/actions/admin";
import { isFulfillmentTransitionAllowed } from "@/lib/orders/payment-review";
import type { ActionState } from "@/types";

/** Enforce payment verification in the server action, not merely in the form UI. */
export async function updateVerifiedOrderAction(previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const status = String(formData.get("status") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");
  if (!isFulfillmentTransitionAllowed(status, paymentStatus)) {
    return { error: "Verify receipt and select Paid before confirming, preparing, shipping or delivering this order." };
  }
  return updateOrderAction(previous, formData);
}

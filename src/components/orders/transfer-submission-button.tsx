"use client";

import { useState, useTransition } from "react";
import { submitBankTransfer } from "@/lib/actions/transfer-confirmation";

type Props = { orderNumber: string; submitted: boolean; channel?: "whatsapp" | "bank_transfer" };

/** A customer's statement only holds the order for manual bank review; it never confirms payment. */
export function TransferSubmissionButton({ orderNumber, submitted, channel = "bank_transfer" }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(submitted);
  const [error, setError] = useState<string | null>(null);
  const whatsapp = channel === "whatsapp";

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={pending || confirmed}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const result = await submitBankTransfer(orderNumber);
              if (result.ok) setConfirmed(true);
              else setError(result.error);
            } catch {
              setError("We could not record your payment report. Please try again or contact us on WhatsApp.");
            }
          });
        }}
        className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {confirmed ? "Payment reported — awaiting verification" : pending ? "Submitting…" : whatsapp ? "I have paid — request verification" : "I have transferred the amount"}
      </button>
      <p role="status" className="text-sm text-ink-soft">
        {confirmed
          ? "We have received your report and reserved this order for manual review. Payment is still pending until we verify the money in our bank account."
          : whatsapp
            ? "Only select this after actually transferring the agreed total. This reports payment to us but does not confirm it. We check the bank before preparing your order."
            : "Only press this after transferring the exact amount. This reports payment but does not automatically confirm it; we check the bank before processing delivery."}
      </p>
      {error && <p role="alert" className="text-sm text-sale">{error}</p>}
    </div>
  );
}

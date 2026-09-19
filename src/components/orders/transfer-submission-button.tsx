"use client";

import { useState, useTransition } from "react";
import { submitBankTransfer } from "@/lib/actions/transfer-confirmation";

export function TransferSubmissionButton({ orderNumber, submitted }: { orderNumber: string; submitted: boolean }) {
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(submitted);
  const [error, setError] = useState<string | null>(null);

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
              setError("We could not record your transfer. Please try again or contact us on WhatsApp.");
            }
          });
        }}
        className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {confirmed ? "Transfer submitted — awaiting verification" : pending ? "Submitting…" : "I have transferred the amount"}
      </button>
      <p role="status" className="text-sm text-ink-soft">
        {confirmed
          ? "Thank you. We will verify receipt before marking your order paid and starting delivery processing."
          : "Only press this after transferring the exact amount. This does not automatically confirm payment; we will verify receipt before processing delivery."}
      </p>
      {error && <p role="alert" className="text-sm text-sale">{error}</p>}
    </div>
  );
}

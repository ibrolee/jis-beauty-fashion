"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { retryPayment } from "@/lib/actions/checkout";

export function RetryPaymentButton({ orderNumber }: { orderNumber: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await retryPayment(orderNumber);
            if (result.ok && result.redirectUrl) window.location.assign(result.redirectUrl);
            else if (!result.ok) setError(result.error);
          })
        }
      >
        Retry payment
      </Button>
      {error && <p className="text-xs text-sale" role="alert">{error}</p>}
    </div>
  );
}

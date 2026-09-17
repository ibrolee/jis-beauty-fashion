"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FormMessage,
  Select,
  Textarea,
} from "@/components/ui/form-fields";
import type { OrderStatus, PaymentStatus } from "@/db/schema";
import { updateOrderAction } from "@/lib/actions/admin";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { initialActionState } from "@/types";

export function MobileOrderActions({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const [state, action, pending] = useActionState(
    updateOrderAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-4">
      <input
        type="hidden"
        name="orderId"
        value={orderId}
      />

      {state.error && (
        <FormMessage type="error">
          {state.error}
        </FormMessage>
      )}

      {state.ok && (
        <FormMessage type="success">
          {state.message}
        </FormMessage>
      )}

      <Field
        label="Order status"
        htmlFor={`mobile-status-${orderId}`}
      >
        <Select
          id={`mobile-status-${orderId}`}
          name="status"
          defaultValue={status}
          className="w-full"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Payment status"
        htmlFor={`mobile-payment-${orderId}`}
        hint="Confirm payment here when you have received it."
      >
        <Select
          id={`mobile-payment-${orderId}`}
          name="paymentStatus"
          defaultValue={paymentStatus}
          className="w-full"
        >
          {(
            Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]
          ).map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Internal notes"
        htmlFor={`mobile-notes-${orderId}`}
      >
        <Textarea
          id={`mobile-notes-${orderId}`}
          name="adminNotes"
          className="min-h-[70px] w-full"
          placeholder="Optional note…"
        />
      </Field>

      <div className="flex gap-2">
        <Button
          type="submit"
          loading={pending}
          className="w-full"
        >
          {pending ? "Updating" : "Update order"}
        </Button>

        <a
          href={`/admin/orders/${orderId}`}
          className="inline-flex h-12 shrink-0 items-center justify-center border border-ink px-4 text-[11px] font-medium uppercase tracking-[0.12em]"
        >
          Details
        </a>
      </div>
    </form>
  );
}
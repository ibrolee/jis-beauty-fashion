"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Select, Textarea } from "@/components/ui/form-fields";
import type { Order } from "@/db/schema";
import { updateVerifiedOrderAction } from "@/lib/actions/verified-order-update";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { initialActionState } from "@/types";

export function OrderStatusForm({ order }: { order: Order }) {
  const [state, action, pending] = useActionState(updateVerifiedOrderAction, initialActionState);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="originalStatus" value={order.status} />
      <input type="hidden" name="originalPaymentStatus" value={order.paymentStatus} />
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
      <Field label="Order status" htmlFor="status" hint="Processing and delivery require a verified, Paid payment status.">
        <Select id="status" name="status" defaultValue={order.status}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </Select>
      </Field>
      <Field label="Payment status" htmlFor="paymentStatus" hint="Check actual receipt in your bank account before selecting Paid. A customer's submission is not proof.">
        <Select id="paymentStatus" name="paymentStatus" defaultValue={order.paymentStatus}>
          {(Object.keys(PAYMENT_STATUS_LABELS) as (keyof typeof PAYMENT_STATUS_LABELS)[]).map((s) => (
            <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
          ))}
        </Select>
      </Field>
      <Field label="Internal notes" htmlFor="adminNotes">
        <Textarea id="adminNotes" name="adminNotes" defaultValue={order.adminNotes ?? ""} className="min-h-[80px]" placeholder="Courier, tracking number, follow-ups…" />
      </Field>
      <Button type="submit" loading={pending} className="w-full">Update order</Button>
    </form>
  );
}

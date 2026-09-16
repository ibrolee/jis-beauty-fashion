"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select } from "@/components/ui/form-fields";
import type { Coupon } from "@/db/schema";
import { saveCouponAction } from "@/lib/actions/admin";
import { initialActionState } from "@/types";

export function CouponForm({ coupon }: { coupon: Coupon | null }) {
  const [state, action, pending] = useActionState(saveCouponAction, initialActionState);
  const fe = state.fieldErrors ?? {};
  const expires = coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : "";

  return (
    <form action={action} className="space-y-5 border border-line bg-white p-5" key={coupon?.id ?? "new"}>
      {coupon && <input type="hidden" name="id" value={coupon.id} />}
      <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">{coupon ? `Edit ${coupon.code}` : "New coupon"}</h2>
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Code" htmlFor="code" error={fe.code} required><Input id="code" name="code" defaultValue={coupon?.code ?? ""} className="uppercase" required /></Field>
        <Field label="Type" htmlFor="type" error={fe.type}>
          <Select id="type" name="type" defaultValue={coupon?.type ?? "percentage"}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed amount (₦)</option>
          </Select>
        </Field>
        <Field label="Value" htmlFor="value" error={fe.value} hint="5 = 5% or ₦5 depending on type" required><Input id="value" name="value" type="number" min={1} defaultValue={coupon?.value ?? ""} required /></Field>
        <Field label="Minimum order (₦)" htmlFor="minOrderAmount" error={fe.minOrderAmount}><Input id="minOrderAmount" name="minOrderAmount" type="number" min={0} defaultValue={coupon?.minOrderAmount ?? 0} /></Field>
        <Field label="Max discount (₦)" htmlFor="maxDiscount" error={fe.maxDiscount} hint="Cap for % coupons. Blank = no cap"><Input id="maxDiscount" name="maxDiscount" type="number" min={0} defaultValue={coupon?.maxDiscount ?? ""} /></Field>
        <Field label="Usage limit" htmlFor="usageLimit" error={fe.usageLimit} hint="Blank = unlimited"><Input id="usageLimit" name="usageLimit" type="number" min={0} defaultValue={coupon?.usageLimit ?? ""} /></Field>
        <Field label="Expires on" htmlFor="expiresAt" error={fe.expiresAt} hint="Blank = never"><Input id="expiresAt" name="expiresAt" type="date" defaultValue={expires} /></Field>
        <Field label="Description" htmlFor="description" error={fe.description}><Input id="description" name="description" defaultValue={coupon?.description ?? ""} /></Field>
      </div>
      <Checkbox name="isActive" label="Active" defaultChecked={coupon?.isActive ?? true} />
      <Button type="submit" loading={pending}>{coupon ? "Save coupon" : "Create coupon"}</Button>
    </form>
  );
}

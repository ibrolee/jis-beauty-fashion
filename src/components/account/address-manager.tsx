"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form-fields";
import type { Address } from "@/db/schema";
import { deleteAddressAction, saveAddressAction, setDefaultAddressAction } from "@/lib/actions/account";
import { NIGERIAN_STATES } from "@/lib/constants";
import { initialActionState } from "@/types";

function AddressForm({ address, onDone }: { address: Address | null; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveAddressAction, initialActionState);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={action} className="space-y-5 border border-line bg-cream p-5" noValidate>
      {address && <input type="hidden" name="id" value={address.id} />}
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Label" htmlFor="label" hint="e.g. Home, Office">
          <Input id="label" name="label" defaultValue={address?.label ?? "Home"} />
        </Field>
        <Field label="Phone" htmlFor="addr-phone" error={state.fieldErrors?.phone} required>
          <Input id="addr-phone" name="phone" type="tel" defaultValue={address?.phone ?? ""} required />
        </Field>
        <Field label="First name" htmlFor="addr-firstName" error={state.fieldErrors?.firstName} required>
          <Input id="addr-firstName" name="firstName" defaultValue={address?.firstName ?? ""} required />
        </Field>
        <Field label="Last name" htmlFor="addr-lastName" error={state.fieldErrors?.lastName} required>
          <Input id="addr-lastName" name="lastName" defaultValue={address?.lastName ?? ""} required />
        </Field>
        <Field label="State" htmlFor="addr-state" error={state.fieldErrors?.state} required>
          <Select id="addr-state" name="state" defaultValue={address?.state ?? ""} required>
            <option value="" disabled>Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="City / Area" htmlFor="addr-city" error={state.fieldErrors?.city} required>
          <Input id="addr-city" name="city" defaultValue={address?.city ?? ""} required />
        </Field>
        <Field label="Address" htmlFor="addr-line" error={state.fieldErrors?.addressLine} required className="sm:col-span-2">
          <Textarea id="addr-line" name="addressLine" defaultValue={address?.addressLine ?? ""} className="min-h-[80px]" required />
        </Field>
        <Field label="Delivery instructions" htmlFor="addr-instructions" className="sm:col-span-2">
          <Textarea id="addr-instructions" name="instructions" defaultValue={address?.instructions ?? ""} className="min-h-[64px]" />
        </Field>
      </div>
      <Checkbox name="isDefault" label="Set as default delivery address" defaultChecked={address?.isDefault ?? false} />
      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {address ? "Save address" : "Add address"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Address | null | "new">(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Delivery addresses</h2>
        {editing === null && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Add address
          </Button>
        )}
      </div>

      {editing !== null && <AddressForm address={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}

      {addresses.length === 0 && editing === null && (
        <div className="border border-dashed border-line p-8 text-center text-sm text-stone">No saved addresses yet. Add one to speed up checkout.</div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className="flex flex-col border border-line p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{a.label}</p>
              {a.isDefault && <Badge tone="best">Default</Badge>}
            </div>
            <address className="mt-2 flex-1 text-sm not-italic leading-relaxed text-ink-soft">
              {a.firstName} {a.lastName}
              <br />
              {a.addressLine}
              <br />
              {a.city}, {a.state}
              <br />
              {a.phone}
            </address>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium uppercase tracking-[0.14em]">
              <button type="button" onClick={() => setEditing(a)} className="underline underline-offset-4">Edit</button>
              {!a.isDefault && (
                <button type="button" disabled={pending} onClick={() => startTransition(() => setDefaultAddressAction(a.id).then(() => undefined))} className="underline underline-offset-4">
                  Make default
                </button>
              )}
              <button type="button" disabled={pending} onClick={() => confirm("Remove this address?") && startTransition(() => deleteAddressAction(a.id).then(() => undefined))} className="text-sale underline underline-offset-4">
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

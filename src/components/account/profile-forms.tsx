"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/form-fields";
import { changePasswordAction, updateProfileAction } from "@/lib/actions/account";
import type { SessionUser } from "@/lib/auth/session";
import { initialActionState } from "@/types";

export function ProfileForm({ user }: { user: SessionUser }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialActionState);
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={state.fieldErrors?.firstName} required>
          <Input id="firstName" name="firstName" defaultValue={user.firstName} required />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={state.fieldErrors?.lastName} required>
          <Input id="lastName" name="lastName" defaultValue={user.lastName} required />
        </Field>
        <Field label="Phone" htmlFor="phone" error={state.fieldErrors?.phone}>
          <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp" error={state.fieldErrors?.whatsapp}>
          <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={user.whatsapp ?? ""} />
        </Field>
        <Field label="Email" htmlFor="email" hint="Contact us to change your email address." className="sm:col-span-2">
          <Input id="email" value={user.email} disabled readOnly />
        </Field>
      </div>
      <Button type="submit" loading={pending}>
        Save changes
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initialActionState);
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
      <Field label="Current password" htmlFor="currentPassword" error={state.fieldErrors?.currentPassword} required>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="New password" htmlFor="newPassword" error={state.fieldErrors?.password} required>
          <Input id="newPassword" name="password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Confirm new password" htmlFor="confirmPassword" error={state.fieldErrors?.confirmPassword} required>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        </Field>
      </div>
      <Button type="submit" variant="secondary" loading={pending}>
        Update password
      </Button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/form-fields";
import { forgotPasswordAction, loginAction, registerAction, resetPasswordAction } from "@/lib/auth/actions";
import { initialActionState } from "@/types";

export function AuthCard({ eyebrow, title, description, children, footer }: { eyebrow: string; title: string; description?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="container-x py-12 lg:py-20">
      <div className="mx-auto max-w-md">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-stone">{description}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-stone">{footer}</div>}
      </div>
    </div>
  );
}

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialActionState);
  return (
    <form action={action} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {notice && <FormMessage type="success">{notice}</FormMessage>}
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email} required>
        <Input id="email" name="email" type="email" autoComplete="email" required invalid={Boolean(state.fieldErrors?.email)} />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password} required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required invalid={Boolean(state.fieldErrors?.password)} />
      </Field>
      <div className="flex items-center justify-between">
        <Link href="/forgot-password" className="text-xs uppercase tracking-[0.14em] underline underline-offset-4">Forgot password?</Link>
      </div>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Log in
      </Button>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(registerAction, initialActionState);
  return (
    <form action={action} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={state.fieldErrors?.firstName} required>
          <Input id="firstName" name="firstName" autoComplete="given-name" required invalid={Boolean(state.fieldErrors?.firstName)} />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={state.fieldErrors?.lastName} required>
          <Input id="lastName" name="lastName" autoComplete="family-name" required invalid={Boolean(state.fieldErrors?.lastName)} />
        </Field>
      </div>
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email} required>
        <Input id="email" name="email" type="email" autoComplete="email" required invalid={Boolean(state.fieldErrors?.email)} />
      </Field>
      <Field label="Phone number" htmlFor="phone" error={state.fieldErrors?.phone} hint="Optional — for delivery updates.">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="0803 000 0000" invalid={Boolean(state.fieldErrors?.phone)} />
      </Field>
      <Field label="Password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 8 characters." required>
        <Input id="password" name="password" type="password" autoComplete="new-password" required invalid={Boolean(state.fieldErrors?.password)} />
      </Field>
      <Field label="Confirm password" htmlFor="confirmPassword" error={state.fieldErrors?.confirmPassword} required>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required invalid={Boolean(state.fieldErrors?.confirmPassword)} />
      </Field>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Create account
      </Button>
      <p className="text-xs leading-relaxed text-stone">
        By creating an account you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialActionState);
  if (state.ok) {
    return (
      <div className="space-y-4">
        <FormMessage type="success">{state.message}</FormMessage>
        {state.data?.resetUrl && (
          <a href={state.data.resetUrl} className="block break-all border border-dashed border-line bg-cream px-4 py-3 text-sm underline underline-offset-4">
            {state.data.resetUrl}
          </a>
        )}
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <Field label="Email" htmlFor="email" error={state.fieldErrors?.email} required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialActionState);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <Field label="New password" htmlFor="password" error={state.fieldErrors?.password} hint="At least 8 characters." required>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" error={state.fieldErrors?.confirmPassword} required>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Update password
      </Button>
    </form>
  );
}

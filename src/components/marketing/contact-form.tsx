"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/form-fields";
import { submitContactAction } from "@/lib/actions/engagement";
import { initialActionState } from "@/types";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactAction, initialActionState);

  if (state.ok) {
    return <FormMessage type="success">{state.message}</FormMessage>;
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={state.fieldErrors?.name} required>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="contact-email" error={state.fieldErrors?.email} required>
          <Input id="contact-email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Phone / WhatsApp" htmlFor="contact-phone" error={state.fieldErrors?.phone}>
          <Input id="contact-phone" name="phone" type="tel" />
        </Field>
        <Field label="Subject" htmlFor="subject" error={state.fieldErrors?.subject}>
          <Input id="subject" name="subject" placeholder="Order enquiry, scent advice…" />
        </Field>
      </div>
      <Field label="Message" htmlFor="message" error={state.fieldErrors?.message} required>
        <Textarea id="message" name="message" required />
      </Field>
      <Button type="submit" size="lg" loading={pending}>
        Send message
      </Button>
    </form>
  );
}

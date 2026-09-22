"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Textarea } from "@/components/ui/form-fields";
import { saveSiteContentAction } from "@/lib/actions/admin";
import type { SiteContent } from "@/lib/site-content";
import { initialActionState } from "@/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white p-5">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-stone">{title}</h2>
      {children}
    </section>
  );
}

export function AnnouncementForm({ content }: { content: SiteContent["announcement"] }) {
  const [state, action, pending] = useActionState(saveSiteContentAction, initialActionState);
  return (
    <Section title="Announcement bar">
      <form action={action} className="space-y-4">
        <input type="hidden" name="key" value="announcement" />
        {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
        {state.error && <FormMessage type="error">{state.error}</FormMessage>}
        <Field label="Text" htmlFor="ann-text"><Input id="ann-text" name="text" defaultValue={content.text} /></Field>
        <Field label="Link" htmlFor="ann-href"><Input id="ann-href" name="href" defaultValue={content.href} /></Field>
        <Checkbox name="enabled" label="Show announcement bar" defaultChecked={content.enabled} />
        <Button type="submit" loading={pending} size="sm">Save</Button>
      </form>
    </Section>
  );
}

export function HeroForm({ content }: { content: SiteContent["hero"] }) {
  const [state, action, pending] = useActionState(saveSiteContentAction, initialActionState);
  return (
    <Section title="Hero section">
      <form action={action} className="space-y-4">
        <input type="hidden" name="key" value="hero" />
        {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
        {state.error && <FormMessage type="error">{state.error}</FormMessage>}
        <Field label="Eyebrow" htmlFor="hero-eyebrow"><Input id="hero-eyebrow" name="eyebrow" defaultValue={content.eyebrow} /></Field>
        <Field label="Headline" htmlFor="hero-headline"><Input id="hero-headline" name="headline" defaultValue={content.headline} /></Field>
        <Field label="Sub-headline" htmlFor="hero-sub"><Textarea id="hero-sub" name="subheadline" defaultValue={content.subheadline} className="min-h-[72px]" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary button" htmlFor="hero-cta1"><Input id="hero-cta1" name="primaryCta" defaultValue={content.primaryCta} /></Field>
          <Field label="Primary link" htmlFor="hero-href1"><Input id="hero-href1" name="primaryHref" defaultValue={content.primaryHref} /></Field>
          <Field label="Secondary button" htmlFor="hero-cta2"><Input id="hero-cta2" name="secondaryCta" defaultValue={content.secondaryCta} /></Field>
          <Field label="Secondary link" htmlFor="hero-href2"><Input id="hero-href2" name="secondaryHref" defaultValue={content.secondaryHref} /></Field>
        </div>
        <Field label="Image URL" htmlFor="hero-image"><Input id="hero-image" name="image" defaultValue={content.image} /></Field>
        <Button type="submit" loading={pending} size="sm">Save</Button>
      </form>
    </Section>
  );
}

export function PromoForm({ content }: { content: SiteContent["promo"] }) {
  const [state, action, pending] = useActionState(saveSiteContentAction, initialActionState);
  return (
    <Section title="Final call-to-action">
      <form action={action} className="space-y-4">
        <input type="hidden" name="key" value="promo" />
        {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
        {state.error && <FormMessage type="error">{state.error}</FormMessage>}
        <Field label="Eyebrow" htmlFor="promo-eyebrow"><Input id="promo-eyebrow" name="eyebrow" defaultValue={content.eyebrow} /></Field>
        <Field label="Headline" htmlFor="promo-headline"><Input id="promo-headline" name="headline" defaultValue={content.headline} /></Field>
        <Field label="Body" htmlFor="promo-body"><Textarea id="promo-body" name="body" defaultValue={content.body} className="min-h-[72px]" /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Button" htmlFor="promo-cta"><Input id="promo-cta" name="cta" defaultValue={content.cta} /></Field>
          <Field label="Link" htmlFor="promo-href"><Input id="promo-href" name="href" defaultValue={content.href} /></Field>
          <Field label="Coupon code shown" htmlFor="promo-code"><Input id="promo-code" name="couponCode" defaultValue={content.couponCode} /></Field>
        </div>
        <Button type="submit" loading={pending} size="sm">Save</Button>
      </form>
    </Section>
  );
}

export function BusinessCopyForm({ content }: { content: SiteContent["business"] }) {
  const [state, action, pending] = useActionState(saveSiteContentAction, initialActionState);
  return (
    <Section title="Store copy, bank details and payment instructions">
      <form action={action} className="space-y-4">
        <input type="hidden" name="key" value="business" />
        {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
        {state.error && <FormMessage type="error">{state.error}</FormMessage>}

        <Field label="Footer tagline" htmlFor="business-footer-tagline">
          <Textarea id="business-footer-tagline" name="footerTagline" defaultValue={content.footerTagline} className="min-h-[72px]" />
        </Field>
        <Field label="Footer payment note" htmlFor="business-footer-payment-note">
          <Input id="business-footer-payment-note" name="footerPaymentNote" defaultValue={content.footerPaymentNote} />
        </Field>
        <Field label="Checkout intro" htmlFor="business-checkout-intro">
          <Textarea id="business-checkout-intro" name="checkoutIntro" defaultValue={content.checkoutIntro} className="min-h-[72px]" />
        </Field>
        <Field label="Payment verification warning" htmlFor="business-payment-note">
          <Textarea id="business-payment-note" name="paymentVerificationNote" defaultValue={content.paymentVerificationNote} className="min-h-[72px]" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp payment title" htmlFor="business-whatsapp-title">
            <Input id="business-whatsapp-title" name="whatsappPaymentTitle" defaultValue={content.whatsappPaymentTitle} />
          </Field>
          <Field label="Bank transfer title" htmlFor="business-bank-title">
            <Input id="business-bank-title" name="bankTransferTitle" defaultValue={content.bankTransferTitle} />
          </Field>
          <Field label="WhatsApp payment body" htmlFor="business-whatsapp-body">
            <Textarea id="business-whatsapp-body" name="whatsappPaymentBody" defaultValue={content.whatsappPaymentBody} className="min-h-[112px]" />
          </Field>
          <Field label="Bank transfer body" htmlFor="business-bank-body">
            <Textarea id="business-bank-body" name="bankTransferBody" defaultValue={content.bankTransferBody} className="min-h-[112px]" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Bank name" htmlFor="business-bank-name">
            <Input id="business-bank-name" name="bankName" defaultValue={content.bankName} />
          </Field>
          <Field label="Account name" htmlFor="business-account-name">
            <Input id="business-account-name" name="bankAccountName" defaultValue={content.bankAccountName} />
          </Field>
          <Field label="Account number" htmlFor="business-account-number">
            <Input id="business-account-number" name="bankAccountNumber" defaultValue={content.bankAccountNumber} />
          </Field>
        </div>

        <Field
          label="Website transfer instructions"
          htmlFor="business-transfer-instructions"
          hint="You can use {total} and {orderNumber}; the site replaces them automatically."
        >
          <Textarea id="business-transfer-instructions" name="bankTransferInstructions" defaultValue={content.bankTransferInstructions} className="min-h-[96px]" />
        </Field>
        <Field
          label="WhatsApp payment instructions"
          htmlFor="business-whatsapp-instructions"
          hint="You can use {total} and {orderNumber}; the site replaces them automatically."
        >
          <Textarea id="business-whatsapp-instructions" name="whatsappOrderInstructions" defaultValue={content.whatsappOrderInstructions} className="min-h-[96px]" />
        </Field>
        <Field label="Payment reported notice" htmlFor="business-submitted-notice">
          <Textarea id="business-submitted-notice" name="submittedPaymentNotice" defaultValue={content.submittedPaymentNotice} className="min-h-[72px]" />
        </Field>

        <Button type="submit" loading={pending} size="sm">Save</Button>
      </form>
    </Section>
  );
}

export function DeliverySettingsForm({ content }: { content: SiteContent["delivery"] }) {
  const [state, action, pending] = useActionState(saveSiteContentAction, initialActionState);
  return (
    <Section title="Delivery fees and timelines">
      <form action={action} className="space-y-4">
        <input type="hidden" name="key" value="delivery" />
        {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
        {state.error && <FormMessage type="error">{state.error}</FormMessage>}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Lagos fee" htmlFor="delivery-lagos-fee">
            <Input id="delivery-lagos-fee" name="lagosFee" type="number" min="0" defaultValue={content.lagosFee} />
          </Field>
          <Field label="Nearby-state fee" htmlFor="delivery-regional-fee">
            <Input id="delivery-regional-fee" name="regionalFee" type="number" min="0" defaultValue={content.regionalFee} />
          </Field>
          <Field label="Other states fee" htmlFor="delivery-default-fee">
            <Input id="delivery-default-fee" name="defaultFee" type="number" min="0" defaultValue={content.defaultFee} />
          </Field>
          <Field label="Free Lagos delivery from" htmlFor="delivery-lagos-threshold">
            <Input id="delivery-lagos-threshold" name="freeDeliveryThreshold" type="number" min="0" defaultValue={content.freeDeliveryThreshold} />
          </Field>
          <Field label="Free interstate delivery from" htmlFor="delivery-interstate-threshold">
            <Input id="delivery-interstate-threshold" name="interstateFreeDeliveryThreshold" type="number" min="0" defaultValue={content.interstateFreeDeliveryThreshold} />
          </Field>
          <Field label="Nearby states" htmlFor="delivery-regional-states" hint="Separate states with commas.">
            <Input id="delivery-regional-states" name="regionalStates" defaultValue={content.regionalStates.join(", ")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Lagos timeline" htmlFor="delivery-lagos-eta">
            <Input id="delivery-lagos-eta" name="lagosEta" defaultValue={content.lagosEta} />
          </Field>
          <Field label="Nearby-state timeline" htmlFor="delivery-regional-eta">
            <Input id="delivery-regional-eta" name="regionalEta" defaultValue={content.regionalEta} />
          </Field>
          <Field label="Other states timeline" htmlFor="delivery-default-eta">
            <Input id="delivery-default-eta" name="defaultEta" defaultValue={content.defaultEta} />
          </Field>
        </div>

        <Button type="submit" loading={pending} size="sm">Save</Button>
      </form>
    </Section>
  );
}

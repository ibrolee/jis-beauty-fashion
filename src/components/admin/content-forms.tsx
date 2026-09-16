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

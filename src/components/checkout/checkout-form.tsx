"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { CouponForm } from "@/components/cart/cart-view";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form-fields";
import type { Address } from "@/db/schema";
import { placeOrder } from "@/lib/actions/checkout";
import type { SessionUser } from "@/lib/auth/session";
import { DELIVERY, NIGERIAN_STATES, getDeliveryFee, getDeliveryZone } from "@/lib/constants";
import { cn, formatNaira } from "@/lib/utils";

type Props = { user: SessionUser | null; savedAddress: Address | null; paystackEnabled: boolean };
type CheckoutPayment = "whatsapp" | "bank_transfer";

export function CheckoutForm({ user, savedAddress }: Props) {
  const { items, hydrated, subtotal, discount, coupon, clearCart } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<string>(savedAddress?.state ?? "");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPayment>("whatsapp");
  const deliveryFee = useMemo(() => getDeliveryFee(state, subtotal), [state, subtotal]);
  const total = subtotal - discount + deliveryFee;
  const eta = state ? getDeliveryZone(state).eta : null;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      whatsapp: String(fd.get("whatsapp") ?? ""),
      state: String(fd.get("state") ?? "") as (typeof NIGERIAN_STATES)[number],
      city: String(fd.get("city") ?? ""),
      address: String(fd.get("address") ?? ""),
      instructions: String(fd.get("instructions") ?? ""),
      paymentMethod,
      couponCode: coupon?.code ?? "",
      saveAddress: fd.get("saveAddress") === "on",
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    };
    startTransition(async () => {
      try {
        const result = await placeOrder(payload);
        if (result.ok) {
          clearCart();
          if (result.redirectUrl) window.location.assign(result.redirectUrl);
          else router.push(`/order/${result.orderNumber}`);
          return;
        }
        if (result.orderNumber) {
          clearCart();
          router.push(`/order/${result.orderNumber}?payment=failed`);
          return;
        }
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        setError("We couldn't place your order. Please check your connection and try again.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (!hydrated) return <div className="h-96 animate-pulse bg-ivory" aria-busy />;
  if (!items.length) return <EmptyState icon={ShoppingBag} title="Nothing to check out yet" description="Your bag is empty. Add a fragrance or two and come back." action={<ButtonLink href="/shop">Browse the collection</ButtonLink>} />;

  const paymentOptions: { value: CheckoutPayment; title: string; body: string }[] = [
    { value: "whatsapp", title: "Instant payment on WhatsApp", body: "Place your order to open WhatsApp with product links, reference and exact total. Request our bank details, transfer within six hours, then return to your order page and select 'I have paid — request verification'. We verify the bank receipt manually." },
    { value: "bank_transfer", title: "Bank transfer on this website", body: "Place your order to view JIS's confirmed GTBank account details and your exact total on the order page. Transfer within six hours, then select 'I have transferred the amount' on your order page. Reported payments are held for manual review; unreported, unpaid orders are eligible for cancellation after six hours." },
  ];

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-12" noValidate>
      <div className="space-y-10 lg:col-span-7">
        {error && <FormMessage type="error">{error}</FormMessage>}
        {!user && <p className="border border-line bg-cream px-4 py-3 text-sm text-ink-soft">Have an account? <Link href="/login?next=/checkout" className="text-ink underline underline-offset-4">Log in</Link> for faster checkout. Otherwise, continue as a guest.</p>}
        <section aria-labelledby="contact-heading" className="space-y-5">
          <h2 id="contact-heading" className="font-serif text-2xl">Contact</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First name" htmlFor="firstName" error={fieldErrors.firstName} required><Input id="firstName" name="firstName" autoComplete="given-name" required defaultValue={savedAddress?.firstName ?? user?.firstName ?? ""} invalid={Boolean(fieldErrors.firstName)} /></Field>
            <Field label="Last name" htmlFor="lastName" error={fieldErrors.lastName} required><Input id="lastName" name="lastName" autoComplete="family-name" required defaultValue={savedAddress?.lastName ?? user?.lastName ?? ""} invalid={Boolean(fieldErrors.lastName)} /></Field>
            <Field label="Email" htmlFor="email" error={fieldErrors.email} required hint="Used for your order reference and updates."><Input id="email" name="email" type="email" autoComplete="email" required defaultValue={user?.email ?? ""} invalid={Boolean(fieldErrors.email)} /></Field>
            <Field label="Phone number" htmlFor="phone" error={fieldErrors.phone} required><Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 000 0000" required defaultValue={savedAddress?.phone ?? user?.phone ?? ""} invalid={Boolean(fieldErrors.phone)} /></Field>
            <Field label="WhatsApp number" htmlFor="whatsapp" error={fieldErrors.whatsapp} hint="If different from your phone number." className="sm:col-span-2"><Input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" placeholder="Optional" defaultValue={user?.whatsapp ?? ""} invalid={Boolean(fieldErrors.whatsapp)} /></Field>
          </div>
        </section>
        <section aria-labelledby="delivery-heading" className="space-y-5">
          <h2 id="delivery-heading" className="font-serif text-2xl">Delivery</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="State" htmlFor="state" error={fieldErrors.state} required><Select id="state" name="state" required value={state} onChange={(e) => setState(e.target.value)} invalid={Boolean(fieldErrors.state)}><option value="" disabled>Select state</option>{NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
            <Field label="City / Area" htmlFor="city" error={fieldErrors.city} required><Input id="city" name="city" autoComplete="address-level2" placeholder="e.g. Lekki Phase 1" required defaultValue={savedAddress?.city ?? ""} invalid={Boolean(fieldErrors.city)} /></Field>
            <Field label="Delivery address" htmlFor="address" error={fieldErrors.address} required className="sm:col-span-2"><Textarea id="address" name="address" autoComplete="street-address" placeholder="House number, street, estate, landmark…" required defaultValue={savedAddress?.addressLine ?? ""} invalid={Boolean(fieldErrors.address)} className="min-h-[88px]" /></Field>
            <Field label="Additional delivery instructions" htmlFor="instructions" error={fieldErrors.instructions} className="sm:col-span-2"><Textarea id="instructions" name="instructions" placeholder="Gate code, best time to deliver, who to call…" defaultValue={savedAddress?.instructions ?? ""} className="min-h-[72px]" /></Field>
          </div>
          {eta && <p className="text-sm text-stone">Estimated delivery to {state}: <span className="text-ink">{eta}</span>{deliveryFee === 0 ? <span className="text-success"> · Free delivery</span> : ` · ${formatNaira(deliveryFee)}`}</p>}
          {user && <Checkbox name="saveAddress" label="Save this address to my account for next time" defaultChecked={!savedAddress} />}
        </section>
        <section aria-labelledby="payment-heading" className="space-y-5">
          <h2 id="payment-heading" className="font-serif text-2xl">Payment</h2>
          {fieldErrors.paymentMethod && <p className="text-xs text-sale">{fieldErrors.paymentMethod}</p>}
          <div className="space-y-3" role="radiogroup" aria-label="Payment method">
            {paymentOptions.map((opt) => <label key={opt.value} className={cn("flex cursor-pointer gap-4 border p-4 transition-colors", paymentMethod === opt.value ? "border-ink bg-cream" : "border-line hover:border-stone")}><input type="radio" name="paymentMethod" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="mt-1 h-4 w-4 accent-ink" /><span className="flex-1"><span className="block text-sm font-medium">{opt.title}</span><span className="mt-1 block text-xs leading-relaxed text-stone">{opt.body}</span></span></label>)}
          </div>
          <p className="text-xs text-stone">Payment is confirmed only after we verify that your transfer has reached our account. Merely opening WhatsApp or reporting payment does not confirm it.</p>
        </section>
      </div>
      <aside className="lg:col-span-5"><div className="border border-line bg-cream p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl">Your order</h2>
        <ul className="mt-5 max-h-80 divide-y divide-line overflow-y-auto">{items.map((item) => <li key={item.key} className="flex gap-4 py-3"><div className="relative h-16 w-14 shrink-0 overflow-hidden bg-ivory">{item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}<span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center bg-ink px-1 text-[10px] text-white">{item.quantity}</span></div><div className="flex-1 text-sm"><p className="font-medium leading-tight">{item.name}</p><p className="text-xs text-stone">{item.variantName ?? item.brandName}</p></div><p className="text-sm tabular-nums">{formatNaira(item.price * item.quantity)}</p></li>)}</ul>
        <div className="mt-4 border-t border-line pt-4"><CouponForm compact /></div>
        <dl className="mt-5 space-y-2.5 text-sm"><div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{formatNaira(subtotal)}</dd></div>{discount > 0 && <div className="flex justify-between text-success"><dt>Discount ({coupon?.code})</dt><dd className="tabular-nums">−{formatNaira(discount)}</dd></div>}<div className="flex justify-between"><dt className="text-stone">Delivery</dt><dd className="tabular-nums">{!state ? <span className="text-xs text-stone">Select state</span> : deliveryFee === 0 ? <span className="text-success">Free</span> : formatNaira(deliveryFee)}</dd></div><div className="flex justify-between border-t border-line pt-3 text-lg font-medium"><dt>Total</dt><dd className="tabular-nums">{formatNaira(total)}</dd></div></dl>
        {state && deliveryFee > 0 && <p className="mt-2 text-xs text-stone">{state === "Lagos" ? `Free Lagos delivery from ${formatNaira(DELIVERY.freeDeliveryThreshold)}.` : `Free interstate delivery from ${formatNaira(DELIVERY.interstateFreeDeliveryThreshold)}.`}</p>}
        {!state && <p className="mt-2 text-xs text-stone">Free interstate delivery from {formatNaira(DELIVERY.interstateFreeDeliveryThreshold)}; free Lagos delivery from {formatNaira(DELIVERY.freeDeliveryThreshold)}. Select a state for your final total.</p>}
        <Button type="submit" size="lg" loading={pending} className="mt-6 w-full">{paymentMethod === "whatsapp" ? "Place order & open WhatsApp" : "Place order & view bank details"}</Button>
        <p className="mt-3 text-center text-xs text-stone">By placing your order you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/returns" className="underline">returns policy</Link>.</p>
      </div></aside>
    </form>
  );
}

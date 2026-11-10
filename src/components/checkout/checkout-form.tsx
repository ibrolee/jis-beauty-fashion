"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { CouponForm } from "@/components/cart/cart-view";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FormMessage, Input } from "@/components/ui/form-fields";
import type { Address } from "@/db/schema";
import { placeOrder } from "@/lib/actions/checkout";
import type { SessionUser } from "@/lib/auth/session";
import type { SiteContent } from "@/lib/site-content";
import { NIGERIAN_STATES, getDeliveryFee, getDeliveryZone } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

type Props = { user: SessionUser | null; savedAddress: Address | null; paystackEnabled: boolean; delivery: SiteContent["delivery"] };
const PICKUP_ADDRESS = "No. 105 Apata Street, Shomolu, Lagos, Nigeria";

export function CheckoutForm({ user, savedAddress, paystackEnabled, delivery }: Props) {
  const { items, hydrated, subtotal, discount, coupon, clearCart } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"delivery" | "pickup">("delivery");
  const [state, setState] = useState(savedAddress?.state ?? "Lagos");
  const [city, setCity] = useState(savedAddress?.city ?? "Shomolu");
  const [address, setAddress] = useState(savedAddress?.addressLine ?? "");
  const [instructions, setInstructions] = useState(savedAddress?.instructions ?? "");
  const deliveryFee = fulfillmentMethod === "pickup" ? 0 : getDeliveryFee(state, subtotal, delivery);
  const total = subtotal - discount + deliveryFee;
  const zone = getDeliveryZone(state, delivery);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const payload = {
      fulfillmentMethod,
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      whatsapp: String(fd.get("whatsapp") ?? ""),
      state: fulfillmentMethod === "pickup" ? "Lagos" as const : state as (typeof NIGERIAN_STATES)[number],
      city: fulfillmentMethod === "pickup" ? "Shomolu" : city,
      address: fulfillmentMethod === "pickup" ? PICKUP_ADDRESS : address,
      instructions: fulfillmentMethod === "pickup" ? "" : instructions,
      paymentMethod: "paystack" as const,
      couponCode: coupon?.code ?? "",
      saveAddress: Boolean(user) && fulfillmentMethod === "delivery" && fd.get("saveAddress") === "on",
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    };
    startTransition(async () => {
      try {
        const result = await placeOrder(payload);
        if (result.ok) {
          if (result.redirectUrl) window.location.assign(result.redirectUrl);
          else router.push(`/order/${result.orderNumber}`);
          return;
        }
        if (result.orderNumber) {
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
          <h2 id="delivery-heading" className="font-serif text-2xl">Fulfillment</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={`flex cursor-pointer gap-3 border p-4 ${fulfillmentMethod === "delivery" ? "border-ink bg-cream" : "border-line"}`}>
              <input type="radio" name="fulfillmentMethod" value="delivery" checked={fulfillmentMethod === "delivery"} onChange={() => setFulfillmentMethod("delivery")} className="mt-1 accent-ink" />
              <span><span className="block text-sm font-medium">Home delivery</span><span className="mt-1 block text-xs text-stone">Delivered to your address</span></span>
            </label>
            <label className={`flex cursor-pointer gap-3 border p-4 ${fulfillmentMethod === "pickup" ? "border-ink bg-cream" : "border-line"}`}>
              <input type="radio" name="fulfillmentMethod" value="pickup" checked={fulfillmentMethod === "pickup"} onChange={() => setFulfillmentMethod("pickup")} className="mt-1 accent-ink" />
              <span><span className="block text-sm font-medium">Pickup</span><span className="mt-1 block text-xs text-stone">Free collection in Shomolu</span></span>
            </label>
          </div>
          {fulfillmentMethod === "pickup" ? (
            <div className="border border-line bg-cream p-4 text-sm"><p className="font-medium">Pickup · Free</p><address className="mt-1 not-italic text-ink-soft">{PICKUP_ADDRESS}</address><p className="mt-2 text-xs text-stone">We’ll notify you by email when your order is packed and ready to collect.</p></div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="State" htmlFor="state" error={fieldErrors.state} required>
                <select id="state" name="state" value={state} onChange={(e) => setState(e.target.value)} required className="w-full border border-line bg-white px-4 py-3 text-sm text-ink focus:border-ink focus:outline-none">
                  <option value="">Select state</option>{NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="City / town" htmlFor="city" error={fieldErrors.city} required><Input id="city" name="city" value={city} onChange={(e) => setCity(e.target.value)} required invalid={Boolean(fieldErrors.city)} placeholder="Your city or town" /></Field>
              <Field label="Full delivery address" htmlFor="address" error={fieldErrors.address} required className="sm:col-span-2"><Input id="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} required invalid={Boolean(fieldErrors.address)} placeholder="Street, house number, area" /></Field>
              <Field label="Delivery instructions" htmlFor="instructions" hint="Optional" className="sm:col-span-2"><Input id="instructions" name="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Landmark or instructions for the rider" /></Field>
              {user && <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="saveAddress" defaultChecked={false} className="accent-ink" /> Save this address to my account</label>}
              <p className="text-xs text-stone sm:col-span-2">Estimated delivery: {zone.eta}. Delivery fee is calculated for {state || "your state"} and shown in your order summary.</p>
            </div>
          )}
        </section>
        <section aria-labelledby="payment-heading" className="space-y-5">
          <h2 id="payment-heading" className="font-serif text-2xl">Payment</h2>
          <label className="flex cursor-pointer gap-4 border border-ink bg-cream p-4"><input type="radio" checked readOnly className="mt-1 h-4 w-4 accent-ink" /><span className="flex-1"><span className="block text-sm font-medium">Pay online with Paystack</span><span className="mt-1 block text-xs leading-relaxed text-stone">Secure payment by card, bank transfer and supported methods.</span></span></label>
          {!paystackEnabled && <FormMessage type="error">Online payment is temporarily unavailable.</FormMessage>}
        </section>
      </div>
      <aside className="lg:col-span-5"><div className="border border-line bg-cream p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl">Your order</h2>
        <ul className="mt-5 max-h-80 divide-y divide-line overflow-y-auto">{items.map((item) => <li key={item.key} className="flex gap-4 py-3"><div className="relative h-16 w-14 shrink-0 overflow-hidden bg-ivory">{item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}<span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center bg-ink px-1 text-[10px] text-white">{item.quantity}</span></div><div className="flex-1 text-sm"><p className="font-medium leading-tight">{item.name}</p><p className="text-xs text-stone">{item.variantName ?? item.brandName}</p></div><p className="text-sm tabular-nums">{formatNaira(item.price * item.quantity)}</p></li>)}</ul>
        <div className="mt-4 border-t border-line pt-4"><CouponForm compact /></div>
        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{formatNaira(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-success"><dt>Discount ({coupon?.code})</dt><dd className="tabular-nums">−{formatNaira(discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-stone">{fulfillmentMethod === "pickup" ? "Pickup" : "Home delivery"}</dt><dd className="tabular-nums">{deliveryFee === 0 ? <span className="text-success">Free</span> : formatNaira(deliveryFee)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-medium"><dt>Total</dt><dd className="tabular-nums">{formatNaira(total)}</dd></div>
        </dl>
        <Button type="submit" size="lg" loading={pending} disabled={!paystackEnabled} className="mt-6 w-full">Pay securely with Paystack</Button>
        <p className="mt-3 text-center text-xs text-stone">By placing your order you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/returns" className="underline">returns policy</Link>.</p>
      </div></aside>
    </form>
  );
}

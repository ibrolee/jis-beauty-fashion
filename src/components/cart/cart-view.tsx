"use client";

import { ArrowRight, Minus, Plus, ShoppingBag, Tag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DELIVERY } from "@/lib/constants";
import { describeCoupon } from "@/lib/coupons";
import { formatNaira } from "@/lib/utils";
import { useCart } from "./cart-provider";

export function CouponForm({ compact = false }: { compact?: boolean }) {
  const { coupon, applyCoupon, removeCoupon, discount } = useCart();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;
    setPending(true);
    try {
      const result = await applyCoupon(code.trim().toUpperCase());
      setStatus(result);
      if (result.ok) setCode("");
    } finally {
      setPending(false);
    }
  }

  if (coupon) {
    return (
      <div className="flex items-start justify-between gap-3 border border-success/30 bg-green-50/60 px-4 py-4 text-sm">
        <div>
          <p className="flex items-center gap-2 font-medium text-success"><Tag className="h-4 w-4" aria-hidden="true" /> {coupon.code} applied</p>
          <p className="mt-1 text-xs leading-relaxed text-stone">{describeCoupon(coupon)} · saving {formatNaira(discount)}</p>
        </div>
        <button type="button" onClick={() => { removeCoupon(); setStatus(null); }} className="flex h-8 w-8 shrink-0 items-center justify-center text-stone hover:text-ink" aria-label="Remove coupon"><X className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="coupon" className={compact ? "sr-only" : "block text-[10px] font-medium uppercase tracking-[0.2em] text-stone"}>Discount code</label>
      <div className="flex min-w-0 gap-2">
        <input id="coupon" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Enter your code" className="h-12 min-w-0 flex-1 border border-line bg-white px-4 text-xs uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal focus:border-ink focus:outline-none" autoComplete="off" />
        <Button type="submit" variant="secondary" loading={pending} disabled={!code.trim()}>Apply</Button>
      </div>
      {status && <p className={status.ok ? "text-xs text-success" : "text-xs text-sale"} role="status">{status.message}</p>}
    </form>
  );
}

export function CartSummary({ state, showCheckout = true }: { state?: string | null; showCheckout?: boolean }) {
  const { subtotal, discount, itemCount } = useCart();
  const estimatedDelivery = state ? (subtotal >= DELIVERY.freeDeliveryThreshold ? 0 : null) : null;
  const total = subtotal - discount + (estimatedDelivery ?? 0);

  return (
    <div className="border border-line bg-[#f5f0e8] p-6 sm:p-8">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-rosewood">Your order / Summary</p>
      <h2 className="font-serif text-4xl leading-tight text-ink">The final edit.</h2>
      <dl className="mt-8 space-y-4 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-stone">Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</dt><dd className="tabular-nums text-ink">{formatNaira(subtotal)}</dd></div>
        {discount > 0 && <div className="flex justify-between gap-4 text-success"><dt>Discount</dt><dd className="tabular-nums">−{formatNaira(discount)}</dd></div>}
        <div className="flex justify-between gap-4"><dt className="text-stone">Delivery</dt><dd className="text-right text-xs text-stone">{subtotal >= DELIVERY.freeDeliveryThreshold ? <span className="text-success">Free</span> : "Calculated at checkout"}</dd></div>
        <div className="flex items-end justify-between gap-4 border-t border-line pt-6"><dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone">Total before delivery</dt><dd className="font-serif text-3xl tabular-nums text-ink">{formatNaira(total)}</dd></div>
      </dl>
      {subtotal < DELIVERY.freeDeliveryThreshold && <p className="mt-5 border-l border-rosewood/50 pl-3 text-xs leading-5 text-stone">Add {formatNaira(DELIVERY.freeDeliveryThreshold - subtotal)} more for free nationwide delivery.</p>}
      {showCheckout && (
        <div className="mt-8 space-y-3">
          <ButtonLink href="/checkout" size="lg" className="w-full">Proceed to checkout <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
          <ButtonLink href="/shop" variant="ghost" size="md" className="w-full">Continue shopping</ButtonLink>
        </div>
      )}
      <p className="mt-5 border-t border-line pt-4 text-center text-[11px] leading-5 text-stone">Delivery is confirmed during checkout after you choose your state.</p>
    </div>
  );
}

export function CartView() {
  const { items, hydrated, setQuantity, removeItem } = useCart();

  if (!hydrated) return (
    <div className="grid gap-10 lg:grid-cols-12" aria-busy="true">
      <div className="space-y-4 lg:col-span-8">{[0, 1].map((index) => <div key={index} className="h-36 animate-pulse bg-ivory" />)}</div>
      <div className="h-80 animate-pulse bg-ivory lg:col-span-4" />
    </div>
  );

  if (!items.length) return (
    <EmptyState icon={ShoppingBag} title="Your bag is empty" description="Your next fragrance is waiting. Explore the collection and find something that feels like you." action={<><ButtonLink href="/shop">Explore fragrances</ButtonLink><ButtonLink href="/shop?bestSellers=1" variant="secondary">View best sellers</ButtonLink></>} />
  );

  return (
    <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
      <div className="min-w-0 lg:col-span-8">
        <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.19em] text-stone">Selected pieces</h2>
          <span className="text-[10px] font-medium uppercase tracking-[0.19em] text-stone">{items.length} product{items.length === 1 ? "" : "s"}</span>
        </div>
        <ul className="divide-y divide-line">
          {items.map((item) => {
            const atMax = item.quantity >= Math.min(20, item.maxStock || 20);
            return (
              <li key={item.key} className="flex min-w-0 gap-4 py-6 sm:gap-7 sm:py-8">
                <Link href={`/product/${item.slug}`} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-ivory sm:w-36" aria-label={`View ${item.name}`}>
                  {item.image ? <Image src={item.image} alt={item.name} fill sizes="(min-width: 640px) 144px, 96px" className="object-contain p-2 sm:p-3" /> : <span className="flex h-full items-center justify-center text-[10px] text-stone">No image</span>}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {item.brandName && <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-rosewood">{item.brandName}</p>}
                      <h3 className="font-serif text-xl leading-tight sm:text-3xl"><Link href={`/product/${item.slug}`} className="hover:text-rosewood">{item.name}</Link></h3>
                      {item.variantName && <p className="mt-2 text-xs text-stone">Selected: {item.variantName}</p>}
                    </div>
                    <button type="button" onClick={() => removeItem(item.key)} className="flex h-9 w-9 shrink-0 items-center justify-center text-stone transition-colors hover:text-ink" aria-label={`Remove ${item.name}`}><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-6">
                    <div className="flex h-11 items-center border border-line bg-white">
                      <button type="button" onClick={() => setQuantity(item.key, item.quantity - 1)} className="flex h-full w-10 items-center justify-center hover:bg-ivory" aria-label={`Decrease ${item.name} quantity`}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{item.quantity}</span>
                      <button type="button" onClick={() => setQuantity(item.key, item.quantity + 1)} disabled={atMax} className="flex h-full w-10 items-center justify-center hover:bg-ivory disabled:opacity-40" aria-label={`Increase ${item.name} quantity`}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-xl tabular-nums text-ink sm:text-2xl">{formatNaira(item.price * item.quantity)}</p>
                      {item.quantity > 1 && <p className="mt-1 text-xs text-stone">{formatNaira(item.price)} each</p>}
                      {item.compareAtPrice && <p className="text-xs text-stone line-through">{formatNaira(item.compareAtPrice * item.quantity)}</p>}
                    </div>
                  </div>
                  {atMax && item.maxStock <= 20 && <p className="mt-2 text-xs text-amber-700">Maximum available quantity reached.</p>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 max-w-md border-t border-line pt-7"><CouponForm /></div>
      </div>
      <aside className="lg:col-span-4"><div className="lg:sticky lg:top-40"><CartSummary /></div></aside>
    </div>
  );
}

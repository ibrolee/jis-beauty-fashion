"use client";

import { Minus, Plus, ShoppingBag, Tag, X } from "lucide-react";
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

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setPending(true);
    const result = await applyCoupon(code.trim().toUpperCase());
    setStatus(result);
    setPending(false);
    if (result.ok) setCode("");
  }

  if (coupon) {
    return (
      <div className="flex items-start justify-between gap-3 border border-dashed border-success/50 bg-green-50/60 px-4 py-3 text-sm">
        <div>
          <p className="flex items-center gap-2 font-medium text-success">
            <Tag className="h-4 w-4" /> {coupon.code} applied
          </p>
          <p className="mt-0.5 text-xs text-stone">
            {describeCoupon(coupon)} · saving {formatNaira(discount)}
          </p>
        </div>
        <button type="button" onClick={() => { removeCoupon(); setStatus(null); }} className="p-1 text-stone hover:text-ink" aria-label="Remove coupon">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor="coupon" className={compact ? "sr-only" : "block text-xs font-medium uppercase tracking-[0.14em] text-ink-soft"}>
        Discount code
      </label>
      <div className="flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. JISWELCOME"
          className="h-12 flex-1 border border-line px-4 text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal focus:border-ink focus:outline-none"
          autoComplete="off"
        />
        <Button type="submit" variant="secondary" loading={pending} disabled={!code.trim()}>
          Apply
        </Button>
      </div>
      {status && (
        <p className={status.ok ? "text-xs text-success" : "text-xs text-sale"} role="status">
          {status.message}
        </p>
      )}
    </form>
  );
}

export function CartSummary({ state, showCheckout = true }: { state?: string | null; showCheckout?: boolean }) {
  const { subtotal, discount, itemCount } = useCart();
  const estimatedDelivery = state ? (subtotal >= DELIVERY.freeDeliveryThreshold ? 0 : null) : null;
  const total = subtotal - discount + (estimatedDelivery ?? 0);

  return (
    <div className="border border-line bg-cream p-6">
      <h2 className="font-serif text-2xl">Order summary</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone">Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</dt>
          <dd className="tabular-nums">{formatNaira(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Discount</dt>
            <dd className="tabular-nums">−{formatNaira(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-stone">Delivery</dt>
          <dd className="text-right text-xs text-stone">{subtotal >= DELIVERY.freeDeliveryThreshold ? <span className="text-success">Free</span> : "Calculated at checkout"}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatNaira(total)}</dd>
        </div>
      </dl>
      {subtotal < DELIVERY.freeDeliveryThreshold && (
        <p className="mt-3 text-xs text-stone">
          Add {formatNaira(DELIVERY.freeDeliveryThreshold - subtotal)} more for free nationwide delivery.
        </p>
      )}
      {showCheckout && (
        <div className="mt-6 space-y-3">
          <ButtonLink href="/checkout" size="lg" className="w-full">
            Proceed to checkout
          </ButtonLink>
          <ButtonLink href="/shop" variant="ghost" size="md" className="w-full">
            Continue shopping
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

export function CartView() {
  const { items, hydrated, setQuantity, removeItem } = useCart();

  if (!hydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-12" aria-busy>
        <div className="space-y-4 lg:col-span-8">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-ivory" />
          ))}
        </div>
        <div className="h-72 animate-pulse bg-ivory lg:col-span-4" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your bag is empty"
        description="Looks like you haven't added anything yet. Discover best sellers and new arrivals — your signature scent is waiting."
        action={
          <>
            <ButtonLink href="/shop">Start shopping</ButtonLink>
            <ButtonLink href="/shop?bestSellers=1" variant="secondary">
              View best sellers
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => {
            const atMax = item.quantity >= Math.min(20, item.maxStock || 20);
            return (
              <li key={item.key} className="flex gap-4 py-6 sm:gap-6">
                <Link href={`/product/${item.slug}`} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-ivory sm:w-28">
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {item.brandName && <p className="eyebrow">{item.brandName}</p>}
                      <h3 className="font-serif text-xl leading-tight">
                        <Link href={`/product/${item.slug}`} className="hover:text-rosewood">{item.name}</Link>
                      </h3>
                      {item.variantName && <p className="mt-0.5 text-xs text-stone">Size: {item.variantName}</p>}
                    </div>
                    <button type="button" onClick={() => removeItem(item.key)} className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center text-stone hover:text-ink" aria-label={`Remove ${item.name}`}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                    <div className="flex h-10 items-center border border-line">
                      <button type="button" onClick={() => setQuantity(item.key, item.quantity - 1)} className="flex h-full w-10 items-center justify-center" aria-label="Decrease quantity">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{item.quantity}</span>
                      <button type="button" onClick={() => setQuantity(item.key, item.quantity + 1)} disabled={atMax} className="flex h-full w-10 items-center justify-center disabled:opacity-40" aria-label="Increase quantity">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums">{formatNaira(item.price * item.quantity)}</p>
                      {item.quantity > 1 && <p className="text-xs text-stone">{formatNaira(item.price)} each</p>}
                      {item.compareAtPrice && <p className="text-xs text-stone line-through">{formatNaira(item.compareAtPrice * item.quantity)}</p>}
                    </div>
                  </div>
                  {atMax && item.maxStock <= 20 && <p className="mt-2 text-xs text-amber-700">Maximum available quantity reached.</p>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 max-w-md">
          <CouponForm />
        </div>
      </div>
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getSiteContent } from "@/lib/data/settings";
import { getDefaultAddress } from "@/lib/data/users";
import { isOnlinePaymentEnabled } from "@/lib/payments";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [user, content] = await Promise.all([getCurrentUser(), getSiteContent()]);
  const savedAddress = user ? await getDefaultAddress(user.id) : null;

  return (
    <div className="jis-checkout min-h-[70svh] bg-cream pb-20 pt-8 lg:pb-28 lg:pt-14">
      <div className="container-x">
        <header className="mb-12 border-b border-line pb-8 lg:mb-14 lg:pb-12">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.23em] text-rosewood">JIS / Secure checkout</p>
            <Link href="/cart" className="text-[10px] font-medium uppercase tracking-[0.17em] text-ink underline underline-offset-4 hover:text-rosewood">← Edit your bag</Link>
          </div>
          <h1 className="font-serif text-[clamp(3.5rem,8vw,7rem)] leading-[0.92] tracking-[-0.035em] text-ink">Almost yours.</h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-stone">{content.business.checkoutIntro}</p>
          <ol className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-medium uppercase tracking-[0.16em] sm:gap-x-7" aria-label="Checkout steps">
            <li className="text-stone"><span className="mr-2 text-rosewood">01</span> Bag</li>
            <li className="text-stone" aria-hidden="true">/</li>
            <li className="text-ink" aria-current="step"><span className="mr-2 text-rosewood">02</span> Details & payment</li>
            <li className="text-stone" aria-hidden="true">/</li>
            <li className="text-stone"><span className="mr-2">03</span> Confirmation</li>
          </ol>
        </header>
        <CheckoutForm user={user} savedAddress={savedAddress ?? null} paystackEnabled={isOnlinePaymentEnabled()} content={content.business} />
      </div>
    </div>
  );
}

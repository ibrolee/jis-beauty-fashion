import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getDefaultAddress } from "@/lib/data/users";
import { isOnlinePaymentEnabled } from "@/lib/payments";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const savedAddress = user ? await getDefaultAddress(user.id) : null;

  return (
    <div className="container-x py-10 lg:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Almost there</p>
          <h1 className="font-serif text-4xl sm:text-5xl">Checkout</h1>
        </div>
        <Link href="/cart" className="text-xs font-medium uppercase tracking-[0.16em] underline underline-offset-4">
          Edit bag
        </Link>
      </header>
      <CheckoutForm user={user} savedAddress={savedAddress ?? null} paystackEnabled={isOnlinePaymentEnabled()} />
    </div>
  );
}

import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getSiteContent } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Shopping Bag", robots: { index: false } };

export default async function CartPage() {
  const content = await getSiteContent();
  return (
    <div className="min-h-[70svh] bg-cream pb-20 pt-9 lg:pb-28 lg:pt-16">
      <div className="container-x">
        <header className="mb-12 max-w-3xl lg:mb-16">
          <p className="mb-4 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em] text-rosewood"><span className="h-px w-8 bg-rosewood" aria-hidden="true" /> Your selection</p>
          <h1 className="font-serif text-[clamp(3.4rem,8vw,7.2rem)] leading-[0.92] tracking-[-0.035em] text-ink">Your shopping bag.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone">Everything you have chosen, gathered in one place. Review your selection before checkout.</p>
        </header>
        <CartView delivery={content.delivery} />
      </div>
    </div>
  );
}

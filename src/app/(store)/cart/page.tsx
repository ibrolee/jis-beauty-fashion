import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Shopping Bag", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-x py-10 lg:py-14">
      <header className="mb-8">
        <p className="eyebrow mb-3">Your selection</p>
        <h1 className="font-serif text-4xl sm:text-5xl">Shopping bag</h1>
      </header>
      <CartView />
    </div>
  );
}

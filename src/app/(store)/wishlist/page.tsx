import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="container-x py-10 lg:py-14">
      <header className="mb-8">
        <p className="eyebrow mb-3">Saved for later</p>
        <h1 className="font-serif text-4xl sm:text-5xl">Wishlist</h1>
      </header>
      <WishlistView />
    </div>
  );
}

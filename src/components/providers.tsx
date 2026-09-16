"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { ToastProvider } from "@/components/ui/toast";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";

export function Providers({ children, isAuthenticated }: { children: ReactNode; isAuthenticated: boolean }) {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider isAuthenticated={isAuthenticated}>{children}</WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}

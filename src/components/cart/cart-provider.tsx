"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { calculateCouponDiscount } from "@/lib/coupons";
import type { AppliedCoupon, CartItem } from "@/types";

/**
 * Client-side cart persisted to localStorage so it survives refreshes.
 * Everything money-related is re-validated on the server at checkout
 * (see src/lib/actions/checkout.ts) — this state is for UX only.
 */
const STORAGE_KEY = "jis_cart_v1";
const MAX_QTY = 20;

type State = { items: CartItem[]; coupon: AppliedCoupon | null; hydrated: boolean };

type Action =
  | { type: "hydrate"; state: Pick<State, "items" | "coupon"> }
  | { type: "add"; item: Omit<CartItem, "key" | "quantity">; quantity: number }
  | { type: "remove"; key: string }
  | { type: "setQuantity"; key: string; quantity: number }
  | { type: "clear" }
  | { type: "setCoupon"; coupon: AppliedCoupon | null };

function itemKey(productId: number, variantId: number | null) {
  return `${productId}:${variantId ?? 0}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state, hydrated: true };
    case "add": {
      const key = itemKey(action.item.productId, action.item.variantId);
      const existing = state.items.find((i) => i.key === key);
      const limit = Math.min(MAX_QTY, action.item.maxStock || MAX_QTY);
      if (existing) {
        const quantity = Math.min(limit, existing.quantity + action.quantity);
        return { ...state, items: state.items.map((i) => (i.key === key ? { ...i, ...action.item, quantity } : i)) };
      }
      return { ...state, items: [...state.items, { ...action.item, key, quantity: Math.min(limit, action.quantity) }] };
    }
    case "remove":
      return { ...state, items: state.items.filter((i) => i.key !== action.key) };
    case "setQuantity": {
      if (action.quantity <= 0) return { ...state, items: state.items.filter((i) => i.key !== action.key) };
      return {
        ...state,
        items: state.items.map((i) => (i.key === action.key ? { ...i, quantity: Math.min(Math.min(MAX_QTY, i.maxStock || MAX_QTY), action.quantity) } : i)),
      };
    }
    case "clear":
      return { ...state, items: [], coupon: null };
    case "setCoupon":
      return { ...state, coupon: action.coupon };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  discount: number;
  addItem: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], coupon: null, hydrated: false });

  // Load persisted cart on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<Pick<State, "items" | "coupon">>) : null;
      dispatch({ type: "hydrate", state: { items: Array.isArray(parsed?.items) ? parsed.items : [], coupon: parsed?.coupon ?? null } });
    } catch {
      dispatch({ type: "hydrate", state: { items: [], coupon: null } });
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (!state.hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items, coupon: state.coupon }));
  }, [state.items, state.coupon, state.hydrated]);

  const subtotal = useMemo(() => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0), [state.items]);
  const discount = useMemo(() => (state.coupon ? calculateCouponDiscount(state.coupon, subtotal) : 0), [state.coupon, subtotal]);
  const itemCount = useMemo(() => state.items.reduce((n, i) => n + i.quantity, 0), [state.items]);

  const applyCoupon = useCallback(
    async (code: string) => {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, subtotal }),
        });
        const data = (await res.json()) as { valid: boolean; coupon?: AppliedCoupon; reason?: string };
        if (!data.valid || !data.coupon) return { ok: false, message: data.reason ?? "Invalid coupon code." };
        dispatch({ type: "setCoupon", coupon: data.coupon });
        return { ok: true, message: `Coupon ${data.coupon.code} applied.` };
      } catch {
        return { ok: false, message: "Network error — please check your connection and try again." };
      }
    },
    [subtotal],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      coupon: state.coupon,
      hydrated: state.hydrated,
      itemCount,
      subtotal,
      discount,
      addItem: (item, quantity = 1) => dispatch({ type: "add", item, quantity }),
      removeItem: (key) => dispatch({ type: "remove", key }),
      setQuantity: (key, quantity) => dispatch({ type: "setQuantity", key, quantity }),
      clearCart: () => dispatch({ type: "clear" }),
      applyCoupon,
      removeCoupon: () => dispatch({ type: "setCoupon", coupon: null }),
    }),
    [state.items, state.coupon, state.hydrated, itemCount, subtotal, discount, applyCoupon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

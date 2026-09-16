import type { Brand, Category, Coupon, Product, ProductVariant, Review } from "@/db/schema";

/** Generic return shape for server actions used with `useActionState`. */
export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Optional payload (e.g. reset link in dev, redirect URL, order number) */
  data?: Record<string, string>;
};

export const initialActionState: ActionState = {};

/** Product row joined with the display fields the storefront needs. */
export type ProductListItem = Product & {
  categoryName: string;
  categorySlug: string;
  brandName: string | null;
  hasVariants: boolean;
};

export type ProductDetail = ProductListItem & {
  variants: ProductVariant[];
};

export type ReviewWithAuthor = Review & { authorName: string };

export type CategoryWithCount = Category & { productCount: number };

export type BrandWithCount = Brand & { productCount: number };

/** Line item stored in the browser (localStorage) until checkout. */
export type CartItem = {
  /** `${productId}:${variantId ?? 0}` */
  key: string;
  productId: number;
  variantId: number | null;
  slug: string;
  name: string;
  variantName: string | null;
  brandName: string | null;
  image: string;
  /** Unit price at time of adding (₦). Re-validated server-side at checkout. */
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  maxStock: number;
};

/** Coupon definition returned by the validation API (discount computed client-side, re-checked server-side). */
export type AppliedCoupon = Pick<Coupon, "code" | "type" | "value" | "minOrderAmount" | "maxDiscount">;

export type ProductFilters = {
  q?: string;
  category?: string;
  gender?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  newArrivals?: boolean;
  bestSellers?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
};

export type PaginatedProducts = {
  items: ProductListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

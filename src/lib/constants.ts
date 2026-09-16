import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/db/schema";

export const SITE = {
  name: "JIS Beauty & Fashion",
  shortName: "JIS",
  tagline: "Where beauty meets style",
  description:
    "Authentic designer-quality perfumes, perfume oils and beauty essentials delivered across Nigeria. Discover your signature scent with JIS Beauty & Fashion.",
  email: "hello@jisbeauty.ng",
  phone: "09042336294",
  whatsapp: "09042336294",
  whatsappUrl: "https://wa.me/2349042336294",
  instagram: "jisbeautyfashion",
  instagramUrl: "https://instagram.com/jisbeautyfashion",
  tiktok: "jisbeautyfashion",
  tiktokUrl: "https://tiktok.com/@jisbeautyfashion",
  address: "Lagos, Nigeria",
  currency: "NGN",
  locale: "en-NG",
} as const;

export const MAIN_NAV = [
  { label: "Shop All", href: "/shop" },
  { label: "Women", href: "/shop/women" },
  { label: "Men", href: "/shop/men" },
  { label: "Unisex", href: "/shop/unisex" },
  { label: "Kids", href: "/shop/kids" },
  { label: "Perfume Oils", href: "/shop/perfume-oils" },
  { label: "About", href: "/about" },
] as const;

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
] as const;

/**
 * Delivery pricing. Adjust freely — the checkout and cart both call
 * `getDeliveryFee()` so there is a single source of truth.
 */
export const DELIVERY = {
  freeDeliveryThreshold: 150_000,
  zones: [
    { states: ["Lagos"], fee: 2_500, eta: "1 – 2 business days" },
    { states: ["FCT - Abuja", "Ogun", "Oyo"], fee: 4_000, eta: "2 – 3 business days" },
  ],
  defaultFee: 4_500,
  defaultEta: "3 – 5 business days",
} as const;

export function getDeliveryZone(state: string) {
  const zone = DELIVERY.zones.find((z) => (z.states as readonly string[]).includes(state));
  return zone ? { fee: zone.fee, eta: zone.eta } : { fee: DELIVERY.defaultFee, eta: DELIVERY.defaultEta };
}

export function getDeliveryFee(state: string | null | undefined, subtotal: number): number {
  if (!state) return 0;
  if (subtotal >= DELIVERY.freeDeliveryThreshold) return 0;
  return getDeliveryZone(state).fee;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "payment_confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  payment_confirmed: "Payment Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Awaiting Payment",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  paystack: "Pay online (Card, Transfer, USSD) — Paystack",
  bank_transfer: "Direct bank transfer",
  pay_on_delivery: "Pay on delivery (Lagos only)",
};

export const PRODUCTS_PER_PAGE = 12;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
  { value: "rating", label: "Highest Rated" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const GENDER_LABELS = {
  women: "Women",
  men: "Men",
  unisex: "Unisex",
  kids: "Kids",
} as const;

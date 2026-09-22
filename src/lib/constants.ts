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
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
] as const;

/** Delivery pricing: shared by cart, checkout and the trusted server-side order action.
 * Interstate deliveries are free from ₦50,000; Lagos retains its existing
 * ₦150,000 free-delivery threshold. Thresholds use the order subtotal.
 */
export type DeliverySettings = {
  freeDeliveryThreshold: number;
  interstateFreeDeliveryThreshold: number;
  lagosFee: number;
  regionalFee: number;
  defaultFee: number;
  lagosEta: string;
  regionalEta: string;
  defaultEta: string;
  regionalStates: string[];
};

export const DELIVERY: DeliverySettings = {
  freeDeliveryThreshold: 150_000,
  interstateFreeDeliveryThreshold: 50_000,
  lagosFee: 2_500,
  regionalFee: 4_000,
  defaultFee: 4_500,
  lagosEta: "1 - 2 business days",
  regionalEta: "2 - 3 business days",
  defaultEta: "3 – 5 business days",
  regionalStates: ["FCT - Abuja", "Ogun", "Oyo"],
} as const;

export function getDeliveryZone(state: string, delivery: DeliverySettings = DELIVERY) {
  if (state === "Lagos") return { fee: delivery.lagosFee, eta: delivery.lagosEta };
  if (delivery.regionalStates.includes(state)) return { fee: delivery.regionalFee, eta: delivery.regionalEta };
  return { fee: delivery.defaultFee, eta: delivery.defaultEta };
}

export function getDeliveryFee(state: string | null | undefined, subtotal: number, delivery: DeliverySettings = DELIVERY): number {
  if (!state) return 0;
  if (state !== "Lagos" && subtotal >= delivery.interstateFreeDeliveryThreshold) return 0;
  if (subtotal >= delivery.freeDeliveryThreshold) return 0;
  return getDeliveryZone(state, delivery).fee;
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

import type { Product, ProductVariant } from "@/db/schema";

/** Tiny className joiner (avoids a dependency on clsx). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Formats an integer naira amount, e.g. 38500 -> "₦38,500". */
export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount).replace("NGN", "₦");
}

/** URL-safe slug that also strips Yoruba/Igbo diacritics (Ọ̀run -> orun). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isOnSale(item: { price: number; salePrice: number | null }): boolean {
  return item.salePrice !== null && item.salePrice > 0 && item.salePrice < item.price;
}

export function effectivePrice(item: { price: number; salePrice: number | null }): number {
  return isOnSale(item) ? (item.salePrice as number) : item.price;
}

export function discountPercent(item: { price: number; salePrice: number | null }): number {
  if (!isOnSale(item)) return 0;
  return Math.round(((item.price - (item.salePrice as number)) / item.price) * 100);
}

/** Lowest effective price across a product and its variants (for "From ₦…"). */
export function startingPrice(product: Product, variants: ProductVariant[] = []): number {
  const prices = [effectivePrice(product), ...variants.map(effectivePrice)];
  return Math.min(...prices);
}

export function formatDate(date: Date | string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

/** Human readable order number, e.g. JIS-LX3K9Q-7F2A */
export function generateOrderNumber(): string {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JIS-${time}-${rand}`;
}

export function generateReference(prefix = "JIS"): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${Date.now().toString(36)}_${hex}`;
}

export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}

export function toInt(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? parseInt(value, 10) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Normalises Nigerian phone numbers to a wa.me friendly format (234…). */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

export function absoluteUrl(path = "/"): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

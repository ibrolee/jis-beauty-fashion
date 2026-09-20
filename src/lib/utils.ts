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

export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount).replace("NGN", "₦");
}

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

/** Order URLs are bearer links for guest customers: use cryptographically random IDs. */
export function generateOrderNumber(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `JIS-${hex}`;
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

export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

const PUBLIC_STOREFRONT = "https://www.jisbeautyfashion.com";

/**
 * Keep canonical URLs, sitemaps, structured data, and emailed links on the
 * official public domain, even when an older Vercel alias remains in env vars.
 * Explicit custom-domain and localhost values are still supported.
 */
export function publicSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (!configured) return PUBLIC_STOREFRONT;
  try {
    const parsed = new URL(configured);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") return PUBLIC_STOREFRONT;
    if (parsed.hostname === "jis-beauty-fashion.vercel.app") return PUBLIC_STOREFRONT;
    if (parsed.hostname.startsWith("jis-beauty-fashion-git-") && parsed.hostname.endsWith(".vercel.app")) return PUBLIC_STOREFRONT;
    return parsed.origin;
  } catch {
    return PUBLIC_STOREFRONT;
  }
}

/** Keep externally hosted product images absolute in SEO/structured-data output. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${publicSiteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

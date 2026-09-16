import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from "./constants";
import type { ProductFilters } from "@/types";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean);
}

function num(value: string | string[] | undefined): number | undefined {
  const v = first(value);
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function flag(value: string | string[] | undefined): boolean {
  const v = first(value);
  return v === "1" || v === "true" || v === "on";
}

/** Converts Next.js searchParams into typed product filters. */
export function parseProductFilters(params: SearchParamsRecord, overrides: Partial<ProductFilters> = {}): ProductFilters {
  const sort = first(params.sort);
  const validSort = SORT_OPTIONS.some((o) => o.value === sort) ? sort : undefined;
  return {
    q: first(params.q)?.trim() || undefined,
    category: first(params.category) || undefined,
    gender: list(params.gender),
    brand: list(params.brand),
    minPrice: num(params.minPrice),
    maxPrice: num(params.maxPrice),
    inStock: flag(params.inStock),
    minRating: num(params.rating),
    newArrivals: flag(params.newArrivals),
    bestSellers: flag(params.bestSellers),
    onSale: flag(params.onSale),
    sort: validSort,
    page: Math.max(1, num(params.page) ?? 1),
    perPage: PRODUCTS_PER_PAGE,
    ...overrides,
  };
}

export function countActiveFilters(f: ProductFilters, ignoreCategory = false): number {
  let n = 0;
  if (!ignoreCategory && f.category) n++;
  n += f.gender?.length ?? 0;
  n += f.brand?.length ?? 0;
  if (f.minPrice !== undefined || f.maxPrice !== undefined) n++;
  if (f.inStock) n++;
  if (f.minRating) n++;
  if (f.newArrivals) n++;
  if (f.bestSellers) n++;
  if (f.onSale) n++;
  return n;
}

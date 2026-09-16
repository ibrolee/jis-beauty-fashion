"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { GENDER_LABELS } from "@/lib/constants";
import { cn, formatNaira } from "@/lib/utils";
import type { BrandWithCount, CategoryWithCount, ProductFilters } from "@/types";

type Props = {
  categories: CategoryWithCount[];
  brands: BrandWithCount[];
  priceBounds: { min: number; max: number };
  filters: ProductFilters;
  /** On /shop/[category] pages the category is fixed by the URL */
  lockCategory?: boolean;
  activeCount: number;
};

function useFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const toggleInList = useCallback(
    (key: string, value: string) =>
      update((p) => {
        const current = (p.get(key) ?? "").split(",").filter(Boolean);
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        if (next.length) p.set(key, next.join(","));
        else p.delete(key);
      }),
    [update],
  );

  const setFlag = useCallback((key: string, on: boolean) => update((p) => (on ? p.set(key, "1") : p.delete(key))), [update]);

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const keep = new URLSearchParams();
    if (params.get("q")) keep.set("q", params.get("q") as string);
    if (params.get("sort")) keep.set("sort", params.get("sort") as string);
    const qs = keep.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  return { update, toggleInList, setFlag, clearAll };
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0">
      <legend className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-ink">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function Check({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft hover:text-ink">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-ink" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-mist">{count}</span>}
    </label>
  );
}

export function FilterPanel({ categories, brands, priceBounds, filters, lockCategory }: Omit<Props, "activeCount">) {
  const { update, toggleInList, setFlag } = useFilterNavigation();
  const [min, setMin] = useState(filters.minPrice?.toString() ?? "");
  const [max, setMax] = useState(filters.maxPrice?.toString() ?? "");

  // Re-sync the inputs when the URL price filters change (e.g. "Clear all")
  const priceKey = `${filters.minPrice ?? ""}|${filters.maxPrice ?? ""}`;
  const [lastPriceKey, setLastPriceKey] = useState(priceKey);
  if (lastPriceKey !== priceKey) {
    setLastPriceKey(priceKey);
    setMin(filters.minPrice?.toString() ?? "");
    setMax(filters.maxPrice?.toString() ?? "");
  }

  function applyPrice(e: FormEvent) {
    e.preventDefault();
    update((p) => {
      if (min) p.set("minPrice", min);
      else p.delete("minPrice");
      if (max) p.set("maxPrice", max);
      else p.delete("maxPrice");
    });
  }

  return (
    <div>
      {!lockCategory && (
        <Group title="Category">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft hover:text-ink">
            <input type="radio" name="category" checked={!filters.category} onChange={() => update((p) => p.delete("category"))} className="h-4 w-4 accent-ink" />
            All products
          </label>
          {categories.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft hover:text-ink">
              <input type="radio" name="category" checked={filters.category === c.slug} onChange={() => update((p) => p.set("category", c.slug))} className="h-4 w-4 accent-ink" />
              <span className="flex-1">{c.name}</span>
              <span className="text-xs text-mist">{c.productCount}</span>
            </label>
          ))}
        </Group>
      )}

      <Group title="Gender">
        {(Object.keys(GENDER_LABELS) as (keyof typeof GENDER_LABELS)[]).map((g) => (
          <Check key={g} label={GENDER_LABELS[g]} checked={filters.gender?.includes(g) ?? false} onChange={() => toggleInList("gender", g)} />
        ))}
      </Group>

      <Group title="Price">
        <form onSubmit={applyPrice} className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="minPrice">Minimum price</label>
            <input id="minPrice" type="number" inputMode="numeric" min={0} placeholder={`${priceBounds.min}`} value={min} onChange={(e) => setMin(e.target.value)} className="h-10 w-full border border-line px-3 text-sm focus:border-ink focus:outline-none" />
            <span className="text-stone">–</span>
            <label className="sr-only" htmlFor="maxPrice">Maximum price</label>
            <input id="maxPrice" type="number" inputMode="numeric" min={0} placeholder={`${priceBounds.max}`} value={max} onChange={(e) => setMax(e.target.value)} className="h-10 w-full border border-line px-3 text-sm focus:border-ink focus:outline-none" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone">
              {formatNaira(priceBounds.min)} – {formatNaira(priceBounds.max)}
            </p>
            <Button type="submit" size="sm" variant="secondary">
              Apply
            </Button>
          </div>
        </form>
      </Group>

      {brands.length > 0 && (
        <Group title="Brand">
          {brands.map((b) => (
            <Check key={b.id} label={b.name} count={b.productCount} checked={filters.brand?.includes(b.slug) ?? false} onChange={() => toggleInList("brand", b.slug)} />
          ))}
        </Group>
      )}

      <Group title="Availability">
        <Check label="In stock only" checked={Boolean(filters.inStock)} onChange={() => setFlag("inStock", !filters.inStock)} />
      </Group>

      <Group title="Rating">
        {[4, 3].map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft hover:text-ink">
            <input type="radio" name="rating" checked={filters.minRating === r} onChange={() => update((p) => p.set("rating", String(r)))} className="h-4 w-4 accent-ink" />
            {r}★ &amp; up
          </label>
        ))}
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft hover:text-ink">
          <input type="radio" name="rating" checked={!filters.minRating} onChange={() => update((p) => p.delete("rating"))} className="h-4 w-4 accent-ink" />
          Any rating
        </label>
      </Group>

      <Group title="Collections">
        <Check label="New arrivals" checked={Boolean(filters.newArrivals)} onChange={() => setFlag("newArrivals", !filters.newArrivals)} />
        <Check label="Best sellers" checked={Boolean(filters.bestSellers)} onChange={() => setFlag("bestSellers", !filters.bestSellers)} />
        <Check label="On sale" checked={Boolean(filters.onSale)} onChange={() => setFlag("onSale", !filters.onSale)} />
      </Group>
    </div>
  );
}

export function ClearFiltersButton({ className, children = "Clear all" }: { className?: string; children?: ReactNode }) {
  const { clearAll } = useFilterNavigation();
  return (
    <button type="button" onClick={clearAll} className={cn("text-xs font-medium uppercase tracking-[0.16em] underline underline-offset-4", className)}>
      {children}
    </button>
  );
}

export function MobileFilters(props: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 border border-line px-4 text-xs font-medium uppercase tracking-[0.16em] lg:hidden" aria-expanded={open}>
        <SlidersHorizontal className="h-4 w-4" /> Filters
        {props.activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-white">{props.activeCount}</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close filters" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <h2 className="font-serif text-2xl">Filters</h2>
              <button type="button" onClick={() => setOpen(false)} className="-mr-2 flex h-11 w-11 items-center justify-center" aria-label="Close filters">
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel {...props} />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
              <ClearFiltersButton />
              <Button type="button" onClick={() => setOpen(false)} className="flex-1">
                Show results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { SearchX } from "lucide-react";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategories } from "@/lib/data/categories";
import { getBrandsWithCounts, getPriceBounds, getProducts } from "@/lib/data/products";
import { countActiveFilters, parseProductFilters, type SearchParamsRecord } from "@/lib/shop-params";
import type { ProductFilters } from "@/types";
import { ClearFiltersButton, FilterPanel, MobileFilters } from "./filters";
import { Pagination } from "./pagination";
import { SortSelect } from "./sort-select";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string | null;
  basePath: string;
  searchParams: SearchParamsRecord;
  overrides?: Partial<ProductFilters>;
  lockCategory?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

export async function ShopPage({ eyebrow, title, description, basePath, searchParams, overrides, lockCategory, emptyTitle, emptyDescription }: Props) {
  const filters = parseProductFilters(searchParams, overrides);
  const [result, categories, brands, priceBounds] = await Promise.all([getProducts(filters), getCategories(), getBrandsWithCounts(), getPriceBounds()]);
  const activeCount = countActiveFilters(filters, lockCategory);
  const from = (result.page - 1) * result.perPage + 1;
  const to = Math.min(result.total, result.page * result.perPage);

  return (
    <div className="container-x py-10 lg:py-14">
      <header className="mb-8 max-w-2xl lg:mb-12">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="font-serif text-4xl leading-[1.05] sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 text-[15px] leading-relaxed text-stone">{description}</p>}
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block" aria-label="Filters">
          <div className="sticky top-24">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl">Filters</h2>
              {activeCount > 0 && (
                <Suspense>
                  <ClearFiltersButton />
                </Suspense>
              )}
            </div>
            <Suspense>
              <FilterPanel categories={categories} brands={brands} priceBounds={priceBounds} filters={filters} lockCategory={lockCategory} />
            </Suspense>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-4">
            <div className="flex items-center gap-4">
              <Suspense>
                <MobileFilters categories={categories} brands={brands} priceBounds={priceBounds} filters={filters} lockCategory={lockCategory} activeCount={activeCount} />
              </Suspense>
              <p className="text-sm text-stone" aria-live="polite">
                {result.total === 0 ? "No products" : `Showing ${from}–${to} of ${result.total}`}
              </p>
            </div>
            <Suspense>
              <SortSelect value={filters.sort} />
            </Suspense>
          </div>

          {result.items.length ? (
            <>
              <ProductGrid products={result.items} columns={4} priorityCount={4} />
              <Pagination page={result.page} totalPages={result.totalPages} basePath={basePath} searchParams={searchParams} />
            </>
          ) : (
            <EmptyState
              icon={SearchX}
              title={emptyTitle ?? "No products match these filters"}
              description={emptyDescription ?? "Try removing a filter or two, or browse the full collection."}
              action={
                <>
                  {activeCount > 0 && (
                    <Suspense>
                      <ClearFiltersButton className="inline-flex h-12 items-center border border-ink px-6 no-underline">Clear filters</ClearFiltersButton>
                    </Suspense>
                  )}
                  <ButtonLink href="/shop">Shop all products</ButtonLink>
                </>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

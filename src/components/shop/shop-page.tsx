import Link from "next/link";
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
    <>
      <section className="border-b border-line bg-ivory" aria-label="Collection introduction">
        <div className="container-x pb-7 pt-12 sm:pb-10 sm:pt-16 lg:pb-12 lg:pt-20">
          <p className="eyebrow mb-4">{eyebrow ?? "The JIS collection"}</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <h1 className="max-w-3xl font-serif text-[clamp(3.25rem,7vw,6.75rem)] leading-[0.88] tracking-[-0.035em] text-ink">{title}</h1>
            {description && <p className="max-w-sm text-[15px] leading-[1.8] text-stone lg:pb-1">{description}</p>}
          </div>
        </div>
        <nav aria-label="Browse collections" className="container-x -mb-px flex gap-1 overflow-x-auto pb-px no-scrollbar sm:gap-3">
          <Link href="/shop" aria-current={!filters.category ? "page" : undefined} className={`flex min-h-12 shrink-0 items-center border-b-2 px-3 text-[11px] font-medium uppercase tracking-[0.13em] transition-colors sm:px-4 ${!filters.category ? "border-rosewood text-ink" : "border-transparent text-stone hover:border-line hover:text-ink"}`}>
            All fragrances
          </Link>
          {categories.filter((category) => category.productCount > 0).map((category) => (
            <Link key={category.id} href={`/shop/${category.slug}`} aria-current={filters.category === category.slug ? "page" : undefined} className={`flex min-h-12 shrink-0 items-center border-b-2 px-3 text-[11px] font-medium uppercase tracking-[0.13em] transition-colors sm:px-4 ${filters.category === category.slug ? "border-rosewood text-ink" : "border-transparent text-stone hover:border-line hover:text-ink"}`}>
              {category.name}
            </Link>
          ))}
        </nav>
      </section>

      <div className="container-x pb-16 pt-10 lg:pb-24 lg:pt-14">
        <div className="grid gap-9 lg:grid-cols-12 lg:gap-10">
          <aside className="hidden lg:col-span-3 lg:block" aria-label="Filters">
            <div className="sticky top-[145px] border-t border-ink pt-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-3xl leading-none">Refine your edit</h2>
                {activeCount > 0 && (
                  <Suspense><ClearFiltersButton /></Suspense>
                )}
              </div>
              <Suspense>
                <FilterPanel categories={categories} brands={brands} priceBounds={priceBounds} filters={filters} lockCategory={lockCategory} />
              </Suspense>
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-9">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <div className="flex items-center gap-4">
                <Suspense>
                  <MobileFilters categories={categories} brands={brands} priceBounds={priceBounds} filters={filters} lockCategory={lockCategory} activeCount={activeCount} />
                </Suspense>
                <p className="text-xs tracking-wide text-stone" aria-live="polite">
                  {result.total === 0 ? "No products" : `Showing ${from}–${to} of ${result.total} products`}
                </p>
              </div>
              <Suspense><SortSelect value={filters.sort} /></Suspense>
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
    </>
  );
}

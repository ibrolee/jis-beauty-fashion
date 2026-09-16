import { cn } from "@/lib/utils";
import type { ProductListItem } from "@/types";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  columns = 4,
  className,
  priorityCount = 0,
}: {
  products: ProductListItem[];
  columns?: 3 | 4;
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6", columns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

/** Horizontal scroll on mobile, grid on desktop — used for homepage collections. */
export function ProductRail({ products, priorityCount = 0 }: { products: ProductListItem[]; priorityCount?: number }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} className="w-[72vw] shrink-0 snap-start sm:w-auto" />
      ))}
    </div>
  );
}

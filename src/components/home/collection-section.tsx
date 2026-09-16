import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ProductRail } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import type { ProductListItem } from "@/types";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  href: string;
  products: ProductListItem[];
  /** Optional editorial tile shown as the first grid cell on large screens */
  feature?: { image: string; title: string; subtitle: string };
  tone?: "white" | "ivory";
  priorityCount?: number;
};

export function CollectionSection({ eyebrow, title, description, href, products, feature, tone = "white", priorityCount = 0 }: Props) {
  if (!products.length) return null;

  return (
    <section className={cn("py-16 lg:py-24", tone === "ivory" && "bg-ivory")} aria-label={title}>
      <div className="container-x">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} href={href} />
        {feature ? (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            <Link href={href} className="group relative w-[72vw] shrink-0 snap-start overflow-hidden bg-ink sm:w-auto sm:col-span-2 lg:col-span-1 lg:row-span-1">
              <div className="relative aspect-[4/5] sm:aspect-auto sm:h-full sm:min-h-[420px]">
                <Image src={feature.image} alt={feature.title} fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{feature.subtitle}</p>
                  <p className="mt-2 font-serif text-3xl leading-tight">{feature.title}</p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] underline underline-offset-4">Shop the edit</p>
                </div>
              </div>
            </Link>
            {products.slice(0, 3).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < priorityCount} className="w-[72vw] shrink-0 snap-start sm:w-auto" />
            ))}
          </div>
        ) : (
          <ProductRail products={products.slice(0, 4)} priorityCount={priorityCount} />
        )}
      </div>
    </section>
  );
}

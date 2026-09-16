import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import type { CategoryWithCount } from "@/types";

export function FeaturedCategories({ categories }: { categories: CategoryWithCount[] }) {
  if (!categories.length) return null;
  return (
    <section className="container-x py-16 lg:py-24" aria-labelledby="categories-heading">
      <SectionHeading eyebrow="Collections" title="Shop by category" href="/categories" linkLabel="All collections" />
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {categories.map((c, i) => (
          <Link
            key={c.id}
            href={`/shop/${c.slug}`}
            className={cn("group relative w-[68vw] shrink-0 snap-start overflow-hidden bg-ivory sm:w-auto", i === 0 && "sm:col-span-2 lg:col-span-1")}
          >
            <div className="relative aspect-[4/5]">
              {c.image && (
                <Image src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 70vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-transparent" aria-hidden />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
              <div>
                <h3 className="font-serif text-2xl leading-tight">{c.name.replace("Perfumes for ", "").replace("Perfumes", "")}</h3>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/80">{c.productCount} products</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-white group-hover:text-ink">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

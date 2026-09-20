import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CategoryWithCount } from "@/types";

/** Only merchandise that is actually listed should be featured on the homepage. */
export function FeaturedCategories({ categories }: { categories: CategoryWithCount[] }) {
  const available = categories.filter((category) => category.productCount > 0);
  if (!available.length) return null;

  return (
    <section id="collections" className="scroll-mt-24 bg-cream py-20 sm:py-24 lg:py-30" aria-labelledby="categories-heading">
      <div className="container-x">
        <div className="mb-10 grid gap-5 border-b border-line pb-9 sm:mb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow mb-4">Discover the collection / 01</p>
            <h2 id="categories-heading" className="max-w-[740px] font-serif text-[clamp(2.8rem,6vw,5.75rem)] leading-[0.98] tracking-[-0.03em]">
              Find your <em className="font-normal text-rosewood">signature.</em>
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-stone">
              Explore what is currently available at JIS, curated by fragrance and occasion.
            </p>
          </div>
          <Link href="/categories" className="group inline-flex w-fit items-center gap-3 border-b border-ink pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ink hover:text-rosewood">
            All collections <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {available.map((category, index) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className={`group relative isolate min-h-[390px] overflow-hidden bg-ink text-white sm:min-h-[480px] ${available.length > 2 && index === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              aria-label={`Shop ${category.name}`}
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10 transition-colors group-hover:bg-black/10" aria-hidden="true" />
              <div className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.25em] text-white/85 sm:left-7 sm:top-7">
                JIS Edit / {String(index + 1).padStart(2, "0")}
              </div>
              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 border-t border-white/55 pt-5 sm:inset-x-7 sm:bottom-8">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.19em] text-white/75">
                    {category.productCount} {category.productCount === 1 ? "product" : "products"}
                  </p>
                  <h3 className="font-serif text-[clamp(2rem,3.2vw,3.25rem)] leading-none tracking-tight">
                    {category.name.replace("Perfumes for ", "").replace(" Perfumes", "")}
                  </h3>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/60 transition-colors group-hover:border-white group-hover:bg-white group-hover:text-ink" aria-hidden="true">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { getCategories } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore the JIS Beauty & Fashion fragrance collections available to shop now.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = (await getCategories()).filter((category) => category.productCount > 0);

  return (
    <div className="pb-20 lg:pb-28">
      <header className="border-b border-line bg-ivory py-16 sm:py-20 lg:py-24">
        <div className="container-x grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5">The fragrance edit / Explore</p>
            <h1 className="font-serif text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-[clamp(5rem,7vw,8rem)]">Find your <span className="italic text-rosewood">collection.</span></h1>
          </div>
          <p className="max-w-sm text-base leading-[1.9] text-ink-soft lg:col-span-4">Browse our current collections, from everyday favourites to fragrances worth making an occasion for.</p>
        </div>
      </header>

      <section className="container-x pt-12 lg:pt-20" aria-label="Available fragrance collections">
        {categories.length ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
            {categories.map((category, index) => (
              <Link key={category.id} href={`/shop/${category.slug}`} className="group block min-w-0">
                <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                  {category.image ? <Image src={category.image} alt="" fill priority={index < 3} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04]" /> : <div className="flex h-full items-center justify-center font-serif text-3xl text-stone">{category.name}</div>}
                  <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-cream/95 text-ink transition-colors group-hover:bg-ink group-hover:text-white" aria-hidden="true"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4 border-t border-line pt-5">
                  <div className="min-w-0">
                    <p className="eyebrow mb-2">Collection {String(index + 1).padStart(2, "0")}</p>
                    <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{category.name}</h2>
                    {category.description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone">{category.description}</p>}
                  </div>
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-stone">{category.productCount} {category.productCount === 1 ? "item" : "items"}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-line bg-cream px-6 py-16 text-center">
            <h2 className="font-serif text-3xl">Collections are being prepared.</h2>
            <p className="mt-3 text-sm text-stone">Explore our full shop or check back for new arrivals.</p>
            <ButtonLink href="/shop" className="mt-7">Explore the shop</ButtonLink>
          </div>
        )}
      </section>
      {categories.length > 0 && <div className="container-x mt-16 border-t border-line pt-9 text-center"><p className="font-serif text-3xl">Still exploring?</p><ButtonLink href="/shop" variant="secondary" size="lg" className="mt-5">Shop all products <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></ButtonLink></div>}
    </div>
  );
}

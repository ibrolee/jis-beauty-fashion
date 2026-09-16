import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore JIS Beauty & Fashion collections — perfumes for women, men, unisex, kids and concentrated perfume oils.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container-x py-10 lg:py-14">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">Explore</p>
        <h1 className="font-serif text-4xl leading-[1.05] sm:text-5xl">Our collections</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-stone">From soft florals to deep ouds, and gentle mists for little ones — find the category that fits the moment.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <Link key={c.id} href={`/shop/${c.slug}`} className="group flex flex-col border border-line transition-colors hover:border-ink">
            <div className="relative aspect-[5/4] overflow-hidden bg-ivory">
              {c.image && <Image src={c.image} alt={c.name} fill priority={i < 3} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="font-serif text-2xl">{c.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone">{c.description}</p>
              <p className="mt-5 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em]">
                {c.productCount} products
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

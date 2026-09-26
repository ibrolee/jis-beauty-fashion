import { ArrowUpRight, Sparkles } from "lucide-react";
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

const ACCENTS = ["#ff83b2", "#ffb56b", "#9881ff", "#6fd4c0", "#efd35d", "#f29ac7", "#85b7ff"] as const;

export default async function CategoriesPage() {
  const categories = (await getCategories()).filter((category) => category.productCount > 0);

  return (
    <div className="pb-20 lg:pb-28">
      <header className="relative overflow-hidden border-b border-line py-16 sm:py-20 lg:py-28">
        <div className="jis-orb jis-orb-one" aria-hidden="true" />
        <div className="jis-orb jis-orb-three" aria-hidden="true" />
        <div className="container-x relative z-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5 flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> The JIS scent wardrobe</p>
            <h1 className="max-w-4xl font-serif text-[clamp(4rem,8vw,8.6rem)] leading-[0.86] tracking-[-0.05em]">Pick a mood. <span className="text-rosewood">Meet your scent.</span></h1>
          </div>
          <p className="max-w-md text-base leading-[1.9] text-ink-soft lg:col-span-4">Every collection is a shortcut to the feeling you want — soft, bold, playful, effortless or unforgettable.</p>
        </div>
      </header>

      <section className="container-x pt-10 lg:pt-16" aria-label="Available fragrance collections">
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Link href="/shop" className="shrink-0 rounded-full bg-ink px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-white">Shop all</Link>
          {categories.map((category) => (
            <Link key={category.id} href={"/shop/" + category.slug} className="shrink-0 rounded-full border border-line bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-ink hover:border-rosewood hover:text-rosewood">{category.name.replace("Perfumes for ", "").replace(" Perfumes", "")}</Link>
          ))}
        </div>

        {categories.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
            {categories.map((category, index) => {
              const large = index === 0 || index === 4;
              return (
                <Link key={category.id} href={"/shop/" + category.slug} className={(large ? "lg:col-span-7 " : "lg:col-span-5 ") + "group block min-w-0 overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_65px_rgba(70,29,56,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_85px_rgba(70,29,56,0.14)]"}>
                  <div className="relative aspect-[4/4.6] overflow-hidden bg-ivory sm:aspect-[4/5]">
                    {category.image ? <Image src={category.image} alt={category.name} fill priority={index < 2} sizes="(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]" /> : <div className="flex h-full items-center justify-center font-serif text-3xl text-stone">{category.name}</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent" aria-hidden="true" />
                    <span className="absolute left-5 top-5 rounded-full px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#25121f]" style={{ backgroundColor: ACCENTS[index % ACCENTS.length] }}>Collection {String(index + 1).padStart(2, "0")}</span>
                    <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:rotate-12" aria-hidden="true"><ArrowUpRight className="h-4 w-4" /></span>
                    <div className="absolute inset-x-6 bottom-6 text-white">
                      <h2 className="font-serif text-[clamp(2.6rem,5vw,5rem)] leading-[0.9] tracking-[-0.035em]">{category.name.replace("Perfumes for ", "").replace(" Perfumes", "")}</h2>
                      <div className="mt-4 flex items-end justify-between gap-5 border-t border-white/35 pt-4">
                        <p className="max-w-md text-sm leading-relaxed text-white/80">{category.description || "Explore the collection."}</p>
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/75">{category.productCount} {category.productCount === 1 ? "item" : "items"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-line bg-white px-6 py-16 text-center">
            <h2 className="font-serif text-3xl">Collections are being prepared.</h2>
            <p className="mt-3 text-sm text-stone">Explore our full shop or check back for new arrivals.</p>
            <ButtonLink href="/shop" className="mt-7">Explore the shop</ButtonLink>
          </div>
        )}
      </section>

      {categories.length > 0 && (
        <div className="container-x mt-16">
          <div className="rounded-[2rem] bg-ink px-6 py-12 text-center text-white sm:px-10 sm:py-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff9dc2]">Still exploring?</p>
            <p className="mt-3 font-serif text-4xl sm:text-5xl">Let the full shop surprise you.</p>
            <ButtonLink href="/shop" variant="secondary" size="lg" className="mt-6 border-white bg-white text-ink hover:bg-[#ffe4ef]">Shop everything <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About JIS",
  description: "Discover JIS Beauty & Fashion, a Lagos-based destination for carefully curated fragrances, perfume oils and personal style.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { title: "Curated with intention", body: "Explore a considered mix of fragrances and perfume oils for different tastes, occasions and budgets." },
  { title: "Your style, your scent", body: "Whether you prefer something soft and understated or a bold statement, the choice should feel like yours." },
  { title: "A personal connection", body: "Questions about a fragrance or an order? Our WhatsApp channel is available for a direct conversation." },
];

export default function AboutPage() {
  return (
    <>
      <section className="overflow-hidden bg-ivory">
        <div className="container-x grid items-center gap-10 py-14 sm:py-20 lg:min-h-[690px] lg:grid-cols-12 lg:gap-16 lg:py-24">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-6">The world of JIS / Our story</p>
            <h1 className="max-w-2xl font-serif text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-[clamp(5.5rem,7vw,8rem)]">
              Beauty is <span className="italic text-rosewood">personal.</span> So is fragrance.
            </h1>
            <p className="mt-8 max-w-lg text-base leading-[1.9] text-ink-soft">
              JIS Beauty &amp; Fashion is a Lagos-based fragrance destination, bringing together perfumes and perfume oils for women, men, unisex wearers and children. We believe finding your next scent should be an enjoyable part of expressing your own style.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/shop" size="lg">Explore the collection <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="secondary">Talk to JIS</ButtonLink>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-blush sm:aspect-[5/4] lg:col-span-5 lg:col-start-8 lg:aspect-[4/5]">
            <Image src="/images/about.jpg" alt="" fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/60 to-transparent px-7 pb-7 pt-20 text-white">
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-white/80">JIS Beauty & Fashion · Lagos</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-20 lg:py-28" aria-labelledby="about-approach-heading">
        <div className="grid gap-5 border-b border-line pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4">Our approach</p>
            <h2 id="about-approach-heading" className="font-serif text-4xl leading-tight sm:text-5xl">A considered edit, made for you.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-stone lg:col-span-4 lg:col-start-9">Discover a fragrance that fits how you want to feel, not just what everyone else is wearing.</p>
        </div>
        <div className="grid gap-10 pt-10 md:grid-cols-3 md:gap-8">
          {VALUES.map((value, index) => (
            <div key={value.title} className="border-l border-line pl-6">
              <p className="text-[11px] font-medium tracking-[0.18em] text-rosewood">0{index + 1}</p>
              <h3 className="mt-5 font-serif text-3xl leading-tight">{value.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-[1.9] text-stone">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-cream">
        <div className="container-x grid gap-8 py-20 lg:grid-cols-12 lg:items-center lg:py-24">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-4">Beauty & beyond</p>
            <h2 className="font-serif text-5xl leading-[0.98] sm:text-6xl">This is only the <span className="italic text-rosewood">beginning.</span></h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-base leading-[1.9] text-ink-soft">Fragrance is at the heart of our current collection. As JIS evolves, we hope to bring more beauty and fashion discoveries into the mix. Follow along to see what is available next.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/categories" size="lg">Browse collections</ButtonLink>
              <ButtonLink href={SITE.instagramUrl} size="lg" variant="secondary">Follow JIS <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

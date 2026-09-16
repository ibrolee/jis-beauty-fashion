import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind JIS Beauty & Fashion — a Lagos-born beauty and fragrance brand built on authenticity, taste and great service.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { title: "Authenticity first", body: "We only stock what we'd wear ourselves — sealed, traceable and sourced from authorised distributors." },
  { title: "Taste over hype", body: "Our edits are curated by nose, not by trend. Every fragrance earns its place." },
  { title: "Service that feels personal", body: "Real humans on WhatsApp, honest scent advice and packaging that feels like a gift." },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-ivory">
        <div className="container-x grid items-center gap-10 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-4">Our story</p>
            <h1 className="font-serif text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Beauty, style and a scent that <em className="italic font-normal text-rosewood">stays with you</em>.
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-stone sm:text-base">
              JIS Beauty &amp; Fashion began in Lagos with a simple frustration: it was hard to find fragrances you could trust, from people who actually understood them. So we built the store we wished existed — curated, authentic and genuinely helpful.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden lg:col-span-5 lg:col-start-8">
            <Image src="/images/about.jpg" alt="JIS founder applying fragrance" fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="container-x py-16 lg:py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <div key={v.title}>
              <p className="font-serif text-5xl text-line">0{i + 1}</p>
              <h2 className="mt-3 font-serif text-2xl">{v.title}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-stone">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-cream">
        <div className="container-x grid gap-8 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-3">What’s next</p>
            <h2 className="font-serif text-3xl sm:text-4xl">More than fragrance</h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Fragrance is where we started — women’s, men’s, unisex and kids’ perfumes, plus long-lasting perfume oils. Skincare, body care and fashion accessories are on the way, all chosen with the same care. Follow <a href={SITE.instagramUrl} className="underline underline-offset-4">@{SITE.instagram}</a> to see what’s coming.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/shop">Shop the collection</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Get in touch
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

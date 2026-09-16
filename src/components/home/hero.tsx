import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import type { HeroContent } from "@/lib/site-content";

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="relative overflow-hidden bg-ivory" aria-labelledby="hero-heading">
      <div className="container-x grid min-h-[560px] items-center gap-10 py-12 lg:min-h-[680px] lg:grid-cols-12 lg:gap-8 lg:py-0">
        <div className="order-2 max-w-xl animate-fade-up lg:order-1 lg:col-span-6 lg:py-20 xl:col-span-5">
          <p className="eyebrow mb-5">{content.eyebrow}</p>
          <h1 id="hero-heading" className="font-serif text-[2.75rem] leading-[1.02] text-ink sm:text-6xl lg:text-[4.5rem]">
            {content.headline}
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-stone sm:text-base">{content.subheadline}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={content.primaryHref || "/shop"} size="lg">
              {content.primaryCta}
            </ButtonLink>
            <ButtonLink href={content.secondaryHref || "/categories"} variant="secondary" size="lg">
              {content.secondaryCta}
            </ButtonLink>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-line pt-6">
            {[
              ["100%", "Authentic"],
              ["36+", "States delivered"],
              ["1–2 days", "Lagos delivery"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-serif text-2xl text-ink">{value}</dd>
                <dd className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-stone">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="order-1 relative lg:order-2 lg:col-span-6 xl:col-span-7">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden lg:ml-auto lg:max-w-none lg:aspect-[5/6] xl:aspect-[4/5]">
            <Image
              src={content.image || "/images/hero.jpg"}
              alt="Signature JIS fragrance bottle on warm ivory stone with blush silk"
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="pointer-events-none absolute -bottom-4 left-4 hidden border border-line bg-white/95 px-5 py-4 backdrop-blur lg:block">
            <p className="eyebrow">Now trending</p>
            <p className="mt-1 font-serif text-xl">Oud, Vanilla &amp; Rose</p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HeroContent } from "@/lib/site-content";

const QUICK_LINKS = [
  { label: "For her", href: "/shop/women" },
  { label: "For him", href: "/shop/men" },
  { label: "Unisex", href: "/shop/unisex" },
  { label: "Perfume oils", href: "/shop/perfume-oils" },
  { label: "Body sprays", href: "/shop/body-sprays-deodorants" },
] as const;

export function Hero({ content }: { content: HeroContent }) {
  const heroImage =
    content.image && content.image !== "/images/hero.jpg"
      ? content.image
      : "/catalog/incidence-paris-100ml-hero.jpg";

  return (
    <section className="jis-hero relative isolate overflow-hidden" aria-labelledby="hero-heading">
      <div className="jis-orb jis-orb-one" aria-hidden="true" />
      <div className="jis-orb jis-orb-two" aria-hidden="true" />
      <div className="jis-orb jis-orb-three" aria-hidden="true" />

      <div className="container-x relative z-10 grid min-h-[760px] gap-12 pb-10 pt-12 sm:pt-16 lg:min-h-[820px] lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-14 lg:pt-20">
        <div className="jis-reveal lg:col-span-6">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-rosewood shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {content.eyebrow}
          </div>

          <h1 id="hero-heading" className="max-w-[760px] font-serif text-[clamp(4rem,10.2vw,8.5rem)] font-medium leading-[0.84] tracking-[-0.055em] text-ink [text-wrap:balance]">
            {content.headline}
          </h1>

          <p className="mt-7 max-w-xl text-[16px] leading-[1.85] text-ink-soft sm:text-lg">
            {content.subheadline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3 sm:mt-11">
            <Link href={content.primaryHref || "/shop"} className="group inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-ink px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_50px_rgba(50,17,49,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rosewood">
              {content.primaryCta}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link href={content.secondaryHref || "/categories"} className="inline-flex min-h-14 items-center justify-center rounded-full border border-ink/20 bg-white/60 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-rosewood hover:text-rosewood">
              {content.secondaryCta}
            </Link>
          </div>

          <div className="mt-11 flex flex-wrap gap-2" aria-label="Quick shop links">
            {QUICK_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full border border-ink/10 bg-white/45 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft backdrop-blur transition-all hover:border-rosewood/40 hover:bg-white hover:text-rosewood">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-6 lg:pl-7">
          <div className="jis-hero-image-shell relative mx-auto aspect-[4/5] w-full max-w-[590px] overflow-hidden rounded-[2.4rem] bg-ivory shadow-[0_32px_100px_rgba(67,20,55,0.23)]">
            <Image src={heroImage} alt="JIS Beauty & Fashion fragrance selection" fill priority sizes="(min-width: 1024px) 48vw, 92vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#291020]/55 via-transparent to-white/5" aria-hidden="true" />
            <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/35 bg-white/20 p-4 text-white backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/75">JIS fragrance edit</p>
                <p className="mt-1 font-serif text-2xl leading-none sm:text-3xl">Wear the mood.</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </div>

          <div className="jis-float-card jis-float-card-one hidden sm:block">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-rosewood">Curated in Lagos</span>
            <span className="mt-1 block font-serif text-2xl text-ink">Scent, but personal.</span>
          </div>
          <div className="jis-float-card jis-float-card-two hidden lg:block">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-rosewood">Beauty + fragrance</span>
            <span className="mt-1 block text-sm text-ink-soft">Find something that feels like you.</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-stone lg:col-span-12">
          <span>JIS Beauty &amp; Fashion · Lagos, Nigeria</span>
          <a href="#collections" className="group inline-flex items-center gap-2 text-ink hover:text-rosewood">
            <span className="hidden sm:inline">Explore the edits</span>
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

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
  return (
    <section className="relative isolate min-h-[760px] overflow-hidden bg-[#f8dce7] sm:min-h-[800px] lg:min-h-[830px]" aria-labelledby="hero-heading">
      <Image
        src="/catalog/category-women-v2.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center] sm:object-center"
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,243,0.96)_0%,rgba(255,240,246,0.90)_38%,rgba(255,233,242,0.52)_63%,rgba(73,18,50,0.08)_100%)] sm:bg-[linear-gradient(90deg,rgba(255,248,243,0.95)_0%,rgba(255,240,246,0.86)_42%,rgba(255,232,241,0.36)_68%,rgba(73,18,50,0.04)_100%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#fff9f5]/88 via-transparent to-white/10" aria-hidden="true" />

      <div className="jis-orb jis-orb-one opacity-30" aria-hidden="true" />
      <div className="jis-orb jis-orb-two opacity-20" aria-hidden="true" />

      <div className="container-x relative z-10 flex min-h-[760px] flex-col pb-10 pt-14 sm:min-h-[800px] sm:pt-18 lg:min-h-[830px] lg:justify-center lg:pb-16 lg:pt-20">
        <div className="jis-reveal max-w-[760px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-rosewood shadow-sm backdrop-blur-md">
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
            <Link href={content.secondaryHref || "/categories"} className="inline-flex min-h-14 items-center justify-center rounded-full border border-ink/15 bg-white/72 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-rosewood hover:bg-white hover:text-rosewood">
              {content.secondaryCta}
            </Link>
          </div>

          <div className="mt-11 flex max-w-2xl flex-wrap gap-2" aria-label="Quick shop links">
            {QUICK_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full border border-white/75 bg-white/68 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-soft shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-rosewood/40 hover:bg-white hover:text-rosewood">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-ink/12 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft lg:mt-14">
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

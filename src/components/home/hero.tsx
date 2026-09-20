import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HeroContent } from "@/lib/site-content";

/** The editor's existing hero content and image remain the source of truth. */
export function Hero({ content }: { content: HeroContent }) {
  return (
    <section
      className="relative isolate flex min-h-[670px] overflow-hidden bg-ink text-white sm:min-h-[740px] lg:min-h-[790px]"
      aria-labelledby="hero-heading"
    >
      <Image
        src={content.image || "/images/hero.jpg"}
        alt="Fragrance editorial for JIS Beauty & Fashion"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#100e0b]/95 via-[#100e0b]/55 to-[#100e0b]/25 lg:bg-gradient-to-r lg:from-[#100e0b]/90 lg:via-[#100e0b]/60 lg:to-[#100e0b]/10"
        aria-hidden="true"
      />
      <div className="container-x relative z-10 flex min-h-[670px] w-full flex-col justify-end pb-12 pt-24 sm:min-h-[740px] sm:pb-16 lg:min-h-[790px] lg:justify-center lg:pb-24">
        <div className="max-w-[770px] animate-fade-up">
          <p className="mb-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.32em] text-white/85 sm:text-xs">
            <span className="h-px w-9 bg-[#d4b48a]" aria-hidden="true" />
            {content.eyebrow}
          </p>
          <h1
            id="hero-heading"
            className="max-w-[780px] font-serif text-[clamp(3.5rem,10vw,8rem)] font-normal leading-[0.93] tracking-[-0.035em] text-white [text-wrap:balance]"
          >
            {content.headline}
          </h1>
          <p className="mt-7 max-w-[460px] text-[15px] leading-[1.8] text-white/85 sm:mt-9 sm:text-base">
            {content.subheadline}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4 sm:mt-11">
            <Link
              href={content.primaryHref || "/shop"}
              className="group inline-flex min-h-13 items-center justify-center gap-5 bg-[#f3eee7] px-7 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#17130f] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {content.primaryCta}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href={content.secondaryHref || "/categories"}
              className="inline-flex min-h-13 items-center justify-center border border-white/65 px-7 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white hover:text-[#17130f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {content.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="mt-16 flex items-end justify-between border-t border-white/30 pt-5 text-[10px] uppercase tracking-[0.2em] text-white/80 lg:absolute lg:inset-x-10 lg:bottom-9 lg:mt-0">
          <span>JIS Beauty &amp; Fashion <span className="mx-2 text-[#d4b48a]">—</span> The fragrance edit</span>
          <a href="#collections" className="group inline-flex items-center gap-2 text-white hover:text-[#e8d1b3]">
            <span className="hidden sm:inline">Explore below</span>
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** Brand story without invented customer reviews, product claims, or shipping promises. */
export function EditorialStory() {
  return (
    <section className="overflow-hidden bg-[#191713] text-[#f7f1e9]" aria-labelledby="editorial-story-heading">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[430px] overflow-hidden bg-[#302b25] sm:min-h-[560px] lg:min-h-[710px]">
          <Image
            src="/images/about.jpg"
            alt="Fragrance and personal style editorial"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-1000 hover:scale-[1.03]"
          />
          <span className="absolute bottom-6 left-6 border border-white/60 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white sm:bottom-10 sm:left-10">
            The JIS perspective
          </span>
        </div>
        <div className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:px-[clamp(3rem,7vw,8rem)] lg:py-24">
          <p className="mb-9 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-[#d2b38d]">
            <span className="h-px w-8 bg-[#d2b38d]" aria-hidden="true" />
            A note from JIS
          </p>
          <h2 id="editorial-story-heading" className="max-w-[680px] font-serif text-[clamp(3rem,5vw,6.5rem)] leading-[0.98] tracking-[-0.03em]">
            More than a scent. <em className="font-normal text-[#d2b38d]">A feeling.</em>
          </h2>
          <p className="mt-9 max-w-lg text-[15px] leading-[1.9] text-[#eee4d8]/80 sm:text-base">
            The finishing touch to a favourite outfit. The memory of a special day. A fragrance that feels unmistakably yours. At JIS Beauty &amp; Fashion, we bring together fragrance and beauty finds for all the ways you choose to express yourself.
          </p>
          <Link
            href="/about"
            className="group mt-12 inline-flex w-fit items-center gap-5 border-b border-[#d2b38d]/70 pb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#f7f1e9] transition-colors hover:border-white hover:text-white"
          >
            Discover our story
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

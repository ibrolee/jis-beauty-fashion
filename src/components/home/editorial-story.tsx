import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function EditorialStory() {
  return (
    <section className="relative overflow-hidden bg-ink text-white" aria-labelledby="editorial-story-heading">
      <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-[#ff4d93]/30 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#7f63ff]/25 blur-3xl" aria-hidden="true" />
      <div className="relative grid lg:grid-cols-2">
        <div className="relative min-h-[430px] overflow-hidden bg-[#30202b] sm:min-h-[560px] lg:min-h-[710px]">
          <Image src="/catalog/category-unisex-v2.jpg" alt="JIS fragrance editorial" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-1000 hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden="true" />
          <span className="absolute bottom-6 left-6 rounded-full border border-white/40 bg-black/15 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur sm:bottom-10 sm:left-10">The JIS perspective</span>
        </div>
        <div className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:px-[clamp(3rem,7vw,8rem)] lg:py-24">
          <p className="mb-9 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#ff9dc2]"><span className="h-px w-8 bg-[#ff9dc2]" aria-hidden="true" />Wear the feeling</p>
          <h2 id="editorial-story-heading" className="max-w-[680px] font-serif text-[clamp(3.2rem,5.5vw,6.8rem)] leading-[0.9] tracking-[-0.04em]">A scent can change the whole <em className="font-normal text-[#ff9dc2]">energy.</em></h2>
          <p className="mt-9 max-w-lg text-[15px] leading-[1.9] text-white/76 sm:text-base">The last detail before you step out. The memory someone keeps after you leave. JIS brings together fragrance and beauty finds for every version of your style — soft, playful, polished, bold or completely your own.</p>
          <Link href="/about" className="group mt-12 inline-flex w-fit items-center gap-5 rounded-full border border-white/25 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-all hover:border-[#ff9dc2] hover:bg-[#ff9dc2] hover:text-ink">
            Discover our story
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

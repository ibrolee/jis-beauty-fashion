import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CategoryWithCount } from "@/types";

const ACCENTS = ["bg-[#ff8ab6]", "bg-[#ffb66f]", "bg-[#9b84ff]", "bg-[#76d8c5]", "bg-[#f2d65c]", "bg-[#f39bc7]", "bg-[#89b8ff]"] as const;

export function FeaturedCategories({ categories }: { categories: CategoryWithCount[] }) {
  const available = categories.filter((category) => category.productCount > 0 || category.slug === "men");
  if (!available.length) return null;

  return (
    <section id="collections" className="scroll-mt-24 py-18 sm:py-24 lg:py-30" aria-labelledby="categories-heading">
      <div className="container-x">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar" aria-label="Jump to a category">
          <Link href="/shop" className="shrink-0 rounded-full bg-ink px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-white">Shop all</Link>
          {available.filter((category) => category.slug === "women").map((category) => (
            <Link key={category.id} href={"/shop/" + category.slug} className="shrink-0 rounded-full border border-line bg-white/80 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-ink transition-all hover:-translate-y-0.5 hover:border-rosewood hover:text-rosewood">
              {category.name.replace("Perfumes for ", "").replace(" Perfumes", "")}
            </Link>
          ))}
          <Link href="/shop/men" className="shrink-0 rounded-full border border-line bg-white/80 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-ink transition-all hover:-translate-y-0.5 hover:border-rosewood hover:text-rosewood">
            Men
          </Link>
          {available.filter((category) => category.slug !== "women" && category.slug !== "men").map((category) => (
            <Link key={category.id} href={"/shop/" + category.slug} className="shrink-0 rounded-full border border-line bg-white/80 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-ink transition-all hover:-translate-y-0.5 hover:border-rosewood hover:text-rosewood">
              {category.name.replace("Perfumes for ", "").replace(" Perfumes", "")}
            </Link>
          ))}
        </div>

        <div className="mb-10 grid gap-6 border-b border-line pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow mb-4">Shop by mood / 01</p>
            <h2 id="categories-heading" className="max-w-[860px] font-serif text-[clamp(3.2rem,7vw,6.6rem)] leading-[0.9] tracking-[-0.045em]">
              Your scent wardrobe, <em className="font-normal text-rosewood">in full colour.</em>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.8] text-stone sm:text-base">
              Move from soft florals to deep woods, playful everyday sprays and concentrated oils without digging through endless menus.
            </p>
          </div>
          <Link href="/categories" className="group inline-flex w-fit items-center gap-3 rounded-full border border-ink/15 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition hover:border-rosewood hover:text-rosewood">
            See all collections <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {available.map((category, index) => {
            const wide = index === 0 || index === 3;
            return (
              <Link key={category.id} href={"/shop/" + category.slug} className={(wide ? "lg:col-span-7 " : "lg:col-span-5 ") + "group relative isolate min-h-[390px] overflow-hidden rounded-[2rem] bg-ink text-white sm:min-h-[460px]"} aria-label={"Shop " + category.name}>
                {category.image ? <Image src={category.image} alt={category.name} fill sizes="(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/5" aria-hidden="true" />
                <span className={"absolute left-5 top-5 rounded-full px-3 py-2 text-[9px] font-bold uppercase tracking-[0.19em] text-[#25121f] shadow-sm " + ACCENTS[index % ACCENTS.length]}>
                  Edit {String(index + 1).padStart(2, "0")}
                </span>
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 rounded-[1.5rem] border border-white/20 bg-black/15 p-5 backdrop-blur-[2px] sm:inset-x-6 sm:bottom-6 sm:p-6">
                  <div>
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-white/75">{category.productCount > 0 ? `${category.productCount} ${category.productCount === 1 ? "product" : "products"}` : "Explore category"}</p>
                    <h3 className="font-serif text-[clamp(2.3rem,4vw,4.4rem)] leading-[0.9] tracking-[-0.03em]">{category.name.replace("Perfumes for ", "").replace(" Perfumes", "")}</h3>
                    {category.description && <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/78">{category.description}</p>}
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-all duration-300 group-hover:rotate-12 group-hover:scale-105" aria-hidden="true"><ArrowUpRight className="h-5 w-5" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HomeSection } from "@/lib/website-content";
import type { CategoryWithCount } from "@/types";
export function FeaturedCategories({ categories, section, hideEmpty = false }: { categories: CategoryWithCount[]; section: HomeSection; hideEmpty?: boolean }) {
  const available = categories.filter((category) => category.isActive && (!hideEmpty || category.productCount > 0)).sort((a, b) => Number(b.productCount > 0) - Number(a.productCount > 0)).slice(0, 4);
  if (!available.length) return null;
  return <section id={section.id} className="scroll-mt-36 py-18 sm:py-24 lg:py-30" aria-label={section.title}><div className="container-x">
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-9"><div><p className="eyebrow mb-4">{section.eyebrow}</p><h2 className="max-w-4xl font-serif text-5xl leading-[0.95] sm:text-6xl">{section.title}</h2><p className="mt-5 max-w-xl text-base leading-relaxed text-stone">{section.body}</p></div>{section.buttonLabel && <Link href={section.buttonHref || "/categories"} className="inline-flex min-h-12 items-center gap-3 rounded-full border border-line bg-white px-5 text-xs uppercase tracking-wider">{section.buttonLabel}<ArrowUpRight className="h-4 w-4" /></Link>}</div>
    <div className="grid gap-5 sm:grid-cols-2">{available.map((category) => <Link key={category.id} href={`/shop/${category.slug}`} className="group relative isolate min-h-[420px] overflow-hidden rounded-[2rem] bg-ink text-white" aria-label={`Shop ${category.name}`}>{category.image && <Image src={category.image} alt={category.name} fill sizes="(min-width:640px) 50vw,100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /><div className="absolute inset-x-6 bottom-6"><p className="mb-3 text-xs uppercase tracking-wider">{category.productCount} {category.productCount === 1 ? "product" : "products"}</p><h3 className="font-serif text-4xl">{category.name}</h3><p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80">{category.description}</p></div></Link>)}</div>
  </div></section>;
}

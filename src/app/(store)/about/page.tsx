import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { pageContent, pageMetadata } from "@/lib/data/page-content";
export async function generateMetadata() { return pageMetadata("about"); }
export default async function AboutPage() {
  const { page, content } = await pageContent("about");
  return <><section className="overflow-hidden bg-ivory"><div className={`container-x grid items-center gap-12 py-16 lg:py-24 ${page.image ? "lg:grid-cols-2" : ""}`}><div><p className="eyebrow mb-6">{page.eyebrow}</p><h1 className="font-serif text-5xl leading-[0.94] sm:text-6xl lg:text-7xl">{page.title}</h1><p className="mt-8 max-w-xl whitespace-pre-line text-base leading-[1.9] text-ink-soft">{page.intro}</p>{page.buttonLabel && <ButtonLink href={page.buttonHref || "/shop"} size="lg" className="mt-9">{page.buttonLabel}</ButtonLink>}</div>{page.image && <div className="relative aspect-[4/5] overflow-hidden rounded-2xl"><Image src={page.image} alt={content.website.brand.name} fill priority sizes="(min-width:1024px) 50vw,100vw" className="object-cover" /></div>}</div></section>
  <section className="container-x grid gap-10 py-16 md:grid-cols-2 lg:py-24">{page.sections.map((section, index) => <article key={index} className="border-l border-line pl-6"><p className="mb-5 text-xs tracking-wider text-rosewood">{String(index + 1).padStart(2, "0")}</p><h2 className="font-serif text-3xl">{section.title}</h2><div className="mt-4 space-y-4 text-base leading-[1.9] text-stone">{section.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></article>)}</section></>;
}

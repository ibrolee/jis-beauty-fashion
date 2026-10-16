import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import type { PageContent } from "@/lib/website-content";

export function PageExtras({ page }: { page: PageContent }) {
  if (!page.image && !page.sections.length && !page.buttonLabel) return null;
  return <section className="container-x space-y-8 py-12">
    {page.image && <div className="relative aspect-[16/7] overflow-hidden rounded-2xl"><Image src={page.image} alt={page.title} fill sizes="100vw" className="object-cover" /></div>}
    {page.sections.map((section, index) => <div key={index} className="max-w-3xl space-y-4"><h2 className="font-serif text-3xl">{section.title}</h2>{section.body.map((paragraph, i) => <p key={i} className="text-sm leading-7 text-stone">{paragraph}</p>)}</div>)}
    {page.buttonLabel && <ButtonLink href={page.buttonHref || "/shop"}>{page.buttonLabel}</ButtonLink>}
  </section>;
}

import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import type { HomeSection } from "@/lib/website-content";
export function ManagedSection({ section }: { section: HomeSection }) {
  const dark = section.type === "editorial";
  return <section id={section.id} className={`scroll-mt-36 py-16 lg:py-24 ${dark ? "bg-ink text-white" : section.tone === "ivory" ? "bg-ivory" : "bg-cream"}`} aria-label={section.title}>
    <div className={`container-x grid items-center gap-10 ${section.image ? "lg:grid-cols-2" : ""}`}>
      {section.image && <div className="relative aspect-[4/5] overflow-hidden rounded-2xl"><Image src={section.image} alt={section.title} fill sizes="(min-width:1024px) 50vw,100vw" className="object-cover" /></div>}
      <div><p className={`mb-5 text-xs uppercase tracking-[0.2em] ${dark ? "text-white/70" : "text-rosewood"}`}>{section.eyebrow}</p><h2 className="max-w-3xl font-serif text-5xl leading-[0.95] sm:text-6xl">{section.title}</h2><div className={`mt-7 max-w-xl space-y-4 text-base leading-[1.9] ${dark ? "text-white/80" : "text-ink-soft"}`}>{section.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{section.buttonLabel && <ButtonLink href={section.buttonHref || "/shop"} variant={dark ? "white" : "secondary"} size="lg" className="mt-8">{section.buttonLabel}</ButtonLink>}</div>
    </div>
  </section>;
}

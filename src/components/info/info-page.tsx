import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/constants";

export type InfoSection = { title: string; body: string[] | ReactNode };

export function InfoPage({ eyebrow, title, intro, updated, sections, aside }: { eyebrow: string; title: string; intro?: string; updated?: string; sections: InfoSection[]; aside?: ReactNode }) {
  return (
    <div className="pb-20 lg:pb-28">
      <header className="border-b border-line bg-ivory py-16 sm:py-20 lg:py-24">
        <div className="container-x grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5">JIS / {eyebrow}</p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-[clamp(5rem,7vw,7.5rem)]">{title}</h1>
          </div>
          <div className="lg:col-span-4">
            {intro && <p className="max-w-md text-base leading-relaxed text-ink-soft">{intro}</p>}
            {updated && <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-stone">Last updated {updated}</p>}
          </div>
        </div>
      </header>
      <div className="container-x mt-12 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          {sections.map((section, index) => (
            <section key={`${section.title}-${index}`} aria-labelledby={`information-section-${index}`} className="grid gap-4 border-b border-line py-9 first:pt-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6">
              <span className="pt-1 text-[11px] font-medium tracking-[0.14em] text-rosewood" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2 id={`information-section-${index}`} className="font-serif text-3xl leading-tight sm:text-4xl">{section.title}</h2>
                <div className="mt-4 space-y-4 text-[15px] leading-[1.9] text-ink-soft">
                  {Array.isArray(section.body) ? section.body.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>) : section.body}
                </div>
              </div>
            </section>
          ))}
        </div>
        {aside && <aside className="lg:col-span-4 lg:col-start-9">{aside}</aside>}
      </div>
    </div>
  );
}

export function ContactAside() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return (
    <div className="sticky top-36 border border-line bg-cream p-7 sm:p-9">
      <p className="eyebrow mb-4">Personal assistance</p>
      <h2 className="font-serif text-4xl leading-tight">We’re here to help.</h2>
      <p className="mt-4 text-sm leading-relaxed text-stone">Questions about a product, payment or delivery? Reach our team using any of the options below.</p>
      <div className="mt-8 space-y-1 border-t border-line pt-4">
        <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between gap-2 border-b border-line text-sm text-ink-soft transition-colors hover:text-rosewood">WhatsApp {SITE.whatsapp}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
        {contactEmail && <a href={`mailto:${contactEmail}`} className="flex min-h-12 items-center justify-between gap-2 border-b border-line text-sm text-ink-soft transition-colors hover:text-rosewood">Email us<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>}
        <Link href="/contact" className="flex min-h-12 items-center justify-between gap-2 border-b border-line text-sm text-ink-soft transition-colors hover:text-rosewood">Contact form<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

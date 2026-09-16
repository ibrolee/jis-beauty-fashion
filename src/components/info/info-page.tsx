import type { ReactNode } from "react";

export type InfoSection = { title: string; body: string[] | ReactNode };

export function InfoPage({ eyebrow, title, intro, updated, sections, aside }: { eyebrow: string; title: string; intro?: string; updated?: string; sections: InfoSection[]; aside?: ReactNode }) {
  return (
    <div className="container-x py-10 lg:py-16">
      <header className="max-w-2xl border-b border-line pb-8">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="font-serif text-4xl leading-[1.05] sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 text-[15px] leading-relaxed text-stone">{intro}</p>}
        {updated && <p className="mt-3 text-xs uppercase tracking-[0.14em] text-mist">Last updated {updated}</p>}
      </header>
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          {sections.map((s) => (
            <section key={s.title} aria-labelledby={s.title}>
              <h2 id={s.title} className="font-serif text-2xl">{s.title}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-soft">
                {Array.isArray(s.body) ? s.body.map((p, i) => <p key={i}>{p}</p>) : s.body}
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
  return (
    <div className="sticky top-28 border border-line bg-cream p-6">
      <h2 className="font-serif text-2xl">Need a hand?</h2>
      <p className="mt-2 text-sm text-stone">Our team replies fastest on WhatsApp, Monday to Saturday, 9am – 7pm.</p>
      <ul className="mt-4 space-y-2 text-sm">
        <li>
          <a href="https://wa.me/2349042336294" className="underline underline-offset-4">WhatsApp 0904 233 6294</a>
        </li>
        <li>
          <a href="mailto:hello@jisbeauty.ng" className="underline underline-offset-4">hello@jisbeauty.ng</a>
        </li>
        <li>
          <a href="/contact" className="underline underline-offset-4">Contact form</a>
        </li>
      </ul>
    </div>
  );
}

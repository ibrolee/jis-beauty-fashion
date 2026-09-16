import type { Metadata } from "next";
import { ContactAside } from "@/components/info/info-page";
import { FAQ_ITEMS } from "@/content/policies";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about authenticity, delivery, payments, returns and coupons at JIS Beauty & Fashion.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="container-x py-10 lg:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-2xl border-b border-line pb-8">
        <p className="eyebrow mb-3">Help centre</p>
        <h1 className="font-serif text-4xl leading-[1.05] sm:text-5xl">Frequently asked questions</h1>
      </header>
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="divide-y divide-line border-y border-line">
            {FAQ_ITEMS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-2xl font-light text-stone transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <ContactAside />
        </aside>
      </div>
    </div>
  );
}

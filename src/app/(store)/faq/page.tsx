import type { Metadata } from "next";
import { ContactAside } from "@/components/info/info-page";
import { getFaqItems } from "@/lib/delivery-copy";
import { getSiteContent } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to questions about JIS Beauty & Fashion orders, delivery, payments and returns.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const content = await getSiteContent();
  const faqItems = getFaqItems(content.delivery);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };

  return (
    <div className="pb-20 lg:pb-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-line bg-ivory py-16 sm:py-20 lg:py-24">
        <div className="container-x grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5">JIS / Help centre</p>
            <h1 className="font-serif text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-[clamp(5rem,7vw,8rem)]">Good to <span className="italic text-rosewood">know.</span></h1>
          </div>
          <p className="max-w-sm text-base leading-[1.9] text-ink-soft lg:col-span-4">Answers to common questions about shopping, paying and receiving your JIS order.</p>
        </div>
      </header>
      <div className="container-x mt-12 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
        <section className="lg:col-span-7" aria-label="Frequently asked questions">
          <div className="divide-y divide-line border-y border-line">
            {faqItems.map((item, index) => (
              <details key={item.q} className="group py-6 open:pb-8">
                <summary className="flex cursor-pointer list-none items-start gap-5 text-ink focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
                  <span className="mt-2 shrink-0 text-[11px] tracking-[0.14em] text-rosewood" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-serif text-2xl leading-tight sm:text-3xl">{item.q}</span>
                  <span aria-hidden="true" className="mt-1 shrink-0 text-2xl font-light text-stone transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="ml-10 mt-4 max-w-2xl text-[15px] leading-[1.9] text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
        <aside className="lg:col-span-4 lg:col-start-9"><ContactAside /></aside>
      </div>
    </div>
  );
}

import { ContactAside, InfoPage } from "@/components/info/info-page";
import { pageContent, pageMetadata } from "@/lib/data/page-content";
import { websiteText } from "@/lib/website-presentation";
export async function generateMetadata() { return pageMetadata("faq"); }
export default async function FaqPage() {
  const { page, content } = await pageContent("faq");
  const items = content.website.faq.map((item) => ({ question: websiteText(item.question, content), answer: websiteText(item.answer, content) }));
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><InfoPage {...page} shortName={content.website.brand.shortName} sections={[...page.sections, { title: "", body: <div className="divide-y divide-line">{items.map((item, index) => <details key={index} className="group py-6"><summary className="flex cursor-pointer list-none items-start justify-between gap-5 font-serif text-2xl leading-tight"><span>{item.question}</span><span aria-hidden="true" className="group-open:rotate-45">+</span></summary><p className="mt-4 whitespace-pre-line text-base leading-[1.9]">{item.answer}</p></details>)}</div> }]} aside={<ContactAside website={content.website} />} /></>;
}

import Image from "next/image";
import { ContactForm } from "@/components/marketing/contact-form";
import { ButtonLink } from "@/components/ui/button";
import { ContactAside } from "@/components/info/info-page";
import { InstagramIcon, TikTokIcon } from "@/components/ui/social-icons";
import { brandLinks } from "@/lib/website-content";
import { pageContent, pageMetadata } from "@/lib/data/page-content";
export async function generateMetadata() { return pageMetadata("contact"); }
export default async function ContactPage() {
  const { page, content } = await pageContent("contact");
  const brand = brandLinks(content.website.brand);
  return <div className="pb-20"><header className="border-b border-line bg-ivory py-16 sm:py-20"><div className="container-x"><p className="eyebrow mb-5">{page.eyebrow}</p><h1 className="max-w-4xl font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">{page.title}</h1><p className="mt-6 max-w-xl text-base leading-[1.9] text-ink-soft">{page.intro}</p></div></header>
    <div className="container-x mt-12 grid gap-12 lg:grid-cols-12"><section className="lg:col-span-7">{page.image && <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl"><Image src={page.image} alt={page.title} fill sizes="60vw" className="object-cover" /></div>}{page.sections.map((section, i) => <div key={i} className="mb-8 border-b border-line pb-6"><h2 className="font-serif text-3xl">{section.title}</h2>{section.body.map((paragraph, j) => <p key={j} className="mt-3 text-sm leading-relaxed text-stone">{paragraph}</p>)}</div>)}<ContactForm />{page.buttonLabel && <ButtonLink href={page.buttonHref || "/shop"} className="mt-8">{page.buttonLabel}</ButtonLink>}</section>
    <aside className="lg:col-span-4 lg:col-start-9"><ContactAside website={content.website} /><div className="mt-6 space-y-4 border-t border-line pt-6">{brand.instagramUrl && <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 text-sm"><InstagramIcon className="h-5 w-5" />@{brand.instagram.replace(/^@/, "")}</a>}{brand.tiktokUrl && <a href={brand.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 text-sm"><TikTokIcon className="h-5 w-5" />@{brand.tiktok.replace(/^@/, "")}</a>}<p className="text-sm text-stone">{brand.name} · {brand.address}</p></div></aside></div>
  </div>;
}

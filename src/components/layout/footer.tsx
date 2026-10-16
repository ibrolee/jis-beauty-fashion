import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import type { BusinessContent } from "@/lib/site-content";
import { DEFAULT_WEBSITE_CONTENT, brandLinks, type WebsiteContent, type NavItem } from "@/lib/website-content";
import type { CategoryWithCount } from "@/types";
import { Logo } from "./logo";

function LinkList({ title, links }: { title: string; links: NavItem[] }) {
  return <div><h3 className="eyebrow mb-5">{title}</h3><ul className="space-y-3">{links.filter((link) => link.enabled).map((link, index) => <li key={`${link.href}-${index}`}><Link href={link.href || "/shop"} className="text-sm text-ink-soft transition-colors hover:text-rosewood">{link.label}</Link></li>)}</ul></div>;
}
export function Footer({ categories, content, website = DEFAULT_WEBSITE_CONTENT }: { categories: CategoryWithCount[]; content: BusinessContent; website?: WebsiteContent }) {
  const footer = website.footer;
  const brand = brandLinks(website.brand);
  if (!footer.enabled) return null;
  const shop = categories.filter((category) => category.isActive && (!website.navigation.hideEmptyCategories || category.productCount > 0)).map((category) => ({ label: category.name, href: `/shop/${category.slug}`, enabled: true }));
  return <footer className="border-t border-line bg-cream">
    <div className="container-x border-b border-line py-12 sm:py-16 lg:flex lg:items-end lg:justify-between lg:gap-10 lg:py-20"><div><p className="eyebrow mb-4">{footer.eyebrow}</p><h2 className="max-w-2xl font-serif text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">{footer.title}</h2></div>{footer.buttonLabel && <Link href={footer.buttonHref || "/shop"} className="mt-7 inline-flex min-h-12 items-center gap-5 border-b border-ink pb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink lg:mb-2">{footer.buttonLabel}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link>}</div>
    <div className="container-x grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-9 lg:py-20">
      <div className="lg:col-span-4"><Logo className="items-start" brand={website.brand} /><p className="mt-6 max-w-sm text-[15px] leading-[1.85] text-stone">{brand.tagline}. {content.footerTagline}</p><div className="mt-7 flex flex-wrap items-center gap-3">
        {brand.instagramUrl && <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`${brand.name} on Instagram`} className="flex h-11 w-11 items-center justify-center rounded-full border border-line"><InstagramIcon className="h-4 w-4" /></a>}
        {brand.tiktokUrl && <a href={brand.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label={`${brand.name} on TikTok`} className="flex h-11 w-11 items-center justify-center rounded-full border border-line"><TikTokIcon className="h-4 w-4" /></a>}
        {brand.whatsappUrl && <a href={brand.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-line"><WhatsAppIcon className="h-4 w-4" /></a>}
        {brand.instagram && <span className="text-xs text-stone">@{brand.instagram.replace(/^@/, "")}</span>}
      </div></div>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-2 lg:col-span-5"><LinkList title={footer.shopTitle} links={[...footer.shopLinks, ...(footer.includeCategories ? shop : [])]} /><LinkList title={footer.helpTitle} links={footer.helpLinks} /><LinkList title={footer.companyTitle} links={footer.companyLinks} /></div>
      {footer.showNewsletter && <div className="md:col-span-2 lg:col-span-3"><p className="eyebrow mb-3">{footer.newsletterEyebrow}</p><h3 className="font-serif text-3xl leading-tight">{footer.newsletterTitle}</h3><p className="mt-3 max-w-sm text-sm leading-relaxed text-stone">{footer.newsletterBody}</p><NewsletterForm className="mt-6" /></div>}
    </div>
    <div className="border-t border-line"><div className="container-x flex flex-col gap-3 py-6 text-xs text-stone sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} {brand.name}. {footer.copyright}</p><p>{content.footerPaymentNote}</p></div></div>
  </footer>;
}

import type { Metadata } from "next";
import { CollectionSection } from "@/components/home/collection-section";
import { ManagedSection } from "@/components/home/managed-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { Hero } from "@/components/home/hero";
import { NewsletterBand, PromoCta } from "@/components/home/sections";
import { getCategories } from "@/lib/data/categories";
import { getCollection, getProductsForCategory } from "@/lib/data/products";
import { getSiteContent } from "@/lib/data/settings";
import { brandLinks } from "@/lib/website-content";
import { websiteText } from "@/lib/website-presentation";
import { publicSiteOrigin } from "@/lib/utils";
import type { ProductListItem } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const { website } = await getSiteContent();
  return { title: { absolute: `${website.brand.name} — ${website.brand.tagline}` }, description: website.brand.description, alternates: { canonical: "/" } };
}
export default async function HomePage() {
  const [content, categories] = await Promise.all([getSiteContent(), getCategories()]);
  const brand = brandLinks(content.website.brand);
  const home = content.website.home;
  const tasks = new Map<string, Promise<ProductListItem[]>>();
  const sections = await Promise.all(home.sections.filter((section) => section.enabled).map(async (raw) => {
    const section = { ...raw, title: websiteText(raw.title, content), body: websiteText(raw.body, content) };
    if (section.type === "hero") return <Hero key={section.id} content={content.hero} quickLinks={home.quickLinks} brandLine={websiteText(home.brandLine, content)} scrollTarget={home.sections.find((item) => item.enabled && item.type !== "hero")?.id ?? "main"} />;
    if (section.type === "categories") return <FeaturedCategories key={section.id} categories={categories} section={section} hideEmpty={content.website.navigation.hideEmptyCategories} />;
    if (section.type === "newsletter") return <div key={section.id} id={section.id}><NewsletterBand section={section} /></div>;
    if (section.type === "promo") return <div key={section.id} id={section.id}><PromoCta content={content.promo} brand={content.website.brand} /></div>;
    if (section.type !== "collection") return <ManagedSection key={section.id} section={section} />;
    const taskKey = `${section.source}:${section.categorySlug}:${section.limit}`;
    if (!tasks.has(taskKey)) tasks.set(taskKey, section.source === "category" ? getProductsForCategory(section.categorySlug, section.limit) : getCollection(section.source, section.limit));
    const products = await tasks.get(taskKey)!;
    return <div key={section.id} id={section.id} className="scroll-mt-36"><CollectionSection eyebrow={section.eyebrow} title={section.title} description={section.body} href={section.buttonLabel ? section.buttonHref : ""} linkLabel={section.buttonLabel} products={products} limit={section.limit} tone={section.tone} feature={section.image ? { image: section.image, title: section.title, subtitle: section.eyebrow } : undefined} /></div>;
  }));
  const jsonLd = { "@context": "https://schema.org", "@type": "Store", name: brand.name, description: brand.description, url: publicSiteOrigin(), telephone: brand.phone, address: { "@type": "PostalAddress", addressLocality: brand.address, addressCountry: "NG" }, sameAs: [brand.instagramUrl, brand.tiktokUrl].filter(Boolean) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />{!home.sections.some((section) => section.enabled && section.type === "hero") && <h1 className="sr-only">{brand.name}</h1>}{sections}</>;
}

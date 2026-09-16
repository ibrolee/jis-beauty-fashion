import type { Metadata } from "next";
import { CollectionSection } from "@/components/home/collection-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { Hero } from "@/components/home/hero";
import { BrandStory, NewsletterBand, PromoCta, SocialSection, Testimonials, WhyJis } from "@/components/home/sections";
import { SITE } from "@/lib/constants";
import { getCategories } from "@/lib/data/categories";
import { getCollection, getProductsForCategory } from "@/lib/data/products";
import { getSiteContent } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [content, categories, bestSellers, newArrivals, women, men, unisex, kids, oils] = await Promise.all([
    getSiteContent(),
    getCategories(),
    getCollection("bestSellers", 8),
    getCollection("newArrivals", 8),
    getProductsForCategory("women", 4),
    getProductsForCategory("men", 4),
    getProductsForCategory("unisex", 4),
    getProductsForCategory("kids", 4),
    getProductsForCategory("perfume-oils", 4),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE.name,
    description: SITE.description,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    telephone: `+234${SITE.phone.slice(1)}`,
    address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
    sameAs: [SITE.instagramUrl, SITE.tiktokUrl],
    priceRange: "₦₦",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero content={content.hero} />
      <FeaturedCategories categories={categories} />
      <CollectionSection eyebrow="Most loved" title="Best sellers" description="The scents our customers keep coming back for." href="/shop?bestSellers=1" products={bestSellers} tone="ivory" priorityCount={2} />
      <BrandStory />
      <CollectionSection eyebrow="Just landed" title="New arrivals" href="/shop?newArrivals=1&sort=newest" products={newArrivals} />
      <CollectionSection
        eyebrow="For her"
        title="Women's fragrances"
        href="/shop/women"
        products={women}
        feature={{ image: "/images/products/women-2.jpg", title: "Soft florals & warm ambers", subtitle: "Women's edit" }}
        tone="ivory"
      />
      <CollectionSection
        eyebrow="For him"
        title="Men's fragrances"
        href="/shop/men"
        products={men}
        feature={{ image: "/images/products/men-1.jpg", title: "Woods, leather & spice", subtitle: "Men's edit" }}
      />
      <CollectionSection eyebrow="For everyone" title="Unisex fragrances" href="/shop/unisex" products={unisex} tone="ivory" />
      <CollectionSection eyebrow="Little ones" title="Kids' fragrances" description="Gentle, alcohol-free mists for delicate skin." href="/shop/kids" products={kids} />
      <CollectionSection
        eyebrow="Concentrated"
        title="Perfume oils"
        description="Long-lasting oils — perfect alone or layered under your favourite scent."
        href="/shop/perfume-oils"
        products={oils}
        feature={{ image: "/images/products/oil-2.jpg", title: "A drop lasts all day", subtitle: "Perfume oils" }}
        tone="ivory"
      />
      <WhyJis />
      <Testimonials />
      <SocialSection />
      <NewsletterBand />
      <PromoCta content={content.promo} />
    </>
  );
}

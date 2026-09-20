import type { Metadata } from "next";
import { CollectionSection } from "@/components/home/collection-section";
import { EditorialStory } from "@/components/home/editorial-story";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { Hero } from "@/components/home/hero";
import { NewsletterBand, PromoCta } from "@/components/home/sections";
import { SITE } from "@/lib/constants";
import { getCategories } from "@/lib/data/categories";
import { getCollection, getProductsForCategory } from "@/lib/data/products";
import { getSiteContent } from "@/lib/data/settings";
import { publicSiteOrigin } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [content, categories, bestSellers, newArrivals, women, men, unisex, kids, oils, bodySprays] = await Promise.all([
    getSiteContent(),
    getCategories(),
    getCollection("bestSellers", 8),
    getCollection("newArrivals", 8),
    getProductsForCategory("women", 4),
    getProductsForCategory("men", 4),
    getProductsForCategory("unisex", 4),
    getProductsForCategory("kids", 4),
    getProductsForCategory("perfume-oils", 4),
    getProductsForCategory("body-sprays-deodorants", 4),
  ]);

  const categoryImage = (slug: string, fallback: string) =>
    categories.find((category) => category.slug === slug)?.image || fallback;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE.name,
    description: SITE.description,
    url: publicSiteOrigin(),
    telephone: `+234${SITE.phone.slice(1)}`,
    address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
    sameAs: [SITE.instagramUrl, SITE.tiktokUrl],
    priceRange: "₦₦",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero content={content.hero} />
      <FeaturedCategories categories={categories} />
      <CollectionSection
        eyebrow="The latest edit / 02"
        title="New & noteworthy"
        description="Explore the latest products added to the JIS collection."
        href="/shop?newArrivals=1&sort=newest"
        products={newArrivals}
        priorityCount={2}
      />
      <EditorialStory />
      <CollectionSection
        eyebrow="The favourites / 03"
        title="Best sellers"
        description="Discover what customers are choosing."
        href="/shop?bestSellers=1"
        products={bestSellers}
        tone="ivory"
      />
      <CollectionSection
        eyebrow="The women's edit"
        title="Fragrance for her"
        href="/shop/women"
        products={women}
        feature={{ image: categoryImage("women", "/images/products/women-2.jpg"), title: "Explore the women's edit", subtitle: "The collection" }}
        tone="ivory"
      />
      <CollectionSection
        eyebrow="The men's edit"
        title="Fragrance for him"
        href="/shop/men"
        products={men}
        feature={{ image: categoryImage("men", "/images/products/men-1.jpg"), title: "Explore the men's edit", subtitle: "The collection" }}
      />
      <CollectionSection eyebrow="For everyone" title="Unisex fragrances" href="/shop/unisex" products={unisex} tone="ivory" />
      <CollectionSection
        eyebrow="Everyday essentials"
        title="Body sprays & deodorants"
        href="/shop/body-sprays-deodorants"
        products={bodySprays}
        feature={{ image: categoryImage("body-sprays-deodorants", "/catalog/category-deodorants-selected-20260918.jpg"), title: "Your everyday edit", subtitle: "Body & fragrance" }}
      />
      <CollectionSection eyebrow="Little ones" title="Kids' fragrances" href="/shop/kids" products={kids} />
      <CollectionSection eyebrow="The concentrated edit" title="Perfume oils" href="/shop/perfume-oils" products={oils} tone="ivory" />
      <NewsletterBand />
      <PromoCta content={content.promo} />
    </>
  );
}

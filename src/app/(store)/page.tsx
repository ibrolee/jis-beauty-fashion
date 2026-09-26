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
  title: SITE.name + " — " + SITE.tagline,
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
    telephone: "+234" + SITE.phone.slice(1),
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
        eyebrow="Fresh on the shelf / 02"
        title="New scents, new moods"
        description="The newest additions to JIS — ready for your next signature."
        href="/shop?newArrivals=1&sort=newest"
        products={newArrivals}
        priorityCount={2}
      />
      <EditorialStory />
      <CollectionSection
        eyebrow="Most wanted / 03"
        title="The bottles everyone notices"
        description="Customer favourites worth starting with when you want something memorable."
        href="/shop?bestSellers=1"
        products={bestSellers}
        tone="ivory"
      />
      <CollectionSection
        eyebrow="Soft, bold, unforgettable"
        title="The women's fragrance edit"
        href="/shop/women"
        products={women}
        feature={{ image: categoryImage("women", "/catalog/category-women-v2.jpg"), title: "Meet the women's edit", subtitle: "For her" }}
        tone="ivory"
      />
      <CollectionSection
        eyebrow="Clean, deep, confident"
        title="The men's fragrance edit"
        href="/shop/men"
        products={men}
        feature={{ image: categoryImage("men", "/catalog/category-men-v2.jpg"), title: "Meet the men's edit", subtitle: "For him" }}
      />
      <CollectionSection eyebrow="No labels, just good scent" title="Unisex favourites" href="/shop/unisex" products={unisex} tone="ivory" />
      <CollectionSection
        eyebrow="Easy everyday energy"
        title="Body sprays & deodorants"
        href="/shop/body-sprays-deodorants"
        products={bodySprays}
        feature={{ image: categoryImage("body-sprays-deodorants", "/catalog/category-deodorants-v2.jpg"), title: "Freshness, styled your way", subtitle: "Body & fragrance" }}
      />
      <CollectionSection eyebrow="Small scents, big personality" title="Kids' fragrances" href="/shop/kids" products={kids} />
      <CollectionSection eyebrow="A little goes a long way" title="Perfume oils" href="/shop/perfume-oils" products={oils} tone="ivory" />
      <NewsletterBand />
      <PromoCta content={content.promo} />
    </>
  );
}

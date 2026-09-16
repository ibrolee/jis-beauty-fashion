import type { Metadata } from "next";
import { ShopPage } from "@/components/shop/shop-page";
import type { SearchParamsRecord } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Shop All Fragrances",
  description: "Browse authentic perfumes for women, men, unisex, kids and long-lasting perfume oils. Filter by price, brand, notes and more. Delivered across Nigeria.",
  alternates: { canonical: "/shop" },
};

export default async function ShopAllPage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const params = await searchParams;
  return (
    <ShopPage
      eyebrow="The collection"
      title="Shop all"
      description="Every fragrance and perfume oil in one place. Use the filters to find your signature scent."
      basePath="/shop"
      searchParams={params}
    />
  );
}

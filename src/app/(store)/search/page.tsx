import type { Metadata } from "next";
import { ShopPage } from "@/components/shop/shop-page";
import type { SearchParamsRecord } from "@/lib/shop-params";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParamsRecord> }): Promise<Metadata> {
  const { q } = await searchParams;
  const term = Array.isArray(q) ? q[0] : q;
  return { title: term ? `Search: ${term}` : "Search", robots: { index: false } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const params = await searchParams;
  const term = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";

  return (
    <ShopPage
      eyebrow="Search"
      title={term ? `Results for “${term}”` : "Search our collection"}
      description={term ? undefined : "Use the search icon in the header to look for a perfume, brand or fragrance note."}
      basePath="/search"
      searchParams={params}
      emptyTitle={term ? `Nothing found for “${term}”` : "Start with a search"}
      emptyDescription="Check the spelling, try a broader term like “oud” or “vanilla”, or browse the whole collection."
    />
  );
}

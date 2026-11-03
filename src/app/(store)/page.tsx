import type { Metadata } from "next";
import { ShopPage } from "@/components/shop/shop-page";
import { pageContent, pageMetadata } from "@/lib/data/page-content";
import type { SearchParamsRecord } from "@/lib/shop-params";

export const generateMetadata = () => pageMetadata("shop");

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const [params, page] = await Promise.all([searchParams, pageContent("shop")]);
  return <ShopPage eyebrow="JIS Beauty & Fashion" title="Find your fragrance" description="Browse the collection and discover a scent that feels like you." basePath="/shop" searchParams={params} />;
}

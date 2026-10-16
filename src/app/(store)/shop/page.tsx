import { ShopPage } from "@/components/shop/shop-page";
import { PageExtras } from "@/components/info/page-extras";
import { pageContent, pageMetadata } from "@/lib/data/page-content";
import type { SearchParamsRecord } from "@/lib/shop-params";
export const generateMetadata = () => pageMetadata("shop");
export default async function ShopAllPage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const [params, {page}] = await Promise.all([searchParams, pageContent("shop")]);
  return <><ShopPage eyebrow={page.eyebrow} title={page.title} description={page.intro} basePath="/shop" searchParams={params} /><PageExtras page={page} /></>;
}

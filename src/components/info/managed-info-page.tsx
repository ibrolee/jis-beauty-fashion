import { ContactAside, InfoPage } from "@/components/info/info-page";
import { pageContent } from "@/lib/data/page-content";
import type { PageKey } from "@/lib/website-content";
export async function ManagedInfoPage({ pageKey, help = false }: { pageKey: PageKey; help?: boolean }) {
  const { page, content } = await pageContent(pageKey);
  return <InfoPage {...page} shortName={content.website.brand.shortName} aside={help ? <ContactAside website={content.website} /> : undefined} />;
}

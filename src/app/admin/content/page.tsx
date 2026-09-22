import { requireAdmin } from "@/lib/auth/session";
import { AnnouncementForm, BusinessCopyForm, HeroForm, PromoForm } from "@/components/admin/content-forms";
import { AdminPageHeader } from "@/components/admin/ui";
import { getSiteContent } from "@/lib/data/settings";

export const metadata = { title: "Site content" };

export default async function AdminContentPage() {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const content = await getSiteContent();
  return (
    <div>
      <AdminPageHeader title="Site content" description="Edit key homepage, checkout, bank transfer and footer copy without touching code." />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <AnnouncementForm content={content.announcement} />
          <PromoForm content={content.promo} />
          <BusinessCopyForm content={content.business} />
        </div>
        <HeroForm content={content.hero} />
      </div>
    </div>
  );
}

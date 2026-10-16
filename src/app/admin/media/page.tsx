import { requireAdmin } from "@/lib/auth/session";
import { getMediaLibrary } from "@/lib/data/media";
import { MediaManager } from "@/components/admin/media-manager";
import { AdminPageHeader } from "@/components/admin/ui";
export const metadata = { title: "Media library" };
export default async function MediaPage() {
  await requireAdmin();
  const assets = await getMediaLibrary(true);
  return <div><AdminPageHeader title="Media library" description="Upload, name and reuse images throughout your website." /><MediaManager initial={assets} /></div>;
}

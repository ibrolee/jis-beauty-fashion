import { requireAdmin } from "@/lib/auth/session";
import { WebsiteEditor } from "@/components/admin/website-editor";
import { AdminPageHeader } from "@/components/admin/ui";
import { getWebsiteEditorState } from "@/lib/data/website-editor";
import { getCategories } from "@/lib/data/categories";

export const metadata = { title: "Site content" };

export default async function AdminContentPage() {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const [state, categories] = await Promise.all([getWebsiteEditorState(), getCategories()]);
  return (
    <div>
      <AdminPageHeader title="Edit your website" description="Change photos, words, menus and business details without coding." />
      <WebsiteEditor initial={state} categories={categories.map(({ name, slug }) => ({ name, slug }))} />
    </div>
  );
}

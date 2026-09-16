import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";
import { ActionButton, AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { deleteCategoryAction } from "@/lib/actions/admin";
import { getCategories } from "@/lib/data/categories";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const { edit } = await searchParams;
  const categories = await getCategories(true);
  const editing = edit ? categories.find((c) => c.id === Number(edit)) ?? null : null;

  return (
    <div>
      <AdminPageHeader title="Categories" description="Add beauty, skincare or fashion categories any time — the storefront navigation updates automatically." actions={editing ? <Link href="/admin/categories" className="text-xs uppercase tracking-[0.16em] underline underline-offset-4">New category</Link> : undefined} />
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Table>
            <thead>
              <tr>
                <th className={th}>Category</th>
                <th className={th}>Slug</th>
                <th className={th}>Products</th>
                <th className={th}>Order</th>
                <th className={th}>Status</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className={td}><p className="font-medium">{c.name}</p></td>
                  <td className={`${td} font-mono text-xs`}>/shop/{c.slug}</td>
                  <td className={td}>{c.productCount}</td>
                  <td className={td}>{c.sortOrder}</td>
                  <td className={td}>{c.isActive ? <Badge tone="success">Visible</Badge> : <Badge>Hidden</Badge>}</td>
                  <td className={td}>
                    <div className="flex gap-1.5">
                      <Link href={`/admin/categories?edit=${c.id}`} className="inline-flex h-8 items-center border border-line px-2.5 text-[11px] font-medium uppercase tracking-[0.12em] hover:border-ink">Edit</Link>
                      <ActionButton tone="danger" confirmMessage={`Delete "${c.name}"?`} action={deleteCategoryAction.bind(null, c.id)}>Delete</ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div>
          <CategoryForm category={editing} />
        </div>
      </div>
    </div>
  );
}

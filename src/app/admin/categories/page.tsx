import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";
import {
  ActionButton,
  AdminPageHeader,
  Table,
  td,
  th,
} from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { deleteCategoryAction } from "@/lib/actions/admin";
import { getCategories } from "@/lib/data/categories";

export const metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();

  const { edit } = await searchParams;
  const categories = await getCategories(true);

  const editing = edit
    ? categories.find((c) => c.id === Number(edit)) ?? null
    : null;

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Categories"
        description="Add beauty, skincare or fashion categories any time — the storefront navigation updates automatically."
        actions={
          editing ? (
            <Link
              href="/admin/categories"
              className="text-xs uppercase tracking-[0.16em] underline underline-offset-4"
            >
              New category
            </Link>
          ) : undefined
        }
      />

      <div className="grid min-w-0 gap-8 xl:grid-cols-3">
        {/* =========================
            DESKTOP TABLE
           ========================= */}
        <div className="hidden min-w-0 xl:col-span-2 sm:block">
          <div className="min-w-0 overflow-x-auto">
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
                    <td className={td}>
                      <p className="font-medium">{c.name}</p>
                    </td>

                    <td className={`${td} font-mono text-xs`}>
                      /shop/{c.slug}
                    </td>

                    <td className={td}>
                      {c.productCount}
                    </td>

                    <td className={td}>
                      {c.sortOrder}
                    </td>

                    <td className={td}>
                      {c.isActive ? (
                        <Badge tone="success">
                          Visible
                        </Badge>
                      ) : (
                        <Badge>
                          Hidden
                        </Badge>
                      )}
                    </td>

                    <td className={td}>
                      <div className="flex gap-1.5">
                        <Link
                          href={`/admin/categories?edit=${c.id}`}
                          className="inline-flex h-8 items-center border border-line px-2.5 text-[11px] font-medium uppercase tracking-[0.12em] hover:border-ink"
                        >
                          Edit
                        </Link>

                        <ActionButton
                          tone="danger"
                          confirmMessage={`Delete "${c.name}"?`}
                          action={deleteCategoryAction.bind(
                            null,
                            c.id,
                          )}
                        >
                          Delete
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>

        {/* =========================
            MOBILE CATEGORY CARDS
           ========================= */}
        <div className="min-w-0 space-y-3 sm:hidden">
          {categories.map((c) => (
            <div
              key={c.id}
              className="min-w-0 overflow-hidden border border-line bg-white"
            >
              <div className="border-b border-line px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-medium">
                      {c.name}
                    </h2>

                    <p className="mt-1 break-all font-mono text-xs text-stone">
                      /shop/{c.slug}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {c.isActive ? (
                      <Badge tone="success">
                        Visible
                      </Badge>
                    ) : (
                      <Badge>
                        Hidden
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-line px-4 py-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone">
                    Products
                  </p>

                  <p className="mt-1 text-sm">
                    {c.productCount}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone">
                    Display order
                  </p>

                  <p className="mt-1 text-sm">
                    {c.sortOrder}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 px-4 py-4">
                <Link
                  href={`/admin/categories?edit=${c.id}`}
                  className="inline-flex h-11 flex-1 items-center justify-center border border-ink text-[11px] font-medium uppercase tracking-[0.14em]"
                >
                  Edit
                </Link>

                <ActionButton
                  tone="danger"
                  confirmMessage={`Delete "${c.name}"?`}
                  action={deleteCategoryAction.bind(
                    null,
                    c.id,
                  )}
                >
                  Delete
                </ActionButton>
              </div>
            </div>
          ))}
        </div>

        {/* Category form */}
        <div className="min-w-0">
          <CategoryForm category={editing} />
        </div>
      </div>
    </div>
  );
}
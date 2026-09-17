import { requireAdmin } from "@/lib/auth/session";
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

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await getCategories(true);

  return (
    <div className="min-w-0">
      <AdminPageHeader
        title="Categories"
        description="Add beauty, skincare or fashion categories any time — the storefront navigation updates automatically."
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
                {categories.length === 0 ? (
                  <tr>
                    <td className={td} colSpan={6}>
                      No categories yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id}>
                      <td className={td}>
                        <p className="font-medium">
                          {c.name}
                        </p>
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* =========================
            MOBILE CATEGORY CARDS
           ========================= */}
        <div className="min-w-0 space-y-3 sm:hidden">
          {categories.length === 0 ? (
            <div className="border border-line bg-white p-5 text-sm text-stone">
              No categories yet.
            </div>
          ) : (
            categories.map((c) => (
              <div
                key={c.id}
                className="min-w-0 overflow-hidden border border-line bg-white"
              >
                {/* Category heading */}
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

                {/* Category information */}
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

                {/* Delete only */}
                <div className="px-4 py-4">
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
            ))
          )}
        </div>

        {/* =========================
            NEW CATEGORY FORM
           ========================= */}
        <div className="min-w-0">
          <CategoryForm category={null} />
        </div>
      </div>
    </div>
  );
}
import { requireAdmin } from "@/lib/auth/session";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getCategories } from "@/lib/data/categories";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const categories = await getCategories(true);
  return (
    <div>
      <AdminPageHeader title="Add product" description="Create a new product for the storefront." />
      <ProductForm product={null} categories={categories} />
    </div>
  );
}

import { requireAdmin } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { getCategories } from "@/lib/data/categories";
import { getProductById } from "@/lib/data/products";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product, categories] = await Promise.all([getProductById(productId), getCategories(true)]);
  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader title={product.name} description={`SKU ${product.sku} · ${product.reviewCount} reviews · ${product.salesCount} sold`} />
      <ProductForm product={product} categories={categories} />
    </div>
  );
}

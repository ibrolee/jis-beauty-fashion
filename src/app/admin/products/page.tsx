import { requireAdmin } from "@/lib/auth/session";
import Image from "next/image";
import Link from "next/link";
import { ActionButton, AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { deleteProductAction, toggleProductActiveAction } from "@/lib/actions/admin";
import { getAllProductsAdmin } from "@/lib/data/products";
import { formatNaira } from "@/lib/utils";

export const metadata = { title: "Products" };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; saved?: string }> }) {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const { q, saved } = await searchParams;
  const products = await getAllProductsAdmin(q);

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/products/new" className={buttonClasses("primary", "sm")}>
            Add product
          </Link>
        }
      />
      {saved && <p className="mb-4 border border-success/30 bg-green-50 px-4 py-2 text-sm text-success">Product saved.</p>}

      <form className="mb-4 flex gap-2" role="search">
        <input name="q" defaultValue={q ?? ""} placeholder="Search by name or SKU…" className="h-10 w-full max-w-sm border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none" />
        <button type="submit" className={buttonClasses("secondary", "sm")}>Search</button>
      </form>

      <Table>
        <thead>
          <tr>
            <th className={th}>Product</th>
            <th className={th}>Category</th>
            <th className={th}>Price</th>
            <th className={th}>Stock</th>
            <th className={th}>Flags</th>
            <th className={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td className={td} colSpan={6}>No products found.</td>
            </tr>
          )}
          {products.map((p) => (
            <tr key={p.id} className={p.isActive ? "" : "opacity-60"}>
              <td className={td}>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-ivory">{p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />}</div>
                  <div className="min-w-0">
                    <Link href={`/admin/products/${p.id}`} className="block truncate font-medium underline-offset-4 hover:underline">{p.name}</Link>
                    <p className="text-xs text-stone">{p.sku}{p.brandName ? ` · ${p.brandName}` : ""}</p>
                  </div>
                </div>
              </td>
              <td className={td}>{p.categoryName}</td>
              <td className={`${td} tabular-nums`}>
                {formatNaira(p.price)}
                {p.salePrice ? <p className="text-xs text-sale">Sale {formatNaira(p.salePrice)}</p> : null}
              </td>
              <td className={td}>
                <span className={p.stock === 0 ? "text-sale" : p.stock <= 5 ? "text-amber-700" : ""}>{p.stock}</span>
              </td>
              <td className={td}>
                <div className="flex flex-wrap gap-1">
                  {!p.isActive && <Badge tone="danger">Hidden</Badge>}
                  {p.isFeatured && <Badge tone="best">Featured</Badge>}
                  {p.isBestSeller && <Badge>Best seller</Badge>}
                  {p.isNewArrival && <Badge tone="new">New</Badge>}
                </div>
              </td>
              <td className={td}>
                <div className="flex flex-wrap gap-1.5">
                  <Link href={`/admin/products/${p.id}`} className="inline-flex h-8 items-center border border-line px-2.5 text-[11px] font-medium uppercase tracking-[0.12em] hover:border-ink">Edit</Link>
                  <ActionButton action={toggleProductActiveAction.bind(null, p.id, !p.isActive)}>{p.isActive ? "Hide" : "Publish"}</ActionButton>
                  <ActionButton tone="danger" confirmMessage={`Delete "${p.name}"? This cannot be undone.`} action={deleteProductAction.bind(null, p.id)}>Delete</ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

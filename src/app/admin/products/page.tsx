import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { ActionButton, AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { ProductQuickEdit } from "@/components/admin/product-quick-edit";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { archiveProductAction, duplicateProductAction, toggleProductActiveAction } from "@/lib/actions/admin";
import { getAllProductsAdmin } from "@/lib/data/products";
import { formatNaira } from "@/lib/utils";
import type { ProductListItem } from "@/types";

export const metadata = { title: "Products" };
type View = "active" | "archived" | "all";

function ProductActions({ product: p }: { product: ProductListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link href={`/admin/products/${p.id}`} className="inline-flex min-h-8 items-center border border-line px-2.5 text-[11px] font-medium uppercase tracking-[0.12em] hover:border-ink">Edit</Link>
      <ActionButton action={duplicateProductAction.bind(null, p.id)}>Duplicate</ActionButton>
      {p.isActive
        ? <ActionButton tone="danger" confirmMessage={`Archive "${p.name}"? It will be hidden from the shop and can be restored later. Existing orders will remain intact.`} action={archiveProductAction.bind(null, p.id)}>Archive</ActionButton>
        : <ActionButton action={toggleProductActiveAction.bind(null, p.id, true)}>Restore to shop</ActionButton>}
    </div>
  );
}

function QuickEdit({ product: p }: { product: ProductListItem }) {
  return (
    <details className="mt-2 max-w-md">
      <summary className="cursor-pointer text-xs font-semibold underline underline-offset-4">Quick price / stock</summary>
      <div className="mt-2">
        <ProductQuickEdit
          id={p.id}
          price={p.price}
          salePrice={p.salePrice}
          stock={p.stock}
          updatedAt={p.updatedAt.toISOString()}
          hasVariants={p.hasVariants}
        />
      </div>
    </details>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; saved?: string; view?: string }>;
}) {
  await requireAdmin();
  const { q, saved, view: rawView } = await searchParams;
  const view: View = rawView === "archived" || rawView === "all" ? rawView : "active";
  const allProducts = await getAllProductsAdmin(q);
  const products = allProducts.filter((p) => view === "all" || (view === "active" ? p.isActive : !p.isActive));
  const activeCount = allProducts.filter((p) => p.isActive).length;
  const archivedCount = allProducts.length - activeCount;
  const listHref = (value: View) => `/admin/products?view=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Manage products"
        description={`${activeCount} active · ${archivedCount} archived · ${allProducts.length} total`}
        actions={<Link href="/admin/products/new" className={buttonClasses("primary", "sm")}>Add product</Link>}
      />
      {saved && <p role="status" className="border border-success/30 bg-green-50 px-4 py-2 text-sm text-success">Product saved.</p>}
      <div className="flex flex-wrap gap-2" aria-label="Product visibility filters">
        {(["active", "archived", "all"] as const).map((option) => (
          <Link
            key={option}
            href={listHref(option)}
            aria-current={view === option ? "page" : undefined}
            className={`inline-flex min-h-9 items-center border px-3 py-2 text-xs font-semibold uppercase tracking-wider ${view === option ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"}`}
          >
            {option === "active" ? `Active (${activeCount})` : option === "archived" ? `Archived (${archivedCount})` : "All"}
          </Link>
        ))}
      </div>
      <form className="flex flex-wrap gap-2" role="search">
        <input type="hidden" name="view" value={view} />
        <input name="q" defaultValue={q ?? ""} placeholder="Search by product name or SKU…" aria-label="Search products" className="h-10 w-full max-w-sm min-w-0 flex-1 border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none" />
        <button type="submit" className={buttonClasses("secondary", "sm")}>Search</button>
      </form>
      <p className="text-xs text-stone">Duplicates start as unpublished drafts with zero stock. Archived products stay available here for recovery; previous orders are never deleted.</p>
      <div className="hidden md:block">
        <Table>
          <thead><tr>
            <th className={th}>Product</th><th className={th}>Price / stock</th><th className={th}>Category</th><th className={th}>Status</th><th className={th}>Manage</th>
          </tr></thead>
          <tbody>
            {products.length === 0 && <tr><td className={td} colSpan={5}>No products in this view.</td></tr>}
            {products.map((p) => (
              <tr key={p.id} className={p.isActive ? "" : "bg-cream/60"}>
                <td className={td}>
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-ivory">{p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}</div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p.id}`} className="block max-w-44 break-words font-medium underline-offset-4 hover:underline">{p.name}</Link>
                      <p className="text-xs text-stone">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className={td}>
                  <span className="tabular-nums">{formatNaira(p.salePrice ?? p.price)}</span>
                  <p className={`text-xs ${p.stock <= 5 ? "text-amber-700" : "text-stone"}`}>{p.stock} in stock {p.hasVariants ? "· Has options" : ""}</p>
                  <QuickEdit product={p} />
                </td>
                <td className={td}>{p.categoryName}</td>
                <td className={td}>
                  {p.isActive ? <Badge tone="new">Live</Badge> : <Badge tone="danger">Archived</Badge>}
                  {p.isFeatured && <p className="mt-1 text-xs text-stone">Featured</p>}
                </td>
                <td className={td}><ProductActions product={p} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {products.length === 0 && <p className="border border-line bg-white p-5 text-sm text-stone">No products in this view.</p>}
        {products.map((p) => (
          <article key={p.id} className="min-w-0 border border-line bg-white p-4">
            <div className="flex min-w-0 gap-3">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-ivory">{p.images[0] && <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${p.id}`} className="block break-words font-semibold">{p.name}</Link>
                <p className="break-all text-xs text-stone">{p.sku} · {p.categoryName}</p>
                <p className="mt-1 text-sm font-semibold">{formatNaira(p.salePrice ?? p.price)} · {p.stock} left</p>
                <span className="text-xs text-stone">{p.isActive ? "Active" : "Archived"}</span>
              </div>
            </div>
            <div className="mt-4 border-t border-line pt-3">
              <ProductActions product={p} />
              <QuickEdit product={p} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

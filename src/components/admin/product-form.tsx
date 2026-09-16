"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form-fields";
import type { Category } from "@/db/schema";
import { saveProductAction } from "@/lib/actions/admin";
import { initialActionState, type ProductDetail } from "@/types";

export function ProductForm({ product, categories }: { product: ProductDetail | null; categories: Category[] }) {
  const [state, action, pending] = useActionState(saveProductAction, initialActionState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-8" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <section className="space-y-5 border border-line bg-white p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">Basics</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Product name" htmlFor="name" error={fe.name} required className="sm:col-span-2">
                <Input id="name" name="name" defaultValue={product?.name ?? ""} required />
              </Field>
              <Field label="Slug" htmlFor="slug" error={fe.slug} hint="Leave blank to generate from the name. URL: /product/slug">
                <Input id="slug" name="slug" defaultValue={product?.slug ?? ""} />
              </Field>
              <Field label="SKU" htmlFor="sku" error={fe.sku} required>
                <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} required />
              </Field>
              <Field label="Category" htmlFor="categoryId" error={fe.categoryId} required>
                <Select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""} required>
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Brand" htmlFor="brandName" error={fe.brandName} hint="Created automatically if new.">
                <Input id="brandName" name="brandName" defaultValue={product?.brandName ?? ""} />
              </Field>
              <Field label="Gender" htmlFor="gender" error={fe.gender} required>
                <Select id="gender" name="gender" defaultValue={product?.gender ?? "unisex"}>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="unisex">Unisex</option>
                  <option value="kids">Kids</option>
                </Select>
              </Field>
              <Field label="Short description" htmlFor="shortDescription" error={fe.shortDescription} hint="Shown on cards & quick view (max 300 chars)." className="sm:col-span-2">
                <Input id="shortDescription" name="shortDescription" maxLength={300} defaultValue={product?.shortDescription ?? ""} />
              </Field>
              <Field label="Description" htmlFor="description" error={fe.description} required className="sm:col-span-2">
                <Textarea id="description" name="description" defaultValue={product?.description ?? ""} className="min-h-[160px]" required />
              </Field>
            </div>
          </section>

          <section className="space-y-5 border border-line bg-white p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">Fragrance details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Fragrance type" htmlFor="fragranceType" hint="Eau de Parfum, Perfume Oil…"><Input id="fragranceType" name="fragranceType" defaultValue={product?.fragranceType ?? ""} /></Field>
              <Field label="Volume" htmlFor="volume" hint="e.g. 100ml"><Input id="volume" name="volume" defaultValue={product?.volume ?? ""} /></Field>
              <Field label="Top notes" htmlFor="topNotes"><Input id="topNotes" name="topNotes" defaultValue={product?.topNotes ?? ""} /></Field>
              <Field label="Heart notes" htmlFor="heartNotes"><Input id="heartNotes" name="heartNotes" defaultValue={product?.heartNotes ?? ""} /></Field>
              <Field label="Base notes" htmlFor="baseNotes"><Input id="baseNotes" name="baseNotes" defaultValue={product?.baseNotes ?? ""} /></Field>
              <Field label="Longevity" htmlFor="longevity" hint="e.g. 8 – 10 hours"><Input id="longevity" name="longevity" defaultValue={product?.longevity ?? ""} /></Field>
              <Field label="Occasion" htmlFor="occasion" className="sm:col-span-2"><Input id="occasion" name="occasion" defaultValue={product?.occasion ?? ""} /></Field>
            </div>
          </section>

          <section className="space-y-5 border border-line bg-white p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">Images & variants</h2>
            <Field label="Image URLs" htmlFor="images" error={fe.images} hint="One per line. First image is the main image. Upload files to your storage provider (see src/lib/storage.ts) and paste the URLs here.">
              <Textarea id="images" name="images" defaultValue={(product?.images ?? []).join("\n")} className="min-h-[100px] font-mono text-xs" placeholder="/images/products/women-1.jpg" />
            </Field>
            <Field label="Size variants" htmlFor="variants" error={fe.variants} hint="Optional. One per line: name | price | sale price | stock  →  e.g. 50ml | 26500 | | 20">
              <Textarea id="variants" name="variants" defaultValue={(product?.variants ?? []).map((v) => `${v.name} | ${v.price} | ${v.salePrice ?? ""} | ${v.stock}`).join("\n")} className="min-h-[80px] font-mono text-xs" placeholder="50ml | 26500 | | 20" />
            </Field>
          </section>

          <section className="space-y-5 border border-line bg-white p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">SEO</h2>
            <Field label="Meta title" htmlFor="metaTitle" error={fe.metaTitle}><Input id="metaTitle" name="metaTitle" maxLength={160} defaultValue={product?.metaTitle ?? ""} /></Field>
            <Field label="Meta description" htmlFor="metaDescription" error={fe.metaDescription}><Textarea id="metaDescription" name="metaDescription" maxLength={320} defaultValue={product?.metaDescription ?? ""} className="min-h-[72px]" /></Field>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-5 border border-line bg-white p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">Pricing & inventory (₦)</h2>
            <Field label="Regular price" htmlFor="price" error={fe.price} required><Input id="price" name="price" type="number" min={0} step={1} defaultValue={product?.price ?? ""} required /></Field>
            <Field label="Sale price" htmlFor="salePrice" error={fe.salePrice} hint="Leave empty or 0 for no discount."><Input id="salePrice" name="salePrice" type="number" min={0} step={1} defaultValue={product?.salePrice ?? ""} /></Field>
            <Field label="Stock" htmlFor="stock" error={fe.stock} required><Input id="stock" name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? 0} required /></Field>
          </section>

          <section className="space-y-4 border border-line bg-white p-5">
            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">Visibility</h2>
            <Checkbox name="isActive" label="Published (visible in store)" defaultChecked={product?.isActive ?? true} />
            <Checkbox name="isFeatured" label="Featured" defaultChecked={product?.isFeatured ?? false} />
            <Checkbox name="isBestSeller" label="Best seller" defaultChecked={product?.isBestSeller ?? false} />
            <Checkbox name="isNewArrival" label="New arrival" defaultChecked={product?.isNewArrival ?? false} />
          </section>

          <div className="flex flex-col gap-2">
            <Button type="submit" loading={pending} size="lg">
              {product ? "Save changes" : "Create product"}
            </Button>
            <Link href="/admin/products" className="text-center text-xs uppercase tracking-[0.16em] text-stone underline-offset-4 hover:underline">Cancel</Link>
            {product && (
              <Link href={`/product/${product.slug}`} target="_blank" className="text-center text-xs uppercase tracking-[0.16em] underline underline-offset-4">View in store</Link>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

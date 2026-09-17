"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FormMessage,
  Input,
  Select,
  Textarea,
} from "@/components/ui/form";
import {
  deleteProductAction,
  saveProductAction,
} from "@/lib/actions/admin";

type Category = {
  id: string;
  name: string;
};

type Variant = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  categoryId: string;
  brandName: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  images: string[];
  scentFamily: string | null;
  topNotes: string | null;
  heartNotes: string | null;
  baseNotes: string | null;
  gender: string | null;
  size: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  variants: Variant[];
};

type ProductFormProps = {
  product: Product | null;
  categories: Category[];
};

type FormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const initialState: FormState = {};

export function ProductForm({
  product,
  categories,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProductAction,
    initialState,
  );

  const [images, setImages] = useState<string[]>(
    product?.images ?? [],
  );

  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {product?.id && (
        <input
          type="hidden"
          name="id"
          value={product.id}
        />
      )}

      <section className="space-y-5 border border-line bg-white p-5">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
            Basics
          </h2>
          <p className="mt-1 text-sm text-stone">
            Core product information customers will see.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Product name"
            htmlFor="name"
            required
            error={fieldErrors.name}
          >
            <Input
              id="name"
              name="name"
              defaultValue={product?.name ?? ""}
              placeholder="e.g. Imperio Privé"
              required
            />
          </Field>

          <Field
            label="SKU"
            htmlFor="sku"
            required
            error={fieldErrors.sku}
          >
            <Input
              id="sku"
              name="sku"
              defaultValue={product?.sku ?? ""}
              placeholder="e.g. JIS-IMP-50"
              required
            />
          </Field>
        </div>

        <Field
          label="Description"
          htmlFor="description"
          required
          error={fieldErrors.description}
        >
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description ?? ""}
            className="min-h-[140px]"
            placeholder="Describe the fragrance and what makes it special."
            required
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Category"
            htmlFor="categoryId"
            required
            error={fieldErrors.categoryId}
          >
            <Select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId ?? ""}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Brand"
            htmlFor="brandName"
            error={fieldErrors.brandName}
          >
            <Input
              id="brandName"
              name="brandName"
              defaultValue={product?.brandName ?? ""}
              placeholder="e.g. JIS Beauty & Fashion"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-5 border border-line bg-white p-5">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
            Fragrance details
          </h2>
          <p className="mt-1 text-sm text-stone">
            Optional fragrance information for the product page.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Scent family"
            htmlFor="scentFamily"
            error={fieldErrors.scentFamily}
          >
            <Input
              id="scentFamily"
              name="scentFamily"
              defaultValue={product?.scentFamily ?? ""}
              placeholder="e.g. Woody, Floral, Fresh"
            />
          </Field>

          <Field
            label="Gender"
            htmlFor="gender"
            error={fieldErrors.gender}
          >
            <Select
              id="gender"
              name="gender"
              defaultValue={product?.gender ?? ""}
            >
              <option value="">Select</option>
              <option value="Women">Women</option>
              <option value="Men">Men</option>
              <option value="Unisex">Unisex</option>
              <option value="Kids">Kids</option>
            </Select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Top notes"
            htmlFor="topNotes"
            error={fieldErrors.topNotes}
          >
            <Textarea
              id="topNotes"
              name="topNotes"
              defaultValue={product?.topNotes ?? ""}
              placeholder="e.g. Bergamot, Lemon"
            />
          </Field>

          <Field
            label="Heart notes"
            htmlFor="heartNotes"
            error={fieldErrors.heartNotes}
          >
            <Textarea
              id="heartNotes"
              name="heartNotes"
              defaultValue={product?.heartNotes ?? ""}
              placeholder="e.g. Rose, Jasmine"
            />
          </Field>

          <Field
            label="Base notes"
            htmlFor="baseNotes"
            error={fieldErrors.baseNotes}
          >
            <Textarea
              id="baseNotes"
              name="baseNotes"
              defaultValue={product?.baseNotes ?? ""}
              placeholder="e.g. Amber, Musk"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-5 border border-line bg-white p-5">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
            Images & variants
          </h2>
          <p className="mt-1 text-sm text-stone">
            Upload product photos directly from your phone.
          </p>
        </div>

        <Field
          label="Product photos"
          error={fieldErrors.images}
          hint="The first image becomes the main product image."
        >
          <ImageUploader
            value={images}
            onChange={setImages}
          />
        </Field>

        <Field
          label="Size variants"
          htmlFor="variants"
          error={fieldErrors.variants}
          hint="One per line: name | price | sale price | stock"
        >
          <Textarea
            id="variants"
            name="variants"
            defaultValue={(product?.variants ?? [])
              .map(
                (variant) =>
                  `${variant.name} | ${variant.price} | ${
                    variant.salePrice ?? ""
                  } | ${variant.stock}`,
              )
              .join("\n")}
            className="min-h-[100px] font-mono text-xs"
            placeholder={`50ml | 26500 | | 20
100ml | 42000 | 38000 | 10`}
          />
        </Field>
      </section>

      <section className="space-y-5 border border-line bg-white p-5">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
            SEO
          </h2>
          <p className="mt-1 text-sm text-stone">
            Optional information used by search engines.
          </p>
        </div>

        <Field
          label="Meta title"
          htmlFor="metaTitle"
          error={fieldErrors.metaTitle}
        >
          <Input
            id="metaTitle"
            name="metaTitle"
            defaultValue={product?.metaTitle ?? ""}
            placeholder="Product name | JIS Beauty & Fashion"
          />
        </Field>

        <Field
          label="Meta description"
          htmlFor="metaDescription"
          error={fieldErrors.metaDescription}
        >
          <Textarea
            id="metaDescription"
            name="metaDescription"
            defaultValue={product?.metaDescription ?? ""}
            placeholder="Short description for search engines."
          />
        </Field>
      </section>

      <section className="space-y-5 border border-line bg-white p-5">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
            Pricing & inventory
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Price"
            htmlFor="price"
            required
            error={fieldErrors.price}
          >
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.price ?? ""}
              placeholder="26500"
              required
            />
          </Field>

          <Field
            label="Sale price"
            htmlFor="salePrice"
            error={fieldErrors.salePrice}
          >
            <Input
              id="salePrice"
              name="salePrice"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.salePrice ?? ""}
              placeholder="Optional"
            />
          </Field>

          <Field
            label="Stock"
            htmlFor="stock"
            required
            error={fieldErrors.stock}
          >
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.stock ?? 0}
              required
            />
          </Field>
        </div>

        <Field
          label="Default size"
          htmlFor="size"
          error={fieldErrors.size}
        >
          <Input
            id="size"
            name="size"
            defaultValue={product?.size ?? ""}
            placeholder="e.g. 50ml"
          />
        </Field>
      </section>

      <section className="space-y-5 border border-line bg-white p-5">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">
            Visibility
          </h2>
          <p className="mt-1 text-sm text-stone">
            Control how this product appears throughout the store.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Checkbox
            id="isActive"
            name="isActive"
            label="Published"
            defaultChecked={product?.isActive ?? true}
          />

          <Checkbox
            id="isFeatured"
            name="isFeatured"
            label="Featured product"
            defaultChecked={product?.isFeatured ?? false}
          />

          <Checkbox
            id="isBestSeller"
            name="isBestSeller"
            label="Best seller"
            defaultChecked={product?.isBestSeller ?? false}
          />

          <Checkbox
            id="isNewArrival"
            name="isNewArrival"
            label="New arrival"
            defaultChecked={product?.isNewArrival ?? false}
          />
        </div>
      </section>

      {state?.message && (
        <FormMessage
          tone={state.ok ? "success" : "error"}
        >
          {state.message}
        </FormMessage>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/products"
          className="inline-flex min-h-11 items-center justify-center border border-line px-5 text-xs font-medium uppercase tracking-[0.14em] hover:border-ink"
        >
          Cancel
        </Link>

        {product && (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              if (
                window.confirm(
                  `Delete "${product.name}"? This cannot be undone.`,
                )
              ) {
                const form = document.createElement("form");
                form.method = "POST";
                form.action = "/admin/products";
                form.submit();
              }
            }}
          >
            Delete
          </Button>
        )}

        <Button
          type="submit"
          disabled={pending}
        >
          {pending
            ? "Saving…"
            : product
              ? "Save product"
              : "Create product"}
        </Button>
      </div>
    </form>
  );
}
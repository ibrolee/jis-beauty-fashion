"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Textarea } from "@/components/ui/form-fields";
import type { Category } from "@/db/schema";
import { saveCategoryAction } from "@/lib/actions/admin";
import { initialActionState } from "@/types";

export function CategoryForm({ category }: { category: Category | null }) {
  const [state, action, pending] = useActionState(saveCategoryAction, initialActionState);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4 border border-line bg-white p-5" key={category?.id ?? "new"}>
      {category && <input type="hidden" name="id" value={category.id} />}
      <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-stone">{category ? `Edit ${category.name}` : "New category"}</h2>
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
      <Field label="Name" htmlFor="cat-name" error={fe.name} required><Input id="cat-name" name="name" defaultValue={category?.name ?? ""} required /></Field>
      <Field label="Slug" htmlFor="cat-slug" error={fe.slug} hint="URL: /shop/slug — leave blank to auto-generate"><Input id="cat-slug" name="slug" defaultValue={category?.slug ?? ""} /></Field>
      <Field label="Description" htmlFor="cat-description" error={fe.description}><Textarea id="cat-description" name="description" defaultValue={category?.description ?? ""} className="min-h-[80px]" /></Field>
      <Field label="Image URL" htmlFor="cat-image" error={fe.image}><Input id="cat-image" name="image" defaultValue={category?.image ?? ""} placeholder="/images/products/women-1.jpg" /></Field>
      <Field label="Sort order" htmlFor="cat-sort" error={fe.sortOrder}><Input id="cat-sort" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} /></Field>
      <Checkbox name="isActive" label="Visible in store" defaultChecked={category?.isActive ?? true} />
      <Button type="submit" loading={pending}>{category ? "Save category" : "Create category"}</Button>
    </form>
  );
}

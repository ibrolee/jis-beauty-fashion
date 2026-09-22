"use client";

import { useActionState, useState } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form-fields";
import { saveBlogPostAction } from "@/lib/actions/admin";
import type { BlogPost } from "@/lib/site-content";
import { initialActionState } from "@/types";

export function BlogPostForm({ post, categories }: { post?: BlogPost | null; categories: string[] }) {
  const [state, action, pending] = useActionState(saveBlogPostAction, initialActionState);
  const [images, setImages] = useState<string[]>(post?.image ? [post.image] : []);

  return (
    <form action={action} className="space-y-5 border border-line bg-white p-5">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <input type="hidden" name="image" value={images[0] ?? ""} />
      {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="blog-title" required className="sm:col-span-2">
          <Input id="blog-title" name="title" defaultValue={post?.title ?? ""} required />
        </Field>
        <Field label="Slug" htmlFor="blog-slug" hint="Leave blank to generate from title.">
          <Input id="blog-slug" name="slug" defaultValue={post?.slug ?? ""} />
        </Field>
        <Field label="Category" htmlFor="blog-category">
          <Select id="blog-category" name="category" defaultValue={post?.category ?? categories[0] ?? "Fragrance Tips"}>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            {!categories.length && <option value="Fragrance Tips">Fragrance Tips</option>}
          </Select>
        </Field>
      </div>

      <Field label="Cover picture" htmlFor="blog-image" hint="Upload one image or paste a URL below.">
        <ImageUploader value={images} onChange={setImages} name={null} maxImages={1} />
      </Field>
      <Field label="Image URL" htmlFor="blog-image-url">
        <Input id="blog-image-url" value={images[0] ?? ""} onChange={(event) => setImages(event.target.value ? [event.target.value] : [])} placeholder="/images/example.jpg or uploaded URL" />
      </Field>
      <Field label="Excerpt" htmlFor="blog-excerpt" required>
        <Textarea id="blog-excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} className="min-h-[82px]" required />
      </Field>
      <Field label="Body" htmlFor="blog-body" required hint="Separate paragraphs with blank lines.">
        <Textarea id="blog-body" name="body" defaultValue={post?.body ?? ""} className="min-h-[240px]" required />
      </Field>
      <Checkbox name="published" label="Publish this post" defaultChecked={post?.published ?? true} />
      <Button type="submit" loading={pending} size="sm">{post ? "Save post" : "Create post"}</Button>
    </form>
  );
}

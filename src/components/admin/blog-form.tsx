"use client";

import { useActionState, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form-fields";
import { saveBlogPostAction } from "@/lib/actions/admin";
import type { BlogPost } from "@/lib/site-content";
import { initialActionState } from "@/types";

type GeneratedBlog = {
  title: string;
  category: string;
  excerpt: string;
  body: string;
  image: string;
};

export function BlogPostForm({ post, categories }: { post?: BlogPost | null; categories: string[] }) {
  const [state, action, pending] = useActionState(saveBlogPostAction, initialActionState);
  const fallbackCategory = categories[0] ?? "Fragrance Tips";

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState(post?.category ?? fallbackCategory);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [images, setImages] = useState<string[]>(post?.image ? [post.image] : []);

  const [topic, setTopic] = useState("");
  const [aiCategory, setAiCategory] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationMessage, setGenerationMessage] = useState("");

  useEffect(() => {
    setTitle(post?.title ?? "");
    setSlug(post?.slug ?? "");
    setCategory(post?.category ?? fallbackCategory);
    setExcerpt(post?.excerpt ?? "");
    setBody(post?.body ?? "");
    setImages(post?.image ? [post.image] : []);
    setTopic("");
    setAiCategory("");
    setGenerationError("");
    setGenerationMessage("");
  }, [post?.id, fallbackCategory]);

  async function generateBlog() {
    if (generating) return;

    setGenerating(true);
    setGenerationError("");
    setGenerationMessage("");

    try {
      const response = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          topic: topic.trim() || undefined,
          category: aiCategory || undefined,
        }),
      });

      const data = (await response.json().catch(() => null)) as (GeneratedBlog & { error?: string }) | null;

      if (!response.ok || !data) {
        throw new Error(data?.error ?? "Could not generate the blog post.");
      }

      if (!data.title || !data.category || !data.excerpt || !data.body || !data.image) {
        throw new Error("The generator returned an incomplete draft. Please try again.");
      }

      setTitle(data.title);
      if (!post) setSlug("");
      setCategory(data.category);
      setExcerpt(data.excerpt);
      setBody(data.body);
      setImages([data.image]);
      setAiCategory(data.category);
      setGenerationMessage("AI draft and cover image generated. Review everything below before saving or publishing.");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Could not generate the blog post.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <form action={action} className="min-w-0 max-w-full space-y-5 overflow-hidden border border-line bg-white p-4 sm:p-5">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <input type="hidden" name="image" value={images[0] ?? ""} />

      <div className="min-w-0 max-w-full border border-line bg-ivory/60 p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">AI blog generator</p>
            <p className="mt-1 text-xs leading-5 text-stone">
              Generate a complete JIS article and matching cover image. Nothing is published until you save the form.
            </p>
          </div>
        </div>

        <div className="mt-4 min-w-0 max-w-full space-y-3">
          <Field label="Topic (optional)" htmlFor="blog-ai-topic" hint="Leave blank and JIS will choose a fresh topic automatically.">
            <Input
              id="blog-ai-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. How to make perfume last longer in hot weather"
              maxLength={180}
              disabled={generating}
            />
          </Field>

          <Field label="Category (optional)" htmlFor="blog-ai-category">
            <Select
              id="blog-ai-category"
              value={aiCategory}
              onChange={(event) => setAiCategory(event.target.value)}
              disabled={generating}
            >
              <option value="">Choose automatically</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          </Field>

          <Button type="button" variant="secondary" size="sm" loading={generating} onClick={() => void generateBlog()} className="w-full max-w-full">
            {!generating && <Sparkles className="h-4 w-4" aria-hidden />}
            {post ? "Regenerate with AI" : "Generate blog + image"}
          </Button>

          <p className="text-[11px] leading-5 text-stone">
            Article generation uses a free Vercel AI model. The matching JIS cover is generated automatically and everything stays editable before you save it.
          </p>
        </div>
      </div>

      {generationMessage && <FormMessage type="success">{generationMessage}</FormMessage>}
      {generationError && <FormMessage type="error">{generationError}</FormMessage>}
      {state.ok && <FormMessage type="success">{state.message}</FormMessage>}
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="blog-title" required className="sm:col-span-2">
          <Input id="blog-title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </Field>
        <Field label="Slug" htmlFor="blog-slug" hint="Leave blank to generate from title.">
          <Input id="blog-slug" name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
        </Field>
        <Field label="Category" htmlFor="blog-category">
          <Select id="blog-category" name="category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            {!categories.length && <option value="Fragrance Tips">Fragrance Tips</option>}
          </Select>
        </Field>
      </div>

      <Field label="Cover picture" htmlFor="blog-image" hint="Upload one image, paste a URL, or use the AI generator above.">
        <ImageUploader value={images} onChange={setImages} name={null} maxImages={1} />
      </Field>
      <Field label="Image URL" htmlFor="blog-image-url">
        <Input
          id="blog-image-url"
          value={images[0] ?? ""}
          onChange={(event) => setImages(event.target.value ? [event.target.value] : [])}
          placeholder="/images/example.jpg or uploaded URL"
        />
      </Field>
      <Field label="Excerpt" htmlFor="blog-excerpt" required>
        <Textarea id="blog-excerpt" name="excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} className="min-h-[82px]" required />
      </Field>
      <Field label="Body" htmlFor="blog-body" required hint="Separate paragraphs with blank lines.">
        <Textarea id="blog-body" name="body" value={body} onChange={(event) => setBody(event.target.value)} className="min-h-[360px]" required />
      </Field>
      <Checkbox name="published" label="Publish this post" defaultChecked={post?.published ?? true} />
      <Button type="submit" loading={pending} size="sm">{post ? "Save post" : "Create post"}</Button>
    </form>
  );
}

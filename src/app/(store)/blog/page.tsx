import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogContent, sortedBlogPosts } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Fragrance tips, beauty notes and JIS Beauty & Fashion updates.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category }, blog] = await Promise.all([searchParams, getBlogContent()]);
  const posts = sortedBlogPosts(blog.posts).filter((post) => !category || post.category === category);

  return (
    <div className="pb-20 lg:pb-28">
      <header className="border-b border-line bg-ivory py-16 sm:py-20 lg:py-24">
        <div className="container-x grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5">JIS / Blog</p>
            <h1 className="font-serif text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-[clamp(5rem,7vw,8rem)]">The fragrance <span className="italic text-rosewood">journal.</span></h1>
          </div>
          <p className="max-w-md text-base leading-[1.9] text-ink-soft lg:col-span-4">{blog.intro}</p>
        </div>
      </header>

      <div className="container-x mt-10">
        <div className="flex flex-wrap gap-2">
          <Link href="/blog" className={`border px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] ${!category ? "border-ink bg-ink text-white" : "border-line"}`}>All</Link>
          {blog.categories.map((item) => (
            <Link key={item} href={`/blog?category=${encodeURIComponent(item)}`} className={`border px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] ${category === item ? "border-ink bg-ink text-white" : "border-line"}`}>{item}</Link>
          ))}
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-line pb-8">
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                  {post.image ? <Image src={post.image} alt={post.title} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center p-6 text-center font-serif text-4xl text-stone">{post.category}</div>}
                </div>
                <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-rosewood">{post.category} · {formatDate(new Date(post.createdAt))}</p>
                <h2 className="mt-3 font-serif text-3xl leading-tight text-ink group-hover:text-rosewood">{post.title}</h2>
                <p className="mt-3 text-sm leading-7 text-stone">{post.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em]">Read post <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
              </Link>
            </article>
          ))}
          {!posts.length && <p className="text-sm text-stone">No blog posts published yet.</p>}
        </div>
      </div>
    </div>
  );
}

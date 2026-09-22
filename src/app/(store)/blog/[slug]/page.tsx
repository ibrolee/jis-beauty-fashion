import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCommentForm, BlogLikeButton } from "@/components/blog/blog-engagement";
import { getCurrentUser } from "@/lib/auth/session";
import { getBlogContent, getBlogPost, sortedBlogPosts } from "@/lib/data/blog";
import { absoluteUrl, formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Blog post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: "article", images: post.image ? [{ url: absoluteUrl(post.image), alt: post.title }] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [blog, user] = await Promise.all([getBlogContent(), getCurrentUser()]);
  const post = blog.posts.find((item) => item.slug === slug && item.published);
  if (!post) notFound();

  const comments = blog.comments.filter((comment) => comment.postSlug === post.slug).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const likedBy = blog.likes[post.slug] ?? [];
  const liked = user ? likedBy.includes(user.id) : false;
  const related = sortedBlogPosts(blog.posts).filter((item) => item.slug !== post.slug).slice(0, 3);
  const paragraphs = post.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <article className="pb-20 lg:pb-28">
      <header className="border-b border-line bg-ivory py-10 lg:py-16">
        <div className="container-x">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-stone hover:text-ink"><ChevronLeft className="h-4 w-4" /> Blog</Link>
          <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.2em] text-rosewood">{post.category} · {formatDate(new Date(post.createdAt))}</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-[clamp(5rem,7vw,8rem)]">{post.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.9] text-ink-soft">{post.excerpt}</p>
        </div>
      </header>

      {post.image && (
        <div className="container-x mt-10">
          <div className="relative aspect-[16/9] overflow-hidden bg-ivory">
            <Image src={post.image} alt={post.title} fill sizes="100vw" className="object-cover" priority />
          </div>
        </div>
      )}

      <div className="container-x mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <div className="prose prose-stone max-w-none text-[17px] leading-9 text-ink-soft">
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>

          <div className="mt-12 border-y border-line py-6">
            <BlogLikeButton slug={post.slug} liked={liked} count={likedBy.length} disabled={!user} />
          </div>

          <section className="mt-12" aria-labelledby="comments-heading">
            <h2 id="comments-heading" className="font-serif text-4xl">Comments</h2>
            <div className="mt-5"><BlogCommentForm slug={post.slug} disabled={!user} /></div>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {comments.map((comment) => (
                <div key={comment.id} className="py-5">
                  <p className="text-sm font-medium text-ink">{comment.name}</p>
                  <p className="mt-1 text-xs text-stone">{formatDate(new Date(comment.createdAt), { hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="mt-3 text-sm leading-7 text-ink-soft">{comment.body}</p>
                </div>
              ))}
              {!comments.length && <p className="py-5 text-sm text-stone">No comments yet.</p>}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-36 border border-line bg-cream p-6">
            <p className="eyebrow mb-4">More from JIS</p>
            <div className="space-y-5">
              {related.map((item) => (
                <Link key={item.id} href={`/blog/${item.slug}`} className="block border-b border-line pb-4 last:border-0 last:pb-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-rosewood">{item.category}</p>
                  <h3 className="mt-2 font-serif text-2xl leading-tight hover:text-rosewood">{item.title}</h3>
                </Link>
              ))}
              {!related.length && <p className="text-sm text-stone">More posts will appear here.</p>}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

import Link from "next/link";
import { BlogPostForm } from "@/components/admin/blog-form";
import { ActionButton, AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { deleteBlogPostAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/session";
import { getBlogContent, sortedBlogPosts } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Blog" };

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requireAdmin();
  const [{ edit }, blog] = await Promise.all([searchParams, getBlogContent()]);
  const posts = sortedBlogPosts(blog.posts, true);
  const editing = edit ? posts.find((post) => post.id === edit) ?? null : null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Blog"
        description="Create fragrance tips, guides and updates for the storefront blog."
        actions={editing ? <Link href="/admin/blog" className="text-xs uppercase tracking-[0.16em] underline underline-offset-4">New post</Link> : undefined}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <Table>
            <thead><tr><th className={th}>Post</th><th className={th}>Category</th><th className={th}>Status</th><th className={th}>Updated</th><th className={th}>Actions</th></tr></thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className={td}>
                    <Link href={`/blog/${post.slug}`} className="font-medium underline-offset-4 hover:underline">{post.title}</Link>
                    <p className="mt-1 line-clamp-2 text-xs text-stone">{post.excerpt}</p>
                  </td>
                  <td className={td}>{post.category}</td>
                  <td className={td}>{post.published ? "Published" : "Draft"}</td>
                  <td className={td}>{formatDate(new Date(post.updatedAt))}</td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/blog?edit=${post.id}`} className="inline-flex h-8 items-center border border-line px-2.5 text-[11px] font-medium uppercase tracking-[0.12em] hover:border-ink">Edit</Link>
                      <ActionButton action={deleteBlogPostAction.bind(null, post.id)} confirmMessage={`Delete "${post.title}"?`} tone="danger">Delete</ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
              {!posts.length && <tr><td className={td} colSpan={5}>No blog posts yet.</td></tr>}
            </tbody>
          </Table>
        </section>

        <aside>
          <BlogPostForm post={editing} categories={blog.categories} />
        </aside>
      </div>
    </div>
  );
}

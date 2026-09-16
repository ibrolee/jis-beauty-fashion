import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { ActionButton, AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { deleteReviewAction, setReviewStatusAction } from "@/lib/actions/admin";
import { getAllReviewsAdmin } from "@/lib/data/reviews";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const reviews = await getAllReviewsAdmin();
  return (
    <div>
      <AdminPageHeader title="Reviews" description="Hide inappropriate reviews or remove them entirely. Ratings recalculate automatically." />
      <Table>
        <thead>
          <tr>
            <th className={th}>Product</th>
            <th className={th}>Rating</th>
            <th className={th}>Review</th>
            <th className={th}>Customer</th>
            <th className={th}>Status</th>
            <th className={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className={r.status === "hidden" ? "opacity-60" : ""}>
              <td className={td}><Link href={`/product/${r.product.slug}`} className="underline-offset-4 hover:underline">{r.product.name}</Link></td>
              <td className={td}><RatingStars rating={r.rating} size="xs" /></td>
              <td className={`${td} max-w-sm`}>
                {r.title && <p className="font-medium">{r.title}</p>}
                <p className="line-clamp-2 text-xs text-ink-soft">{r.comment}</p>
                <p className="mt-1 text-[11px] text-stone">{formatDate(r.createdAt)}</p>
              </td>
              <td className={td}>
                <p>{r.user.firstName} {r.user.lastName}</p>
                <p className="text-xs text-stone">{r.user.email}</p>
              </td>
              <td className={td}>{r.status === "published" ? <Badge tone="success">Published</Badge> : <Badge>Hidden</Badge>}</td>
              <td className={td}>
                <div className="flex gap-1.5">
                  <ActionButton action={setReviewStatusAction.bind(null, r.id, r.status === "published" ? "hidden" : "published")}>{r.status === "published" ? "Hide" : "Publish"}</ActionButton>
                  <ActionButton tone="danger" confirmMessage="Delete this review?" action={deleteReviewAction.bind(null, r.id)}>Delete</ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

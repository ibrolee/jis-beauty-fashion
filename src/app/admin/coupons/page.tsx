import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { CouponForm } from "@/components/admin/coupon-form";
import { ActionButton, AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { deleteCouponAction, toggleCouponAction } from "@/lib/actions/admin";
import { describeCoupon, isCouponExpired } from "@/lib/coupons";
import { getAllCoupons } from "@/lib/data/coupons";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const { edit } = await searchParams;
  const coupons = await getAllCoupons();
  const editing = edit ? coupons.find((c) => c.id === Number(edit)) ?? null : null;

  return (
    <div>
      <AdminPageHeader title="Coupons" description="Percentage or fixed discounts with limits and expiry." actions={editing ? <Link href="/admin/coupons" className="text-xs uppercase tracking-[0.16em] underline underline-offset-4">New coupon</Link> : undefined} />
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Table>
            <thead>
              <tr>
                <th className={th}>Code</th>
                <th className={th}>Discount</th>
                <th className={th}>Usage</th>
                <th className={th}>Expires</th>
                <th className={th}>Status</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const expired = isCouponExpired(c);
                return (
                  <tr key={c.id}>
                    <td className={td}>
                      <p className="font-medium tracking-wider">{c.code}</p>
                      {c.description && <p className="text-xs text-stone">{c.description}</p>}
                    </td>
                    <td className={td}>{describeCoupon(c)}</td>
                    <td className={td}>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                    <td className={td}>{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</td>
                    <td className={td}>{expired ? <Badge tone="danger">Expired</Badge> : c.isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}</td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1.5">
                        <Link href={`/admin/coupons?edit=${c.id}`} className="inline-flex h-8 items-center border border-line px-2.5 text-[11px] font-medium uppercase tracking-[0.12em] hover:border-ink">Edit</Link>
                        <ActionButton action={toggleCouponAction.bind(null, c.id, !c.isActive)}>{c.isActive ? "Deactivate" : "Activate"}</ActionButton>
                        <ActionButton tone="danger" confirmMessage={`Delete coupon ${c.code}?`} action={deleteCouponAction.bind(null, c.id)}>Delete</ActionButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
        <div>
          <CouponForm coupon={editing} />
        </div>
      </div>
    </div>
  );
}

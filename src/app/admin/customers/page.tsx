import { requireAdmin } from "@/lib/auth/session";
import { AdminPageHeader, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { getCustomersAdmin } from "@/lib/data/users";
import { formatDate, formatNaira } from "@/lib/utils";

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const customers = await getCustomersAdmin();
  return (
    <div>
      <AdminPageHeader title="Customers" description={`${customers.length} registered account${customers.length === 1 ? "" : "s"}`} />
      <Table>
        <thead>
          <tr>
            <th className={th}>Customer</th>
            <th className={th}>Contact</th>
            <th className={th}>Orders</th>
            <th className={th}>Total spent</th>
            <th className={th}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td className={td}>
                <p className="font-medium">{c.firstName} {c.lastName} {c.role === "admin" && <Badge tone="new" className="ml-1">Admin</Badge>}</p>
              </td>
              <td className={td}>
                <p>{c.email}</p>
                {c.phone && <p className="text-xs text-stone">{c.phone}</p>}
              </td>
              <td className={td}>{c.orderCount}</td>
              <td className={`${td} tabular-nums`}>{formatNaira(Number(c.totalSpent ?? 0))}</td>
              <td className={td}>{formatDate(c.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

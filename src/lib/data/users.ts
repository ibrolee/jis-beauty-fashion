import { asc, count, desc, eq, sum } from "drizzle-orm";
import { db } from "@/db";
import { addresses, orders, users, type Address } from "@/db/schema";

export async function getUserAddresses(userId: number): Promise<Address[]> {
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), asc(addresses.createdAt));
}

export async function getDefaultAddress(userId: number): Promise<Address | undefined> {
  const list = await getUserAddresses(userId);
  return list.find((a) => a.isDefault) ?? list[0];
}

export async function getCustomersAdmin() {
  return db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
      orderCount: count(orders.id),
      totalSpent: sum(orders.total),
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(500);
}

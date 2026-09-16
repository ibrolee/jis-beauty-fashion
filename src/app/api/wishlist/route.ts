import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { wishlists } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

async function idsFor(userId: number) {
  const rows = await db.select({ productId: wishlists.productId }).from(wishlists).where(eq(wishlists.userId, userId));
  return rows.map((r) => r.productId);
}

/** GET — current user's wishlist product ids */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ids: [] }, { status: 401 });
  return NextResponse.json({ ids: await idsFor(user.id) });
}

/** PUT — merge local (guest) ids into the account wishlist, returns the union */
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
  const ids = Array.isArray(body.ids) ? body.ids.filter((n): n is number => Number.isInteger(n) && n > 0).slice(0, 200) : [];
  if (ids.length) {
    await db
      .insert(wishlists)
      .values(ids.map((productId) => ({ userId: user.id, productId })))
      .onConflictDoNothing();
  }
  return NextResponse.json({ ids: await idsFor(user.id) });
}

/** POST — add a product */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = (await request.json().catch(() => ({}))) as { productId?: number };
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  await db.insert(wishlists).values({ userId: user.id, productId }).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}

/** DELETE — remove a product */
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = (await request.json().catch(() => ({}))) as { productId?: number };
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  await db.delete(wishlists).where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)));
  return NextResponse.json({ ok: true });
}

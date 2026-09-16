import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCouponCode } from "@/lib/data/coupons";

const schema = z.object({ code: z.string().trim().min(1).max(40), subtotal: z.number().min(0) });

/** POST /api/coupons/validate — used by the cart to preview a coupon. Re-validated at checkout. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ valid: false, reason: "Enter a coupon code." }, { status: 400 });

  const result = await validateCouponCode(parsed.data.code, parsed.data.subtotal);
  if (!result.valid) return NextResponse.json({ valid: false, reason: result.reason });
  return NextResponse.json({ valid: true, coupon: result.coupon, discount: result.discount });
}

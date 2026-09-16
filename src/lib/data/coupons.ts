import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons, type Coupon } from "@/db/schema";
import { calculateCouponDiscount } from "@/lib/coupons";
import type { AppliedCoupon } from "@/types";

export type CouponValidation =
  | { valid: true; coupon: AppliedCoupon; discount: number; couponId: number }
  | { valid: false; reason: string };

export async function findCouponByCode(code: string): Promise<Coupon | undefined> {
  return db.query.coupons.findFirst({ where: eq(coupons.code, code.trim().toUpperCase()) });
}

/** Full server-side validation of a coupon against an order subtotal (₦). */
export async function validateCouponCode(code: string, subtotal: number): Promise<CouponValidation> {
  const coupon = await findCouponByCode(code);
  if (!coupon) return { valid: false, reason: "That coupon code doesn't exist." };
  if (!coupon.isActive) return { valid: false, reason: "This coupon is no longer active." };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { valid: false, reason: "This coupon has expired." };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: "This coupon has reached its usage limit." };
  }
  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      reason: `This coupon requires a minimum order of ₦${coupon.minOrderAmount.toLocaleString("en-NG")}.`,
    };
  }

  const applied: AppliedCoupon = {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minOrderAmount: coupon.minOrderAmount,
    maxDiscount: coupon.maxDiscount,
  };
  const discount = calculateCouponDiscount(applied, subtotal);
  if (discount <= 0) return { valid: false, reason: "This coupon doesn't apply to your cart." };

  return { valid: true, coupon: applied, discount, couponId: coupon.id };
}

export async function getAllCoupons(): Promise<Coupon[]> {
  return db.query.coupons.findMany({ orderBy: (c, { desc }) => [desc(c.createdAt)] });
}

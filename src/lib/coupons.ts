import type { AppliedCoupon } from "@/types";

/**
 * Pure coupon maths shared by the cart (client) and checkout (server).
 * Server-side validation in src/lib/data/coupons.ts always re-runs this.
 */
export function calculateCouponDiscount(coupon: AppliedCoupon, subtotal: number): number {
  if (subtotal <= 0) return 0;
  if (subtotal < coupon.minOrderAmount) return 0;

  let discount = coupon.type === "percentage" ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount && coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  return Math.max(0, Math.min(discount, subtotal));
}

export function isCouponExpired(coupon: { expiresAt: Date | null }): boolean {
  return coupon.expiresAt ? coupon.expiresAt.getTime() < Date.now() : false;
}

export function describeCoupon(coupon: AppliedCoupon): string {
  const base = coupon.type === "percentage" ? `${coupon.value}% off` : `₦${coupon.value.toLocaleString("en-NG")} off`;
  const parts = [base];
  if (coupon.minOrderAmount > 0) parts.push(`orders above ₦${coupon.minOrderAmount.toLocaleString("en-NG")}`);
  if (coupon.maxDiscount) parts.push(`(max ₦${coupon.maxDiscount.toLocaleString("en-NG")})`);
  return parts.join(" ");
}

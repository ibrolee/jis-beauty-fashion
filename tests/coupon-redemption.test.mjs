import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const checkout = readFileSync(new URL("../src/lib/actions/checkout.ts", import.meta.url), "utf8");
const cancellation = readFileSync(new URL("../src/lib/orders/reservations.ts", import.meta.url), "utf8");

test("coupon redemption is conditional inside the stock-reservation transaction", () => {
  const transactionStart = checkout.indexOf("await db.transaction(async (tx) => {");
  const couponStart = checkout.indexOf("if (couponId) {", transactionStart);
  const paymentInsert = checkout.indexOf("await tx.insert(payments)", couponStart);
  assert.ok(transactionStart !== -1 && couponStart > transactionStart && paymentInsert > couponStart);
  const guard = checkout.slice(couponStart, paymentInsert);
  assert.match(guard, /tx\.update\(coupons\)/);
  assert.match(guard, /eq\(coupons\.isActive, true\)/);
  assert.match(guard, /or\(isNull\(coupons\.usageLimit\), lt\(coupons\.usedCount, coupons\.usageLimit\)\)/);
  assert.match(guard, /or\(isNull\(coupons\.expiresAt\), gt\(coupons\.expiresAt, new Date\(\)\)\)/);
  assert.match(guard, /lte\(coupons\.minOrderAmount, subtotal\)/);
  assert.match(guard, /if \(!reservedCoupon\) throw new Error\("COUPON_UNAVAILABLE"\)/);
  assert.match(checkout, /error\.message === "COUPON_UNAVAILABLE"/);
});

test("failed coupon reservation does not create a pending payment outside the transaction", () => {
  const transactionStart = checkout.indexOf("await db.transaction(async (tx) => {");
  const couponStart = checkout.indexOf("if (couponId) {", transactionStart);
  const failure = checkout.indexOf('throw new Error("COUPON_UNAVAILABLE")', couponStart);
  const paymentInsert = checkout.indexOf("await tx.insert(payments)", failure);
  const transactionEnd = checkout.indexOf("\n    });", paymentInsert);
  assert.ok(transactionStart >= 0 && failure > couponStart && paymentInsert > failure && transactionEnd > paymentInsert);
  assert.match(cancellation, /usedCount: sql`greatest\(0, \$\{coupons\.usedCount\} - 1\)`/);
});

// These are source-level regression checks only. A separate, isolated database test
// must prove concurrent checkouts, rollback and exact-once restoration before launch.

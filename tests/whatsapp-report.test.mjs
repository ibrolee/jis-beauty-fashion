import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const action = read("../src/lib/actions/transfer-confirmation.ts");
const expiry = read("../src/lib/orders/reservations.ts");
const page = read("../src/app/(store)/order/[orderNumber]/page.tsx");
const checkout = read("../src/components/checkout/checkout-form.tsx");
const component = read("../src/components/orders/transfer-submission-button.tsx");
const whatsapp = read("../src/lib/orders/whatsapp-checkout.ts");
const policies = read("../src/content/policies.ts");

// Source-level guards only. Concurrent report/cancellation and bank verification
// still require isolated database and manual admin tests before full sign-off.
test("both checkout channels offer a payment report; no historical methods are offered", () => {
  assert.match(checkout, /type CheckoutPayment = "whatsapp" \| "bank_transfer"/);
  assert.match(page, /\(websiteTransfer \|\| whatsappCheckout\) && \(/);
  assert.match(page, /channel=\{whatsappCheckout \? "whatsapp" : "bank_transfer"\}/);
  assert.match(component, /I have paid — request verification/);
  assert.match(whatsapp, /After I transfer, I will open my order details link/);
});

test("report locks a pending order before recording claim and preserves original channel", () => {
  const lock = action.indexOf("await tx.update(orders)");
  const paymentUpdate = action.indexOf("await tx.update(payments)");
  assert.ok(lock >= 0 && paymentUpdate > lock);
  assert.match(action, /eq\(orders\.status, "pending"\)/);
  assert.match(action, /eq\(orders\.paymentStatus, "pending"\)/);
  assert.match(action, /channel: latest\.channel \?\? "bank_transfer"/);
  assert.match(action, /transferReportedAt: new Date\(\)\.toISOString\(\)/);
  assert.doesNotMatch(action, /paymentStatus:\s*"paid"|status:\s*"paid"/);
  assert.doesNotMatch(action, /latest\.channel === "whatsapp"\) \{/);
});

test("expiration excludes all reported manual payments and rechecks in cancellation", () => {
  assert.match(expiry, /transferReportedAt' IS NOT NULL/);
  assert.match(expiry, /eq\(payments\.channel, "transfer_submitted"\)/);
  assert.ok((expiry.match(/hasNoReportedTransfer\(\)/g) ?? []).length >= 3);
  assert.match(expiry, /lte\(orders\.createdAt, cutoff\)/);
  assert.match(expiry, /if \(!cancelled\) return false/);
});

test("both customer-facing policies promise review, not automatic payment confirmation", () => {
  assert.match(policies, /reported payment keeps your order reserved for manual bank verification/);
  assert.match(policies, /Reporting payment is not proof of receipt/);
  assert.match(page, /Payment is still pending until we check our bank account/);
  assert.match(component, /does not confirm it/);
});

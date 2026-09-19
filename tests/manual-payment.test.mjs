import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");

/** Execute actual pure TypeScript functions without a DB, network, or customer data. */
function loadModule(relativePath, dependencies = {}) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, Date,
    require: (name) => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected dependency in isolated test: ${name}`);
    },
  }, { filename: relativePath, timeout: 2000 });
  return module.exports;
}

const review = loadModule("../src/lib/orders/payment-review.ts");
const reservations = loadModule("../src/lib/orders/reservations.ts", {
  "drizzle-orm": {}, "@/db": {}, "@/db/schema": {},
});
const checkoutMessage = loadModule("../src/lib/orders/whatsapp-checkout.ts", {
  "@/lib/utils": {
    formatNaira: (amount) => `₦${amount.toLocaleString("en-NG")}`,
    absoluteUrl: (path) => `https://jis-beauty-fashion.vercel.app${path}`,
  },
}).whatsappCheckoutMessage;

const websitePayment = { provider: "manual", channel: "bank_transfer", metadata: null };
const whatsappPayment = { provider: "manual", channel: "whatsapp", metadata: null };

test("separates WhatsApp from on-site bank transfer without changing the database enum", () => {
  assert.equal(review.manualCheckoutChannel("bank_transfer", [websitePayment]), "website_transfer");
  assert.equal(review.manualCheckoutChannel("bank_transfer", [whatsappPayment]), "whatsapp");
  assert.equal(review.manualCheckoutChannel("bank_transfer", [{ ...whatsappPayment, metadata: { transferReportedAt: "2026-09-19T01:00:00Z" } }]), "whatsapp");
  assert.equal(review.manualCheckoutChannel("paystack", [whatsappPayment]), null);
  assert.equal(review.manualCheckoutChannel("pay_on_delivery", []), null);
  assert.equal(review.manualCheckoutChannel("bank_transfer", []), "website_transfer");
});

test("a report is not inferred from merely choosing WhatsApp or bank transfer", () => {
  assert.equal(review.isTransferReported(websitePayment), false);
  assert.equal(review.isTransferReported(whatsappPayment), false);
  assert.equal(review.isTransferReported({ ...websitePayment, metadata: { transferReportedAt: "2026-09-19T01:00:00Z" } }), true);
  assert.equal(review.isTransferReported({ ...websitePayment, channel: "transfer_submitted" }), true);
  assert.equal(review.isTransferReported({ ...websitePayment, metadata: { transferReportedAt: 0 } }), false);
});

test("preparation and dispatch remain blocked until payment is paid", () => {
  for (const state of ["payment_confirmed", "processing", "shipped", "delivered"]) {
    assert.equal(review.isFulfillmentTransitionAllowed(state, "pending"), false, state);
    assert.equal(review.isFulfillmentTransitionAllowed(state, "failed"), false, state);
    assert.equal(review.isFulfillmentTransitionAllowed(state, "paid"), true, state);
  }
  assert.equal(review.isFulfillmentTransitionAllowed("pending", "pending"), true);
  assert.equal(review.isFulfillmentTransitionAllowed("cancelled", "pending"), true);
});

test("bank transfer reservation deadline is exactly six hours after creation", () => {
  const created = new Date("2026-09-19T01:45:00.000Z");
  const deadline = reservations.bankTransferDeadline(created);
  assert.equal(reservations.BANK_TRANSFER_RESERVATION_HOURS, 6);
  assert.equal(deadline.toISOString(), "2026-09-19T07:45:00.000Z");
  assert.equal(created.toISOString(), "2026-09-19T01:45:00.000Z");
});

test("WhatsApp request includes product links, quantities, reference and grand total", () => {
  const text = checkoutMessage({
    orderNumber: "JIS-0123456789ABCDEF0123456789ABCDEF", total: 18000,
    items: [
      { name: "Dove Cucumber", quantity: 2, unitPrice: 6000, productSlug: "dove-cucumber", variantName: null },
      { name: "Perfume", quantity: 1, unitPrice: 3500, productSlug: "perfume", variantName: "Merlot" },
    ],
  });
  assert.match(text, /send me your bank account details/i);
  assert.match(text, /Order reference: JIS-0123456789ABCDEF0123456789ABCDEF/);
  assert.match(text, /Dove Cucumber.*2.*₦12,000/);
  assert.match(text, /Perfume \(Merlot\).*₦3,500/);
  assert.match(text, /https:\/\/jis-beauty-fashion\.vercel\.app\/product\/dove-cucumber/);
  assert.match(text, /https:\/\/jis-beauty-fashion\.vercel\.app\/product\/perfume/);
  assert.match(text, /Total to pay: ₦18,000/);
  assert.match(text, /\/order\/JIS-0123456789ABCDEF0123456789ABCDEF/);
});

test("source contracts retain pending payment, report protection and authenticated expiry", () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  const checkout = read("../src/lib/actions/checkout.ts");
  const report = read("../src/lib/actions/transfer-confirmation.ts");
  const expiry = read("../src/lib/orders/reservations.ts");
  const cron = read("../src/app/api/cron/expire-bank-transfers/route.ts");
  const adminForm = read("../src/components/admin/order-status-form.tsx");
  const vercel = JSON.parse(read("../vercel.json"));
  assert.ok(/paymentMethod: "bank_transfer", paymentStatus: "pending", status: "pending"/.test(checkout), "new orders must start unpaid");
  assert.ok(/channel: input\.paymentMethod === "whatsapp" \? "whatsapp" : "bank_transfer"/.test(checkout), "checkout channel must be preserved");
  assert.ok(/metadata: \{[\s\S]*?transferReportedAt:/.test(report), "customer report must be metadata only");
  assert.ok(/eq\(orders\.paymentStatus, "pending"\)/.test(report), "report requires an unpaid order");
  assert.ok((expiry.match(/hasNoReportedTransfer\(\)/g) ?? []).length >= 3, "both expiry checks must exclude reports");
  assert.ok(/lte\(orders\.createdAt, cutoff\)/.test(expiry), "expiry must enforce age");
  assert.ok(/request\.headers\.get\("authorization"\) !== `Bearer \$\{secret\}`/.test(cron), "cron must require secret");
  assert.ok(adminForm.includes("updateVerifiedOrderAction"), "admin form must call guarded action");
  assert.equal(vercel.buildCommand, "npm run build");
  assert.equal(vercel.git.deploymentEnabled["launch-prep-no-deploy"], false);
});

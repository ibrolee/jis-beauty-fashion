import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const source = read("../src/lib/constants.ts");
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const sandboxModule = { exports: {} };
vm.runInNewContext(js, { module: sandboxModule, exports: sandboxModule.exports, require: () => { throw Error("No imports expected"); } }, { timeout: 2000 });
const { DELIVERY, getDeliveryFee } = sandboxModule.exports;

test("free interstate shipping starts at a ₦50,000 product subtotal", () => {
  assert.equal(DELIVERY.interstateFreeDeliveryThreshold, 50_000);
  for (const state of ["FCT - Abuja", "Ogun", "Oyo", "Rivers", "Kano", "Abia"]) {
    assert.equal(getDeliveryFee(state, 49_999), ["FCT - Abuja", "Ogun", "Oyo"].includes(state) ? 4_000 : 4_500, state);
    assert.equal(getDeliveryFee(state, 50_000), 0, state);
    assert.equal(getDeliveryFee(state, 150_000), 0, state);
  }
});

test("Lagos retains its original ₦150,000 free-delivery threshold", () => {
  assert.equal(getDeliveryFee("Lagos", 0), 2_500);
  assert.equal(getDeliveryFee("Lagos", 50_000), 2_500);
  assert.equal(getDeliveryFee("Lagos", 149_999), 2_500);
  assert.equal(getDeliveryFee("Lagos", 150_000), 0);
  assert.equal(getDeliveryFee("", 60_000), 0);
});

test("server checkout and client checkout use the same delivery calculator", () => {
  assert.match(read("../src/lib/actions/checkout.ts"), /getDeliveryFee\(input\.state, subtotal\)/);
  assert.match(read("../src/components/checkout/checkout-form.tsx"), /getDeliveryFee\(state, subtotal\)/);
  assert.match(read("../src/components/cart/cart-view.tsx"), /getDeliveryFee\(state, subtotal\)/);
});

test("only owner-confirmed GTBank account ending 6091 appears in payment configuration", () => {
  const payment = read("../src/lib/payments/index.ts");
  const content = read("../src/lib/site-content.ts");
  const checkout = read("../src/components/checkout/checkout-form.tsx");
  assert.match(payment, /accountName:\s*"Salmon Salmat Oyindamola"/);
  assert.match(payment, /accountNumber:\s*"0165946091"/);
  assert.match(content, /bankAccountName:\s*"Salmon Salmat Oyindamola"/);
  assert.match(content, /bankAccountNumber:\s*"0165946091"/);
  assert.doesNotMatch(payment + content + checkout, /0172349956|Alli Ibrahim Olanrewaju/);
  assert.match(read("../src/app/(store)/order/[orderNumber]/page.tsx"), /content\.business\.bankAccountNumber/);
});

test("shipping and promotion wording reflects only location-appropriate offers", () => {
  const policy = read("../src/content/policies.ts");
  const content = read("../src/lib/site-content.ts");
  assert.match(policy, /Interstate delivery.*₦50,000/);
  assert.match(policy, /Lagos delivery.*₦150,000/);
  assert.match(content, /Free interstate delivery from ₦50,000/);
});

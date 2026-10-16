import assert from "node:assert/strict";
import test from "node:test";
import React, { act } from "react";
import { JSDOM } from "jsdom";
import { loadSource } from "./helpers/load-source.mjs";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://jis.example/checkout" });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
const { createRoot } = await import("react-dom/client");
const Cart = React.createContext(null);
const { CouponForm } = loadSource("src/components/cart/cart-view.tsx", {
  "next/link": { __esModule: true, default: ({ href, children }) => React.createElement("a", { href }, children) },
  "next/image": { __esModule: true, default: () => null },
  "./cart-provider": { useCart: () => React.useContext(Cart) },
});

async function setup(validate) {
  let orderSubmits = 0;
  const calls = [];
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  function Harness() {
    const [coupon, setCoupon] = React.useState(null);
    return React.createElement(Cart.Provider, { value: {
      coupon, discount: coupon ? 450 : 0, removeCoupon: () => setCoupon(null),
      async applyCoupon(code) {
        calls.push(code);
        const result = await validate(code);
        if (result.ok) setCoupon({ code, type: "percentage", value: 5, minOrderAmount: 0, maxDiscount: null });
        return result;
      },
    } }, React.createElement("form", { onSubmit(event) { event.preventDefault(); orderSubmits++; } },
      React.createElement("input", { name: "city", defaultValue: "Lekki Phase 1" }),
      React.createElement(CouponForm, { compact: true }),
      React.createElement("button", { type: "submit" }, "Place order"),
    ));
  }
  await act(() => root.render(React.createElement(Harness)));
  return {
    container, calls,
    orderSubmits: () => orderSubmits,
    async type(value) {
      const input = container.querySelector("#coupon");
      await act(() => {
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(input, value);
        input.dispatchEvent(new window.Event("input", { bubbles: true }));
      });
      return input;
    },
    async dispose() { await act(() => root.unmount()); container.remove(); },
  };
}

test("clicking Apply inside checkout applies the code without submitting or clearing delivery fields", async () => {
  const ui = await setup(async () => ({ ok: true, message: "Applied" }));
  try {
    assert.equal(ui.container.querySelectorAll("form").length, 1, "coupon must not create a nested form");
    await ui.type("jiswelcome");
    await act(async () => { ui.container.querySelector('button[type="button"]').click(); });
    assert.deepEqual(ui.calls, ["JISWELCOME"]);
    assert.match(ui.container.textContent, /JISWELCOME applied/);
    assert.equal(ui.orderSubmits(), 0);
    assert.equal(ui.container.querySelector('[name="city"]').value, "Lekki Phase 1");
    await act(() => ui.container.querySelector('[aria-label="Remove coupon"]').click());
    assert.ok(ui.container.querySelector("#coupon"));
    assert.equal(ui.orderSubmits(), 0);
  } finally { await ui.dispose(); }
});

test("Enter applies a coupon, prevents implicit order submission, and invalid codes remain retryable", async () => {
  const ui = await setup(async (code) => code === "JISWELCOME" ? { ok: true, message: "Applied" } : { ok: false, message: "This code has expired" });
  try {
    let input = await ui.type("EXPIRED");
    const enter = new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    await act(async () => { input.dispatchEvent(enter); });
    assert.equal(enter.defaultPrevented, true);
    assert.equal(ui.container.querySelector('[role="status"]').textContent, "This code has expired");
    input = await ui.type("JISWELCOME");
    await act(async () => { input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })); });
    assert.deepEqual(ui.calls, ["EXPIRED", "JISWELCOME"]);
    assert.match(ui.container.textContent, /JISWELCOME applied/);
    assert.equal(ui.orderSubmits(), 0);
  } finally { await ui.dispose(); }
});

test("pending coupon validation blocks repeat submissions", async () => {
  let finish;
  const response = new Promise((resolve) => { finish = resolve; });
  const ui = await setup(() => response);
  try {
    const input = await ui.type("JISWELCOME");
    await act(() => ui.container.querySelector('button[type="button"]').click());
    assert.equal(ui.container.querySelector('button[type="button"]').disabled, true);
    await act(() => input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    assert.deepEqual(ui.calls, ["JISWELCOME"]);
    await act(async () => { finish({ ok: true, message: "Applied" }); await response; });
    assert.equal(ui.orderSubmits(), 0);
  } finally { await ui.dispose(); }
});

test("mobile menu shows the same published category names and order, then restores focus on close", async () => {
  const { MobileMenu } = loadSource("src/components/layout/mobile-menu.tsx", {
    "next/link": { __esModule: true, default: ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children) },
    "next/image": { __esModule: true, default: () => null },
  });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const categories = [
    { id: 1, name: "Skincare", slug: "skincare", sortOrder: 2, isActive: true },
    { id: 2, name: "Hidden", slug: "hidden", sortOrder: 0, isActive: false },
    { id: 3, name: "Gift Sets", slug: "gift-sets", sortOrder: 1, isActive: true },
  ];
  try {
    await act(() => root.render(React.createElement(MobileMenu, { categories, user: null })));
    const trigger = container.querySelector('[aria-label="Open menu"]');
    await act(() => trigger.click());
    const dialog = document.querySelector('[role="dialog"]');
    const links = Array.from(dialog.querySelectorAll('a[href^="/shop/"]'));
    assert.deepEqual(links.map((link) => [link.getAttribute("href"), link.textContent]), [
      ["/shop/gift-sets", "Gift Sets"], ["/shop/skincare", "Skincare"],
    ]);
    await act(() => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.activeElement, trigger);
  } finally { await act(() => root.unmount()); container.remove(); }
});

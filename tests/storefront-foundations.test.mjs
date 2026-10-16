import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadSource } from "./helpers/load-source.mjs";

const { deliveryAnnouncement, resolveAnnouncement, getCategoryLinks } = loadSource("src/lib/storefront-settings.ts");
const { DEFAULT_SITE_CONTENT } = loadSource("src/lib/site-content.ts");
const delivery = DEFAULT_SITE_CONTENT.delivery;

test("old Lagos banner is replaced with the actual saved delivery thresholds", () => {
  const result = resolveAnnouncement({ text: "Free Delivery in Lagos for orders above #50,000", href: "/shop", enabled: true }, delivery);
  assert.equal(result.text, "Free Lagos delivery from ₦150,000 · Free interstate delivery from ₦50,000");
  assert.equal(result.href, "/shipping");
  assert.equal(result.autoDeliveryText, true);
  assert.equal(resolveAnnouncement(result, { ...delivery, freeDeliveryThreshold: 80_000 }).text, "Free Lagos delivery from ₦80,000 · Free interstate delivery from ₦50,000");
});

test("custom announcements and an explicit owner override survive settings reads", () => {
  for (const text of ["Weekend sale: 10% off", "Free delivery on orders placed today"]) {
    const custom = { text, href: "/shop?sale=1", enabled: true };
    assert.deepEqual(resolveAnnouncement(custom, delivery), { ...custom, autoDeliveryText: false });
  }
  const custom = { text: DEFAULT_SITE_CONTENT.announcement.text, href: "/custom", enabled: false, autoDeliveryText: false };
  assert.deepEqual(resolveAnnouncement(custom, delivery), custom);
});

test("equal nationwide thresholds are stated once and disabled banners stay disabled", () => {
  assert.equal(deliveryAnnouncement({ ...delivery, freeDeliveryThreshold: 50_000 }), "Free nationwide delivery from ₦50,000");
  assert.equal(resolveAnnouncement({ ...DEFAULT_SITE_CONTENT.announcement, enabled: false }, delivery).enabled, false);
});

const categories = [
  { id: 2, name: "Skincare", slug: "skincare", isActive: true, sortOrder: 2, image: "/skincare.jpg", description: "Care for your skin", productCount: 3 },
  { id: 1, name: "Hidden collection", slug: "hidden", isActive: false, sortOrder: 0, image: null, description: "", productCount: 0 },
  { id: 3, name: "Gift Sets", slug: "gift-sets", isActive: true, sortOrder: 1, image: null, description: "", productCount: 1 },
];

test("new and renamed categories share one ordered published navigation list", () => {
  const before = JSON.stringify(categories);
  assert.deepEqual(getCategoryLinks(categories), [
    { id: 3, label: "Gift Sets", href: "/shop/gift-sets" },
    { id: 2, label: "Skincare", href: "/shop/skincare" },
  ]);
  assert.equal(JSON.stringify(categories), before);
  assert.equal(getCategoryLinks([{ ...categories[0], name: "Skin Essentials", slug: "skin-essentials" }])[0].href, "/shop/skin-essentials");
});

const Link = ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children);
const imageStub = { __esModule: true, default: () => null };
const common = { "next/link": { __esModule: true, default: Link }, "next/image": imageStub };

test("desktop menu renders owner-added categories and excludes hidden ones", () => {
  const { Header } = loadSource("src/components/layout/header.tsx", {
    ...common, "./header-actions": { HeaderActions: () => null }, "./mobile-menu": { MobileMenu: () => null },
  });
  const html = renderToStaticMarkup(React.createElement(Header, { user: null, categories }));
  assert.match(html, /href="\/shop\/skincare"/);
  assert.ok(html.indexOf('href="/shop/gift-sets"') < html.indexOf('href="/shop/skincare"'));
  assert.doesNotMatch(html, /\/shop\/hidden/);
});

test("category edit page loads saved fields, photo and visibility with working edit links", async () => {
  let authorized = 0;
  const { default: Page } = loadSource("src/app/admin/categories/page.tsx", {
    ...common,
    "@/lib/actions/media": { async listWebsiteMediaAction() { return []; }, async registerWebsiteMediaAction() {} },
    "next/navigation": { notFound() { throw new Error("NOT_FOUND"); } },
    "@/lib/auth/session": { async requireAdmin() { authorized++; } },
    "@/lib/data/categories": { async getCategories() { return categories; } },
    "@/lib/actions/admin": { async saveCategoryAction() {}, async deleteCategoryAction() {} },
  });
  const page = await Page({ searchParams: Promise.resolve({ edit: "2" }) });
  const html = renderToStaticMarkup(page);
  assert.equal(authorized, 1);
  assert.match(html, /Edit Skincare/);
  assert.match(html, /name="id" value="2"/);
  assert.match(html, /name="name" value="Skincare"/);
  assert.match(html, /value="\/skincare.jpg"/);
  assert.match(html, /Cancel editing/);
  assert.match(html, /href="\/admin\/categories\?edit=2#category-editor"/);
  await assert.rejects(Page({ searchParams: Promise.resolve({ edit: "999" }) }), /NOT_FOUND/);
});

test("homepage uses compact two-column mobile category tiles and excludes empty categories", () => {
  const { FeaturedCategories } = loadSource("src/components/home/featured-categories.tsx", common);
  const groups = [
    ...categories,
    { id: 4, name: "Perfumes for Men", slug: "men", isActive: true, productCount: 0, image: "/men.jpg", description: "Fresh scents" },
    { id: 5, name: "Long Name Body Sprays & Deodorants", slug: "body-sprays", isActive: true, productCount: 2, image: "/body.jpg", description: "Body care" },
  ];
  const section = { id: "home-categories", eyebrow: "Shop by category", title: "Choose your scent", body: "Explore your favourites", buttonLabel: "All categories", buttonHref: "/categories" };
  const html = renderToStaticMarkup(React.createElement(FeaturedCategories, { categories: groups, section }));
  assert.ok(html.includes("grid grid-cols-2 gap-3"), "two columns on phones");
  assert.ok(html.includes("aspect-[4/5]"), "compact image tiles");
  assert.ok(html.includes("sm:min-h-[350px]"), "spacious desktop cards retained");
  assert.ok(html.includes('href="/shop/skincare"'));
  assert.ok(html.includes('href="/shop/body-sprays"'));
  assert.ok(!html.includes('href="/shop/men"'), "empty men's category should be hidden on homepage");
  assert.ok(!html.includes('href="/shop/hidden"'), "inactive category should be hidden");
  assert.ok(html.includes("hidden max-w-lg text-sm"), "descriptions are hidden on phones");
  assert.ok(html.includes('href="/categories"'), "visitors can still browse all collections");
});

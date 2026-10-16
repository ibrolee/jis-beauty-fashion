import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { loadSource } from "./helpers/load-source.mjs";
import { websiteStore } from "./helpers/website-store.mjs";

const { editableContent, editableContentSchema, safeDestination } = loadSource("src/lib/website-schema.ts");
const { CONTENT_KEYS, draftChange, publishChange, restoreChange } = loadSource("src/lib/content-publishing.ts");
const valid = () => { const content = editableContent(); content.announcement.autoDeliveryText = true; return content; };
const revisions = (state) => ({ publishedRevision: state.publishedRevision, draftRevision: state.draftRevision });

test("editable content round-trips added sections and links while rejecting dangerous destinations", () => {
  const content = valid();
  content.website.pages.about.sections.push({ title: "Our founder", body: ["A new story", "Another paragraph"] });
  content.website.navigation.links.push({ label: "Gift sets", href: "/shop/gift-sets", enabled: true });
  assert.deepEqual(editableContentSchema.parse(content), content);
  assert.equal("blog" in content, false, "content snapshots must not contain posts or customer interactions");
  for (const value of ["javascript:alert(1)", "data:image/svg+xml,test", "//evil.example", "/\\evil.example", "https://user:pass@example.com", "https://example.com\n"]) assert.equal(safeDestination(value), false, value);
  for (const value of ["/shop?newArrivals=1", "https://example.com/page", "mailto:owner@example.com", "tel:+2349042336294", "#collections"]) assert.equal(safeDestination(value), true, value);
  content.website.brand.logo = "javascript:alert(1)";
  assert.equal(editableContentSchema.safeParse(content).success, false);
  content.website.brand.logo = "";
  content.website.home.sections.push({ ...content.website.home.sections[0] });
  assert.equal(editableContentSchema.safeParse(content).success, false, "duplicate section identities and main banners are invalid");
});

test("draft, publish and restore preserve the live version until explicit publication", () => {
  const original = { revision: "v1", content: valid(), savedAt: "", savedBy: "Owner" };
  const edited = valid(); edited.hero.headline = "New season";
  const draft = draftChange({ published: original, draft: null, history: [] }, edited, "", "v1", "d1", "today", "Owner");
  assert.equal(draft.published, original);
  const published = publishChange(draft, "d1", "v1", "v2", "today", "Owner");
  assert.equal(published.draft, null);
  assert.equal(published.published.content.hero.headline, "New season");
  const restored = restoreChange(published, "v1", "", "v2", "d2", "today", "Owner");
  assert.equal(restored.published.revision, "v2");
  assert.equal(restored.draft.content.hero.headline, original.content.hero.headline);
  restored.draft.content.hero.headline = "Edited after restoring";
  assert.notEqual(published.history[0].content.hero.headline, "Edited after restoring");
});

test("stale tabs cannot overwrite drafts or publish over a newer website; history keeps 15 versions", () => {
  let state = { published: { revision: "v0", content: valid(), savedAt: "", savedBy: "Owner" }, draft: null, history: [] };
  for (let i = 1; i <= 20; i++) {
    const previous = state.published.revision;
    state = draftChange(state, valid(), "", previous, `d${i}`, "today", "Owner");
    assert.throws(() => draftChange(state, valid(), "", previous, "stale", "today", "Owner"), /another tab/);
    assert.throws(() => publishChange(state, `d${i}`, "outdated", "stale", "today", "Owner"), /another tab/);
    state = publishChange(state, `d${i}`, previous, `v${i}`, "today", "Owner");
  }
  assert.equal(state.history.length, 15);
  assert.deepEqual(state.history.map((v) => v.revision), Array.from({ length: 15 }, (_, i) => `v${19 - i}`));
});

test("real actions persist drafts separately, reject stale writes and publish atomically without rewriting the blog", async () => {
  const store = websiteStore();
  store.rows.set("blog", { posts: [], comments: [{ body: "Recent comment" }], likes: { article: [2, 3] } });
  const actions = store.load("src/lib/actions/website.ts");
  const editor = store.load("src/lib/data/website-editor.ts");
  const settings = store.load("src/lib/data/settings.ts");
  const initial = await editor.getWebsiteEditorState();
  const edited = structuredClone(initial.content);
  edited.hero.headline = "An unpublished campaign";
  edited.delivery.lagosFee = 9000;
  edited.business.bankAccountNumber = "1234567890";
  const saved = await actions.saveWebsiteDraftAction({ ...revisions(initial), content: edited });
  assert.equal(saved.ok, true);
  assert.deepEqual(store.writes, [CONTENT_KEYS.draft]);
  assert.notEqual((await settings.getSiteContent()).hero.headline, edited.hero.headline);
  const stale = await actions.saveWebsiteDraftAction({ ...revisions(initial), content: edited });
  assert.equal(stale.ok, false);
  assert.match(stale.message, /another tab/);
  assert.equal(store.rows.get(CONTENT_KEYS.draft).revision, saved.state.draftRevision);
  const published = await actions.publishWebsiteAction(revisions(saved.state));
  assert.equal(published.ok, true);
  assert.equal(published.state.hasDraft, false);
  assert.equal(store.rows.has(CONTENT_KEYS.draft), false);
  assert.equal((await settings.getPublishedSiteContent()).delivery.lagosFee, 9000);
  assert.equal((await settings.getSiteContent()).business.bankAccountNumber, "1234567890");
  assert.equal((await settings.getSiteContent()).blog.comments[0].body, "Recent comment");
  assert.equal(store.writes.includes("blog"), false);
  const restored = await actions.restoreWebsiteAction({ ...revisions(published.state), revision: "legacy" });
  assert.equal(restored.ok, true);
  assert.notEqual(restored.state.content.hero.headline, edited.hero.headline);
  assert.equal((await settings.getPublishedSiteContent()).hero.headline, edited.hero.headline);
  const discarded = await actions.discardWebsiteDraftAction(revisions(restored.state));
  assert.equal(discarded.ok, true);
  assert.equal(discarded.state.content.hero.headline, edited.hero.headline);
  assert.ok(store.locks() >= 5);
});

test("private preview requires both the preview cookie and an admin; commerce always reads published values", async () => {
  const store = websiteStore();
  const actions = store.load("src/lib/actions/website.ts");
  const editor = store.load("src/lib/data/website-editor.ts");
  const settings = store.load("src/lib/data/settings.ts");
  const initial = await editor.getWebsiteEditorState();
  const content = structuredClone(initial.content);
  content.hero.headline = "Private preview"; content.delivery.lagosFee = 8800;
  await actions.saveWebsiteDraftAction({ ...revisions(initial), content });
  await assert.rejects(actions.startWebsitePreviewAction(), /REDIRECT:\/$/);
  assert.equal(store.preview(), true);
  assert.equal((await settings.getSiteContent()).hero.headline, "Private preview");
  assert.notEqual((await settings.getPublishedSiteContent()).delivery.lagosFee, 8800);
  for (const user of [null, { id: 3, role: "customer" }]) {
    store.setUser(user);
    assert.notEqual((await settings.getSiteContent()).hero.headline, "Private preview");
    await assert.rejects(actions.publishWebsiteAction({ draftRevision: "", publishedRevision: "legacy" }), /ADMIN_REQUIRED/);
    await assert.rejects(actions.startWebsitePreviewAction(), /ADMIN_REQUIRED/);
  }
  // These entry points must use the getter whose behaviour was exercised above.
  for (const file of ["src/lib/actions/checkout.ts", "src/app/(store)/checkout/page.tsx", "src/app/(store)/cart/page.tsx", "src/app/(store)/order/[orderNumber]/page.tsx"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /getPublishedSiteContent\(\)/, file);
    assert.doesNotMatch(source, /\bgetSiteContent\(\)/, file);
  }
});

test("invalid drafts and unauthorised media changes never write storage", async () => {
  const store = websiteStore();
  const actions = store.load("src/lib/actions/website.ts");
  const content = valid(); content.hero.primaryHref = "javascript:alert(1)";
  const result = await actions.saveWebsiteDraftAction({ draftRevision: "", publishedRevision: "legacy", content });
  assert.equal(result.ok, false);
  assert.equal(store.writes.length, 0);
  const media = loadSource("src/lib/actions/media.ts", { ...store.overrides, "@/lib/data/media": { mediaAsset: (url, name) => ({ id: url, url, name, hidden: false, createdAt: "today" }), getMediaLibrary: async () => [] } });
  await media.registerWebsiteMediaAction("https://images.example/photo.jpg", "Photo");
  await media.updateWebsiteMediaAction("https://images.example/photo.jpg", "Renamed", true);
  assert.equal(store.rows.get(CONTENT_KEYS.media).assets.length, 1);
  assert.equal(store.rows.get(CONTENT_KEYS.media).assets[0].hidden, true);
  await media.updateWebsiteMediaAction("https://images.example/photo.jpg", "Renamed", false);
  assert.equal(store.rows.get(CONTENT_KEYS.media).assets[0].hidden, false);
  const writes = store.writes.length;
  store.setUser(null);
  await assert.rejects(media.updateWebsiteMediaAction("https://images.example/photo.jpg", "Changed"), /ADMIN_REQUIRED/);
  assert.equal(store.writes.length, writes);
});

test("managed policy pages expand current delivery and contact details without rendering raw markup", async () => {
  const content = { ...valid(), blog: { posts: [] } };
  content.delivery.lagosFee = 6500;
  content.website.brand.whatsapp = "+2341112223333";
  content.website.pages.shipping.sections.push({ title: "Owner note", body: ["<script>bad()</script>"] });
  const { ManagedInfoPage } = loadSource("src/components/info/managed-info-page.tsx", {
    "@/lib/data/settings": { getSiteContent: async () => content },
    "next/image": { __esModule: true, default: () => null },
    "next/link": { __esModule: true, default: ({ href, children }) => React.createElement("a", { href }, children) },
  });
  const html = renderToStaticMarkup(await ManagedInfoPage({ pageKey: "shipping", help: true }));
  assert.match(html, /6,500/);
  assert.match(html, /2341112223333/);
  assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /\{\{deliveryFees\}\}/);
});

test("homepage obeys the saved order, visibility, product source and product limit", async () => {
  const content = { ...valid(), blog: {} };
  const sections = content.website.home.sections;
  const text = { ...sections.find((item) => item.type === "editorial"), id: "owner-story", title: "Owner's story" };
  const collection = { ...sections.find((item) => item.type === "collection"), id: "owner-products", title: "Owner's products", source: "category", categorySlug: "gift-sets", limit: 7 };
  content.website.home.sections = [text, { ...collection, id: "hidden", enabled: false }, sections[0], collection];
  const queries = [];
  const marker = (name) => function SectionMarker(props) { return React.createElement("section", null, `${name}:${props.section?.title ?? props.title ?? props.content?.headline}`); };
  const { default: HomePage } = loadSource("src/app/(store)/page.tsx", {
    "@/lib/data/settings": { getSiteContent: async () => content },
    "@/lib/data/categories": { getCategories: async () => [] },
    "@/lib/data/products": { async getProductsForCategory(slug, limit) { queries.push([slug, limit]); return []; } },
    "@/components/home/hero": { Hero: marker("hero") },
    "@/components/home/collection-section": { CollectionSection: marker("products") },
    "@/components/home/managed-section": { ManagedSection: marker("story") },
    "@/components/home/featured-categories": { FeaturedCategories: marker("categories") },
    "@/components/home/sections": { NewsletterBand: marker("newsletter"), PromoCta: marker("promo") },
  });
  const html = renderToStaticMarkup(await HomePage());
  assert.ok(html.indexOf("story:") < html.indexOf("hero:"));
  assert.ok(html.indexOf("hero:") < html.indexOf("products:"));
  assert.deepEqual(queries, [["gift-sets", 7]], "hidden collections must not fetch or render products");
});

test("the main banner renders the owner's saved image and clearing the logo uses the editable store name", () => {
  const boundaries = {
    "next/image": { __esModule: true, default: ({ src, alt }) => React.createElement("img", { src, alt }) },
    "next/link": { __esModule: true, default: ({ href, children }) => React.createElement("a", { href }, children) },
  };
  const { Hero } = loadSource("src/components/home/hero.tsx", boundaries);
  const content = valid(); content.hero.image = "/uploaded-campaign.jpg";
  const hero = renderToStaticMarkup(React.createElement(Hero, { content: content.hero }));
  assert.match(hero, /src="\/uploaded-campaign.jpg"/);
  assert.doesNotMatch(hero, /category-women-v2.jpg/);
  const { Logo } = loadSource("src/components/layout/logo.tsx", boundaries);
  const logo = renderToStaticMarkup(React.createElement(Logo, { brand: { ...content.website.brand, name: "Owner's Boutique", logo: "" } }));
  assert.match(logo, /Owner&#x27;s Boutique/);
  assert.doesNotMatch(logo, /<img/);
});

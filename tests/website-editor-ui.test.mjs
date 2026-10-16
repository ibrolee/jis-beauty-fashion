import assert from "node:assert/strict";
import test from "node:test";
import React, { act } from "react";
import { JSDOM } from "jsdom";
import { loadSource } from "./helpers/load-source.mjs";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://jis.example/admin/content" });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
window.confirm = () => true;
const { createRoot } = await import("react-dom/client");
const { editableContent } = loadSource("src/lib/website-schema.ts");
const content = () => { const value = editableContent(); value.announcement.autoDeliveryText = true; return value; };
const state = () => ({ content: content(), publishedRevision: "v1", draftRevision: "", hasDraft: false, history: [] });
const common = {
  "next/link": { __esModule: true, default: ({ href, children, ...props }) => React.createElement("a", { href, ...props }, children) },
  "next/image": { __esModule: true, default: () => null },
  "@/components/image-uploader": { ImageUploader: () => React.createElement("div", null, "Image upload control") },
};
async function mount(element) {
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container);
  await act(() => root.render(element));
  return { container, async dispose() { await act(() => root.unmount()); container.remove(); } };
}
async function type(input, value) {
  await act(() => {
    const prototype = input.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}
function button(container, text) { return [...container.querySelectorAll("button")].find((item) => item.textContent === text); }

test("homepage section controls add, reorder, hide and remove sections without losing paragraph edits", async () => {
  const { ContentField } = loadSource("src/components/admin/website-editor.tsx", { ...common, "@/lib/actions/website": {} });
  let latest;
  function Harness() {
    const [sections, setSections] = React.useState(content().website.home.sections.slice(0, 2));
    latest = sections;
    return React.createElement(ContentField, { value: sections, path: "website.home.sections", title: "Sections", categories: [], onChange: setSections });
  }
  const ui = await mount(React.createElement(Harness));
  try {
    await act(() => button(ui.container, "Add item").click());
    assert.equal(latest.length, 3);
    assert.equal(latest[2].type, "text");
    const addedId = latest[2].id;
    await type(ui.container.querySelector("#editor-website-home-sections-2-title"), "A new story");
    await type(ui.container.querySelector("#editor-website-home-sections-2-body"), "First paragraph\n\nSecond paragraph");
    await act(() => ui.container.querySelector('[aria-label="Move A new story up"]').click());
    assert.equal(latest[1].id, addedId);
    assert.equal(latest[1].body, "First paragraph\n\nSecond paragraph");
    await act(() => ui.container.querySelectorAll('input[type="checkbox"]')[1].click());
    assert.equal(latest[1].enabled, false);
    const details = ui.container.querySelectorAll("details")[1];
    await act(() => button(details, "Remove").click());
    assert.equal(latest.length, 2);
    assert.ok(latest.every((section) => section.id !== addedId));
  } finally { await ui.dispose(); }
});

test("editor keeps publishing disabled until the draft is saved and preserves edits after save errors", async () => {
  const savedInputs = []; let published = 0; let reject = true;
  const initial = state();
  const { WebsiteEditor } = loadSource("src/components/admin/website-editor.tsx", { ...common, "@/lib/actions/website": {
    async saveWebsiteDraftAction(input) {
      savedInputs.push(structuredClone(input));
      return reject ? { ok: false, message: "Another tab saved first" } : { ok: true, message: "Draft saved", state: { ...initial, content: input.content, hasDraft: true, draftRevision: "d1" } };
    },
    async publishWebsiteAction(input) { published++; assert.equal(input.draftRevision, "d1"); return { ok: true, message: "Website published", state: { ...initial, content: savedInputs.at(-1).content, publishedRevision: "v2" } }; },
    async startWebsitePreviewAction() {},
  } });
  const ui = await mount(React.createElement(WebsiteEditor, { initial, categories: [] }));
  try {
    assert.equal(button(ui.container, "Preview saved draft").disabled, true);
    const headline = ui.container.querySelector("#editor-hero-headline");
    await type(headline, "Fresh scents this weekend");
    assert.match(ui.container.textContent, /Unsaved changes/);
    assert.equal(button(ui.container, "Publish saved draft").disabled, true);
    await act(async () => button(ui.container, "Save draft").click());
    assert.match(ui.container.querySelector('[role="alert"]').textContent, /Another tab/);
    assert.equal(headline.value, "Fresh scents this weekend");
    reject = false;
    await act(async () => button(ui.container, "Save draft").click());
    assert.equal(button(ui.container, "Preview saved draft").disabled, false);
    assert.equal(button(ui.container, "Publish saved draft").disabled, false);
    await act(async () => button(ui.container, "Publish saved draft").click());
    assert.equal(published, 1);
    assert.match(ui.container.textContent, /Published version/);
    assert.equal(button(ui.container, "Publish saved draft").disabled, true);
  } finally { await ui.dispose(); }
});

test("media picker searches, selects an existing image and restores focus after Escape", async () => {
  let selected = "";
  const { MediaBrowser } = loadSource("src/components/admin/media-browser.tsx", { ...common, "@/lib/actions/media": {
    async listWebsiteMediaAction() { return [{ id: "1", name: "Campaign photo", url: "/campaign.jpg" }, { id: "2", name: "Product photo", url: "/product.jpg" }]; },
  } });
  const ui = await mount(React.createElement(MediaBrowser, { onSelect: (url) => { selected = url; } }));
  try {
    const trigger = button(ui.container, "Choose from media");
    await act(async () => trigger.click());
    const dialog = document.querySelector('[role="dialog"]');
    await type(dialog.querySelector("input"), "Campaign");
    assert.ok(button(dialog, "Campaign photo"));
    assert.equal(button(dialog, "Product photo"), undefined);
    await act(() => button(dialog, "Campaign photo").click());
    assert.equal(selected, "/campaign.jpg");
    assert.equal(document.querySelector('[role="dialog"]'), null);
    await act(async () => trigger.click());
    await act(() => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.activeElement, trigger);
  } finally { await ui.dispose(); }
});

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { PAGE_KEYS, newHomeSection, type EditableContent, type EditorState } from "@/lib/website-content";
import { discardWebsiteDraftAction, publishWebsiteAction, restoreWebsiteAction, saveWebsiteDraftAction, startWebsitePreviewAction, type EditorResult } from "@/lib/actions/website";

type Value = string | number | boolean | Value[] | { [key: string]: Value };
const inputClass = "min-h-11 w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none disabled:bg-ivory disabled:text-stone";
const names: Record<string, string> = { eyebrow: "Small heading", href: "Destination", primaryHref: "Main button destination", secondaryHref: "Second button destination", primaryCta: "Main button text", secondaryCta: "Second button text", subheadline: "Introduction", cta: "Button text", enabled: "Show this item", autoDeliveryText: "Use delivery settings for the announcement", includeCategories: "Include product categories in both menus", hideEmptyCategories: "Hide empty categories from the menus", brandLine: "Store line below the main banner", source: "Products to display", categorySlug: "Product category", limit: "Maximum products", tone: "Background", sections: "Page sections", quickLinks: "Quick shop links", regionalStates: "Nearby states", freeDeliveryThreshold: "Free Lagos delivery from (₦)", interstateFreeDeliveryThreshold: "Free interstate delivery from (₦)", logo: "Store logo", shareImage: "Social sharing image", primaryColor: "Main brand colour", accentColor: "Accent colour" };
function label(key: string) { return names[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()); }
function addition(path: string): Value {
  if (path === "website.home.sections") return newHomeSection("text", crypto.randomUUID()) as unknown as Value;
  if (path.endsWith("sections")) return { title: "New section", body: [""] };
  if (path === "website.faq") return { question: "New question", answer: "" };
  if (/links$/i.test(path)) return { label: "New link", href: "/shop", enabled: true };
  return "";
}

export function ContentField({ value, path, title, onChange, categories, disabled = false }: { value: Value; path: string; title: string; onChange: (next: Value) => void; categories: { name: string; slug: string }[]; disabled?: boolean }) {
  const key = path.split(".").at(-1) ?? "";
  const id = `editor-${path.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  if (typeof value === "boolean") return <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={value} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-ink" />{title}</label>;
  if (typeof value === "string" || typeof value === "number") {
    const choices = key === "type" && path.includes("home.sections") ? { hero: "Main banner", categories: "Category collection", collection: "Product collection", editorial: "Image and story", newsletter: "Newsletter signup", promo: "Final promotion", text: "Text and optional image" }
      : key === "source" ? { category: "One category", newArrivals: "New arrivals", bestSellers: "Best sellers" }
      : key === "tone" ? { white: "White", ivory: "Cream" } : null;
    if (["image", "logo", "shareImage"].includes(key)) return <div className="min-w-0 space-y-2"><p className="text-sm font-medium">{title}</p><ImageUploader name={null} maxImages={1} value={value ? [String(value)] : []} onChange={(urls) => onChange(urls[0] ?? "")} /><label htmlFor={id} className="block text-xs text-stone">Or paste an image URL</label><input id={id} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
    return <div className="min-w-0 space-y-2"><label className="block text-sm font-medium" htmlFor={id}>{title}</label>
      {choices ? <select id={id} className={inputClass} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{Object.entries(choices).map(([option, name]) => <option key={option} value={option}>{name}</option>)}</select>
        : key === "categorySlug" ? <select id={id} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select a category</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select>
        : (/body|description|intro|answer|instructions|notice|note|tagline/i.test(key) || path.includes(".body.")) ? <textarea id={id} className={`${inputClass} min-h-28`} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
        : <input id={id} className={inputClass} type={typeof value === "number" ? "number" : /color$/i.test(key) ? "color" : "text"} min={typeof value === "number" ? 0 : undefined} value={value} disabled={disabled} onChange={(event) => onChange(typeof value === "number" ? Number(event.target.value) : event.target.value)} />}
      {/href$/i.test(key) && <p className="text-xs text-stone">Choose a website path such as /shop, an HTTPS link, mailto: email link or tel: phone link.</p>}
    </div>;
  }
  if (Array.isArray(value)) return <div className="min-w-0 space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-medium">{title}</h3><button type="button" onClick={() => onChange([...value, addition(path)])} className="min-h-10 rounded-lg border border-line px-3 text-sm">Add item</button></div>
    {value.map((item, index) => {
      const object = item && typeof item === "object" && !Array.isArray(item) ? item : null;
      const itemLabel = object ? String(object.title || object.label || object.question || `Item ${index + 1}`) : `Paragraph ${index + 1}`;
      const move = (offset: number) => { const next = [...value]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; onChange(next); };
      return <details key={object && "id" in object ? String(object.id) : `${path}-${index}`} className="min-w-0 rounded-xl border border-line bg-white p-4"><summary className="cursor-pointer break-words pr-3 text-sm font-medium">{index + 1}. {itemLabel}{object?.enabled === false ? " · Hidden" : ""}</summary>
        <div className="mt-4 space-y-4"><div className="flex flex-wrap gap-2"><button type="button" disabled={index === 0} aria-label={`Move ${itemLabel} up`} onClick={() => move(-1)} className="min-h-10 border border-line px-3 text-xs disabled:opacity-30">Move up</button><button type="button" disabled={index === value.length - 1} aria-label={`Move ${itemLabel} down`} onClick={() => move(1)} className="min-h-10 border border-line px-3 text-xs disabled:opacity-30">Move down</button><button type="button" onClick={() => { if (window.confirm(`Remove ${itemLabel} from this draft?`)) onChange(value.filter((_, itemIndex) => index !== itemIndex)); }} className="min-h-10 border border-sale/30 px-3 text-xs text-sale">Remove</button></div>
        <ContentField value={item} path={`${path}.${index}`} title={itemLabel} categories={categories} onChange={(next) => onChange(value.map((old, itemIndex) => index === itemIndex ? next : old))} />
        </div></details>;
    })}
    {!value.length && <p className="text-sm text-stone">No items yet. Add one above.</p>}
  </div>;
  let entries = Object.entries(value).filter(([name]) => name !== "id");
  if (path.startsWith("website.home.sections.")) {
    const type = value.type;
    const fields = type === "hero" || type === "promo" ? ["type", "enabled", "title"] : type === "collection" ? ["type", "enabled", "eyebrow", "title", "body", "image", "buttonLabel", "buttonHref", "source", "categorySlug", "limit", "tone"] : type === "newsletter" ? ["type", "enabled", "eyebrow", "title", "body"] : type === "categories" ? ["type", "enabled", "eyebrow", "title", "body", "buttonLabel", "buttonHref"] : ["type", "enabled", "eyebrow", "title", "body", "image", "buttonLabel", "buttonHref", "tone"];
    entries = entries.filter(([name]) => fields.includes(name));
  }
  return <div className="min-w-0 space-y-5">{entries.map(([name, child]) => <ContentField key={name} value={child} path={`${path}.${name}`} title={label(name)} categories={categories} disabled={path === "announcement" && value.autoDeliveryText === true && ["text", "href"].includes(name)} onChange={(next) => onChange({ ...value, [name]: next })} />)}</div>;
}

const tabs = ["Homepage", "Pages", "Navigation", "Brand & contact", "Footer", "Delivery & payment", "Version history"] as const;
export function WebsiteEditor({ initial, categories }: { initial: EditorState; categories: { name: string; slug: string }[] }) {
  const [saved, setSaved] = useState(initial);
  const [content, setContent] = useState<EditableContent>(() => structuredClone(initial.content));
  const [tab, setTab] = useState<typeof tabs[number]>("Homepage");
  const [page, setPage] = useState<typeof PAGE_KEYS[number]>("about");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const dirty = JSON.stringify(content) !== JSON.stringify(saved.content);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function run(action: () => Promise<EditorResult>) {
    if (pending) return;
    setPending(true); setMessage("");
    try { const result = await action(); setFailed(!result.ok); setMessage(result.message); if (result.ok) { setSaved(result.state); setContent(structuredClone(result.state.content)); } }
    catch { setFailed(true); setMessage("The request failed. Your edits are still here; try again."); }
    finally { setPending(false); }
  }
  const revisions = { draftRevision: saved.draftRevision, publishedRevision: saved.publishedRevision };
  function field(path: string, title: string) {
    const parts = path.split(".");
    let value: unknown = content;
    for (const part of parts) value = (value as Record<string, unknown>)[part];
    return <section key={path} className="min-w-0 rounded-2xl border border-line bg-white p-4 sm:p-6"><h2 className="mb-5 font-serif text-2xl">{title}</h2><ContentField value={value as Value} path={path} title={title} categories={categories} onChange={(next) => setContent((current) => {
      const copy = structuredClone(current); let parent = copy as unknown as Record<string, unknown>;
      for (const part of parts.slice(0, -1)) parent = parent[part] as Record<string, unknown>;
      parent[parts.at(-1)!] = next; return copy;
    })} /></section>;
  }
  return <div className="min-w-0 space-y-5">
    <div className="sticky top-0 z-20 rounded-2xl border border-line bg-cream/95 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{dirty ? "Unsaved changes" : saved.hasDraft ? "Draft saved" : "Published version"}</p><p className="mt-1 text-xs text-stone">Save → Preview → Publish. Product and order management stay in their own pages.</p></div><Link href="/admin/media" className="text-sm underline underline-offset-4">Manage images</Link></div>
      <div className="mt-4 flex flex-wrap gap-2"><Button type="button" size="sm" loading={pending} onClick={() => void run(() => saveWebsiteDraftAction({ ...revisions, content }))} disabled={!dirty && saved.hasDraft}>Save draft</Button>
      <form action={startWebsitePreviewAction}><Button type="submit" variant="secondary" size="sm" disabled={pending || dirty || !saved.hasDraft}>Preview saved draft</Button></form>
      <Button type="button" variant="secondary" size="sm" disabled={pending || dirty || !saved.hasDraft} onClick={() => { if (window.confirm("Publish the saved draft to your website? The current version will be kept in history.")) void run(() => publishWebsiteAction(revisions)); }}>Publish saved draft</Button>
      <Button type="button" variant="ghost" size="sm" disabled={pending || !saved.hasDraft} onClick={() => { if (window.confirm("Discard the saved draft and your unsaved edits? Your published website will stay as it is.")) void run(() => discardWebsiteDraftAction(revisions)); }}>Discard draft</Button></div>
    </div>
    {message && <p role={failed ? "alert" : "status"} className={`rounded-xl border p-4 text-sm ${failed ? "border-sale/30 text-sale" : "border-success/30 text-success"}`}>{message}</p>}
    <div role="tablist" aria-label="Website editor sections" className="flex flex-wrap gap-2">{tabs.map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`min-h-11 rounded-xl border px-4 py-2 text-sm ${tab === item ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>{item}</button>)}</div>
    <div role="tabpanel" aria-label={tab} className="min-w-0 space-y-5">
      {tab === "Homepage" && <>{field("announcement", "Announcement bar")}<p className="text-xs text-stone">Automatic delivery text follows Delivery & payment. Turn it off to write a custom announcement.</p>{field("hero", "Main banner text and image")}{field("website.home", "Homepage layout and sections")}{field("promo", "Promotion text and button")}</>}
      {tab === "Pages" && <><label className="block space-y-2 text-sm font-medium">Choose a page<select value={page} onChange={(event) => setPage(event.target.value as typeof page)} className={inputClass}>{PAGE_KEYS.map((key) => <option key={key} value={key}>{label(key)}</option>)}</select></label>{field(`website.pages.${page}`, `${label(page)} page`)}{page === "faq" && field("website.faq", "Questions and answers")}<p className="text-xs leading-5 text-stone">Useful text shortcuts: {"{{storeName}}, {{whatsapp}}, {{address}}, {{deliveryFees}}, {{deliveryTimelines}}"}. They use your current settings.</p></>}
      {tab === "Navigation" && field("website.navigation", "Website navigation")}
      {tab === "Brand & contact" && <>{field("website.brand", "Brand, contact details and colours")}{field("website.assistance", "Help panel")}</>}
      {tab === "Footer" && <>{field("website.footer", "Footer layout and links")}{field("business.footerTagline", "Footer description")}{field("business.footerPaymentNote", "Footer payment note")}</>}
      {tab === "Delivery & payment" && <>{field("delivery", "Delivery fees and timelines")}{field("business", "Payment instructions and store copy")}<p className="text-xs text-stone">Draft previews do not change order pricing, delivery charges or payment instructions. These settings take effect after publishing.</p></>}
      {tab === "Version history" && <section className="rounded-2xl border border-line bg-white p-5"><h2 className="font-serif text-2xl">Previous published versions</h2><p className="mt-2 text-sm text-stone">Restore loads a version into the draft. It does not publish it. The most recent 15 published versions are kept.</p>{saved.history.map((version) => <div key={version.revision} className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4"><p className="text-sm">{version.savedAt ? new Date(version.savedAt).toLocaleString() : "Original website"}<span className="block text-xs text-stone">{version.savedBy}</span></p><Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => { if ((!dirty && !saved.hasDraft) || window.confirm("Replace your current draft with this version?")) void run(() => restoreWebsiteAction({ ...revisions, revision: version.revision })); }}>Restore as draft</Button></div>)}{!saved.history.length && <p className="mt-5 text-sm text-stone">Your current version will be kept here when you first publish.</p>}</section>}
    </div>
  </div>;
}

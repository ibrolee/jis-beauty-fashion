"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/image-uploader";
import { isReactActionField } from "@/lib/form-action-fields";
import { Button } from "@/components/ui/button";
import { PAGE_KEYS, newHomeSection, type EditableContent, type EditorState } from "@/lib/website-content";
import { discardWebsiteDraftAction, publishWebsiteAction, restoreWebsiteAction, saveWebsiteDraftAction, startWebsitePreviewAction, type EditorResult } from "@/lib/actions/website";

type Value = string | number | boolean | Value[] | { [key: string]: Value };
const inputClass = "min-h-11 w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none disabled:bg-ivory disabled:text-stone";
const names: Record<string, string> = {
  eyebrow: "Small heading (optional)", href: "Where should this link open?", primaryHref: "Where the main button goes", secondaryHref: "Where the second button goes", buttonHref: "Where the button goes",
  primaryCta: "Main button words", secondaryCta: "Second button words", buttonLabel: "Words on the button", label: "Menu name", subheadline: "Short introduction", cta: "Button words",
  headline: "Main heading", title: "Heading", intro: "Introduction", image: "Photo", enabled: "Show on website", autoDeliveryText: "Show delivery offer automatically",
  includeCategories: "Show product categories in the menu", hideEmptyCategories: "Hide categories with no products", brandLine: "Small line below the banner",
  source: "Which products should appear?", categorySlug: "Choose a collection", limit: "Number of products", tone: "Section background",
  sections: "More information on this page", quickLinks: "Shopping shortcuts", regionalStates: "Nearby states", freeDeliveryThreshold: "Free Lagos delivery when a customer spends (₦)",
  interstateFreeDeliveryThreshold: "Free delivery outside Lagos from (₦)", lagosFee: "Lagos delivery charge (₦)", regionalFee: "Delivery charge for nearby states (₦)", defaultFee: "Delivery charge for other states (₦)",
  lagosEta: "Delivery time within Lagos", regionalEta: "Delivery time to nearby states", defaultEta: "Delivery time to other states",
  logo: "Business logo", shareImage: "Photo shown when someone shares the website", primaryColor: "Main website colour", accentColor: "Second website colour",
  question: "Question", answer: "Answer", body: "Description", shortName: "Short business name", whatsapp: "WhatsApp number", phone: "Phone number", instagram: "Instagram username", tiktok: "TikTok username",
  bankName: "Bank name", bankAccountName: "Account name", bankAccountNumber: "Account number", footerTagline: "Short footer description", footerPaymentNote: "Payment note",
  showNewsletter: "Show email signup", name: "Business name", subtitle: "Small description", sortOrder: "Display order",
};
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
    if (["image", "logo", "shareImage"].includes(key)) return <div className="min-w-0 space-y-2"><p className="text-sm font-medium">{title}</p><ImageUploader name={null} maxImages={1} value={value ? [String(value)] : []} onChange={(urls) => onChange(urls[0] ?? "")} /><details className="rounded-lg border border-line/70 p-3"><summary className="cursor-pointer text-xs text-stone">Use a photo link instead (optional)</summary><label htmlFor={id} className="mt-3 block text-xs text-stone">Photo link</label><input id={id} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} /></details></div>;
    return <div className="min-w-0 space-y-2"><label className="block text-sm font-medium" htmlFor={id}>{title}</label>
      {choices ? <select id={id} className={inputClass} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{Object.entries(choices).map(([option, name]) => <option key={option} value={option}>{name}</option>)}</select>
        : key === "categorySlug" ? <select id={id} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select a category</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select>
        : (/body|description|intro|answer|instructions|notice|note|tagline/i.test(key) || path.includes(".body.")) ? <textarea id={id} className={`${inputClass} min-h-28`} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
        : <input id={id} className={inputClass} type={typeof value === "number" ? "number" : /color$/i.test(key) ? "color" : "text"} min={typeof value === "number" ? 0 : undefined} value={value} disabled={disabled} onChange={(event) => onChange(typeof value === "number" ? Number(event.target.value) : event.target.value)} />}
      {/href$/i.test(key) && <p className="text-xs text-stone">For a shop button, use /shop. For Contact, use /contact. You can also paste a full website link.</p>}
    </div>;
  }
  if (Array.isArray(value)) return <div className="min-w-0 space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-medium">{title}</h3><button type="button" onClick={() => onChange([...value, addition(path)])} className="min-h-10 rounded-lg border border-line px-3 text-sm">{path === "website.home.sections" ? "Add homepage section" : path === "website.faq" ? "Add question" : /links$/i.test(path) ? "Add link" : path.endsWith("sections") ? "Add page section" : "Add another"}</button></div>
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
  let entries = Object.entries(value).filter(([name]) => name !== "id" && !isReactActionField(name));
  if (path.startsWith("website.home.sections.")) {
    const type = value.type;
    const fields = type === "hero" || type === "promo" ? ["type", "enabled", "title"] : type === "collection" ? ["type", "enabled", "eyebrow", "title", "body", "image", "buttonLabel", "buttonHref", "source", "categorySlug", "limit", "tone"] : type === "newsletter" ? ["type", "enabled", "eyebrow", "title", "body"] : type === "categories" ? ["type", "enabled", "eyebrow", "title", "body", "buttonLabel", "buttonHref"] : ["type", "enabled", "eyebrow", "title", "body", "image", "buttonLabel", "buttonHref", "tone"];
    entries = entries.filter(([name]) => fields.includes(name));
  }
  // Start with the settings a shop owner normally needs. All other options remain available.
  const primaryByPath: Record<string, string[]> = {
    "announcement": ["autoDeliveryText", "enabled", "text", "href"],
    "hero": ["headline", "subheadline", "image", "primaryCta", "primaryHref"],
    "promo": ["headline", "body", "couponCode", "cta", "href"],
    "website.brand": ["name", "logo", "description", "phone", "whatsapp", "email", "instagram", "tiktok", "address"],
    "website.home": ["sections"],
    "website.navigation": ["links", "includeCategories"],
    "website.footer": ["title", "buttonLabel", "buttonHref", "showNewsletter", "copyright"],
    "business": ["bankName", "bankAccountName", "bankAccountNumber", "bankTransferInstructions", "whatsappOrderInstructions"],
  };
  const primary = path.startsWith("website.pages.") && path.split(".").length === 3
    ? ["title", "intro", "image", "sections"]
    : primaryByPath[path];
  const shown = entries.filter(([name]) => !primary || primary.includes(name));
  const extra = primary ? entries.filter(([name]) => !primary.includes(name)) : [];
  const renderEntry = ([name, child]: [string, Value]) =>
    <ContentField key={name} value={child} path={`${path}.${name}`} title={label(name)} categories={categories}
      disabled={path === "announcement" && value.autoDeliveryText === true && ["text", "href"].includes(name)}
      onChange={(next) => onChange({ ...value, [name]: next })} />;
  const main = path === "announcement" && value.autoDeliveryText === true
    ? shown.filter(([name]) => !["text", "href"].includes(name))
    : shown;
  return <div className="min-w-0 space-y-5">
    {main.map(renderEntry)}
    {extra.length > 0 && <details className="rounded-xl border border-line bg-ivory/50 p-4">
      <summary className="cursor-pointer text-sm font-medium">More options (optional)</summary>
      <div className="mt-4 space-y-5">{extra.map(renderEntry)}</div>
    </details>}
  </div>;
}

const tabs = ["Home page", "Other pages", "Menus", "Business details", "Delivery & payments", "More settings", "Previous versions"] as const;
const pageNames: Record<string, string> = {
  about: "About our business", contact: "Contact us", faq: "Frequently asked questions", shipping: "Shipping & delivery", returns: "Returns & refunds",
  privacy: "Privacy policy", terms: "Terms & conditions", shop: "Shop page", collections: "Collections page", blog: "Blog page",
};
export function WebsiteEditor({ initial, categories }: { initial: EditorState; categories: { name: string; slug: string }[] }) {
  const [saved, setSaved] = useState(initial);
  const [content, setContent] = useState<EditableContent>(() => structuredClone(initial.content));
  const [tab, setTab] = useState<typeof tabs[number]>("Home page");
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
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-2 lg:z-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-semibold text-ink">{dirty ? "Changes not saved yet" : saved.hasDraft ? "Saved — not on the website yet" : "Your website is up to date"}</p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-stone">Save, check how it looks, then publish when you are happy.</p>
        </div>
        <Link href="/admin/media" className="min-h-10 rounded-lg border border-line px-3 py-2 text-xs font-medium">My photos</Link>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Button type="button" size="sm" loading={pending} onClick={() => void run(() => saveWebsiteDraftAction({ ...revisions, content }))} disabled={!dirty}>1. Save changes</Button>
        <form action={startWebsitePreviewAction} className="min-w-0"><Button type="submit" variant="secondary" size="sm" disabled={pending || dirty || !saved.hasDraft}>2. Preview changes</Button></form>
        <Button type="button" variant="secondary" size="sm" disabled={pending || dirty || !saved.hasDraft} onClick={() => { if (window.confirm("Make these saved changes visible to everyone visiting your website?")) void run(() => publishWebsiteAction(revisions)); }}>3. Publish to website</Button>
      </div>
      {saved.hasDraft && <button type="button" className="mt-3 text-xs text-stone underline underline-offset-4" disabled={pending} onClick={() => { if (window.confirm("Discard your saved and unsaved changes? Your public website will stay as it is.")) void run(() => discardWebsiteDraftAction(revisions)); }}>Discard saved changes</button>}
    </div>
    {message && <p role={failed ? "alert" : "status"} className={failed ? "rounded-xl border border-sale/30 p-4 text-sm text-sale" : "rounded-xl border border-success/30 p-4 text-sm text-success"}>{message}</p>}
    <section aria-label="Choose what to edit">
      <h2 className="mb-3 font-serif text-2xl">What would you like to change?</h2>
      <div role="tablist" aria-label="Website editor sections" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {tabs.map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={tab === item ? "min-h-12 rounded-xl border border-ink bg-ink p-3 text-left text-sm font-medium text-white" : "min-h-12 rounded-xl border border-line bg-white p-3 text-left text-sm font-medium text-ink hover:border-ink"}>{item}</button>)}
      </div>
    </section>
    <div role="tabpanel" aria-label={tab} className="min-w-0 space-y-5">
      {tab === "Home page" && <>
        <p className="text-sm leading-6 text-stone">Change the main photo, heading and buttons people see when they open your website.</p>
        {field("hero", "Main homepage photo and words")}
        <details className="rounded-2xl border border-line bg-white p-4 sm:p-6"><summary className="cursor-pointer font-serif text-xl">Message at the top of the website</summary><div className="mt-5">{field("announcement", "Top message")}</div><p className="mt-3 text-xs text-stone">To write a custom message, untick “Show delivery offer automatically”.</p></details>
        <details className="rounded-2xl border border-line bg-white p-4 sm:p-6"><summary className="cursor-pointer font-serif text-xl">Choose homepage sections</summary><p className="mt-3 text-sm text-stone">Open a section to change it. Untick “Show on website” to hide it without deleting it. You can change their order too.</p><div className="mt-5">{field("website.home.sections", "Your homepage sections")}</div></details>
        <details className="rounded-2xl border border-line bg-white p-4 sm:p-6"><summary className="cursor-pointer font-serif text-xl">Shopping links and special offers</summary><div className="mt-5 space-y-4">{field("website.home.quickLinks", "Shopping shortcuts")}{field("website.home.brandLine", "Small caption")}{field("promo", "Special offer")}</div></details>
      </>}
      {tab === "Other pages" && <>
        <p className="text-sm text-stone">Choose a page, edit the words and photos, and save when you finish.</p>
        <label className="block rounded-xl border border-line bg-white p-4 text-sm font-medium">Which page do you want to edit?
          <select value={page} onChange={(event) => setPage(event.target.value as typeof page)} className={inputClass + " mt-2"}>
            {PAGE_KEYS.map((key) => <option key={key} value={key}>{pageNames[key] ?? label(key)}</option>)}
          </select>
        </label>
        {field("website.pages." + page, pageNames[page] ?? label(page))}
        {page === "faq" && field("website.faq", "Questions and answers")}
      </>}
      {tab === "Menus" && <>
        <p className="text-sm text-stone">Choose the pages and collections customers can find in the menu.</p>
        {field("website.navigation", "Main website menu")}
        {field("website.home.quickLinks", "Quick shopping links")}
      </>}
      {tab === "Business details" && <>
        <p className="text-sm text-stone">Update the business logo, phone, WhatsApp, address and social media accounts.</p>
        {field("website.brand", "Your business information")}
        <details className="rounded-2xl border border-line bg-white p-4"><summary className="cursor-pointer text-sm font-medium">Customer help message</summary><div className="mt-4">{field("website.assistance", "Help message")}</div></details>
      </>}
      {tab === "Delivery & payments" && <>
        <p className="text-sm text-stone">Set delivery prices, delivery times and the bank account shown to customers.</p>
        {field("delivery", "Delivery charges and times")}
        {field("business", "Payment details")}
        <p className="text-xs leading-5 text-stone">Changes to bank details and delivery charges only affect new orders after publishing. Double-check the bank account before publishing.</p>
      </>}
      {tab === "More settings" && <>
        <p className="text-sm text-stone">Extra settings for the bottom of your website. You can change them whenever you need.</p>
        {field("website.footer", "Bottom of the website")}
        {field("business.footerTagline", "Short description at the bottom")}
        {field("business.footerPaymentNote", "Payment note at the bottom")}
      </>}
      {tab === "Previous versions" && <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-serif text-2xl">Undo an older website change</h2>
        <p className="mt-2 text-sm text-stone">Bring back an older version to review. It will not be public until you publish.</p>
        {saved.history.map((version) => <div key={version.revision} className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <p className="text-sm">{version.savedAt ? new Date(version.savedAt).toLocaleString() : "Original website"}<span className="block text-xs text-stone">{version.savedBy}</span></p>
          <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => { if ((!dirty && !saved.hasDraft) || window.confirm("Replace your current saved changes with this older version?")) void run(() => restoreWebsiteAction({ ...revisions, revision: version.revision })); }}>Bring back this version</Button>
        </div>)}
        {!saved.history.length && <p className="mt-5 text-sm text-stone">Older versions will appear here after your first update.</p>}
      </section>}
    </div>
  </div>;
}

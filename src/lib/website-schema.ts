import { z } from "zod";
import { DEFAULT_SITE_CONTENT } from "@/lib/site-content";
import type { EditableContent } from "@/lib/website-content";

export function safeDestination(value: string, image = false): boolean {
  if (!value) return true;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (!image && /^#[A-Za-z0-9_-]+$/.test(value)) return true;
  if (!image && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  if (!image && /^tel:\+?[\d ()-]{7,24}$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}

function shape(value: unknown, path: string): z.ZodType {
  const key = path.split(".").at(-1) ?? "";
  if (typeof value === "boolean") return z.boolean();
  if (typeof value === "number") return key === "limit" ? z.number().int().min(1).max(12) : z.number().int().min(0).max(100_000_000);
  if (typeof value === "string") {
    let schema = z.string().max(12_000);
    if (/color$/i.test(key)) schema = schema.regex(/^#[0-9a-f]{6}$/i, "Choose a valid colour");
    if (["image", "logo", "shareImage"].includes(key)) return schema.refine((text) => safeDestination(text, true), "Use an uploaded image or HTTPS image URL");
    if (/href$/i.test(key)) return schema.refine((text) => safeDestination(text), "Use a page path, HTTPS link, email or phone link");
    if (key === "email") return schema.refine((text) => !text || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text), "Enter a valid email address");
    if (["phone", "whatsapp"].includes(key)) return schema.refine((text) => !text || /^\+?[\d ()-]{7,24}$/.test(text), "Enter a phone number including its country code");
    if (["instagram", "tiktok"].includes(key)) return schema.regex(/^@?[a-zA-Z0-9._]{0,40}$/, "Enter the account handle, without a website URL");
    if (key === "type" && path.includes("home.sections")) return z.enum(["hero", "categories", "collection", "editorial", "newsletter", "promo", "text"]);
    if (key === "source") return z.enum(["newArrivals", "bestSellers", "category"]);
    if (key === "tone") return z.enum(["white", "ivory"]);
    if (key === "id") return schema.min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/);
    if (key === "categorySlug") return schema.max(140).regex(/^[a-z0-9-]*$/);
    return schema;
  }
  if (Array.isArray(value)) {
    const sample = value[0] ?? (key === "sections" ? { title: "", body: [""] } : "");
    return z.array(shape(sample, `${path}[]`)).max(key === "sections" ? 40 : 60);
  }
  return z.object(Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([name, child]) => [name, shape(child, path ? `${path}.${name}` : name)]))).strict();
}

export function editableContent(content = DEFAULT_SITE_CONTENT): EditableContent {
  const { blog: _blog, ...editable } = content;
  void _blog;
  return structuredClone(editable);
}

const template = editableContent();
template.announcement.autoDeliveryText = true;
export const editableContentSchema = (shape(template, "") as z.ZodType<EditableContent>).superRefine((content, ctx) => {
  const sections = content.website.home.sections;
  for (const [key, page] of Object.entries(content.website.pages)) if (!page.title.trim()) ctx.addIssue({ code: "custom", path: ["website", "pages", key, "title"], message: "Page title is required" });
  if (sections.some((section) => section.type === "hero" && section.enabled) && !content.hero.headline.trim()) ctx.addIssue({ code: "custom", path: ["hero", "headline"], message: "The visible main banner needs a heading" });
  if (new Set(sections.map((section) => section.id)).size !== sections.length) ctx.addIssue({ code: "custom", path: ["website", "home", "sections"], message: "Each homepage section must have its own identity. Remove a duplicated section and add it again." });
  for (const type of ["hero", "promo"]) if (sections.filter((section) => section.type === type).length > 1) ctx.addIssue({ code: "custom", path: ["website", "home", "sections"], message: `Use only one ${type === "hero" ? "main banner" : "promotion"} section.` });
  if (!content.website.brand.whatsapp.trim()) ctx.addIssue({ code: "custom", path: ["website", "brand", "whatsapp"], message: "WhatsApp number is required for order payment and support" });
  for (const [index, link] of content.website.navigation.links.entries()) if (link.enabled && (!link.label.trim() || !link.href.trim())) ctx.addIssue({ code: "custom", path: ["website", "navigation", "links", index], message: "Visible menu links need a label and destination" });
  if (!content.website.brand.name.trim()) ctx.addIssue({ code: "custom", path: ["website", "brand", "name"], message: "Store name is required" });
});

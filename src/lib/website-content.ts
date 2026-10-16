import { SITE } from "@/lib/constants";
import { FAQ_ITEMS, PRIVACY_SECTIONS, RETURNS_SECTIONS, TERMS_SECTIONS } from "@/content/policies";
import type { SiteContent } from "@/lib/site-content";

export type NavItem = { label: string; href: string; enabled: boolean };
export type PageSection = { title: string; body: string[] };
export type PageContent = { eyebrow: string; title: string; intro: string; image: string; buttonLabel: string; buttonHref: string; sections: PageSection[] };
export type BrandContent = {
  name: string; shortName: string; tagline: string; description: string; logo: string; shareImage: string;
  email: string; phone: string; whatsapp: string; instagram: string; tiktok: string; address: string;
  primaryColor: string; accentColor: string;
};
export type HomeSection = {
  id: string; type: "hero" | "categories" | "collection" | "editorial" | "newsletter" | "promo" | "text";
  enabled: boolean; eyebrow: string; title: string; body: string; image: string;
  buttonLabel: string; buttonHref: string; source: "newArrivals" | "bestSellers" | "category";
  categorySlug: string; limit: number; tone: "white" | "ivory";
};
export const PAGE_KEYS = ["about", "contact", "faq", "shipping", "returns", "privacy", "terms", "shop", "collections", "blog"] as const;
export type PageKey = typeof PAGE_KEYS[number];
export type WebsiteContent = {
  brand: BrandContent;
  navigation: { includeCategories: boolean; hideEmptyCategories: boolean; links: NavItem[] };
  home: { quickLinks: NavItem[]; brandLine: string; sections: HomeSection[] };
  pages: Record<PageKey, PageContent>;
  faq: { question: string; answer: string }[];
  footer: {
    enabled: boolean; eyebrow: string; title: string; buttonLabel: string; buttonHref: string;
    shopTitle: string; shopLinks: NavItem[]; includeCategories: boolean; helpTitle: string; companyTitle: string; helpLinks: NavItem[]; companyLinks: NavItem[];
    showNewsletter: boolean; newsletterEyebrow: string; newsletterTitle: string; newsletterBody: string; copyright: string;
  };
  assistance: { eyebrow: string; title: string; body: string };
};
export type EditableContent = Omit<SiteContent, "blog">;
export type ContentVersion = { revision: string; content: EditableContent; savedAt: string; savedBy: string };
export type ContentDraft = ContentVersion & { baseRevision: string };
export type EditorState = { content: EditableContent; publishedRevision: string; draftRevision: string; history: Pick<ContentVersion, "revision" | "savedAt" | "savedBy">[]; hasDraft: boolean };

const policySections = (sections: PageSection[]): PageSection[] => sections.map((section) => ({ ...section, body: section.body.map((text) => text.replaceAll("0904 233 6294", "{{whatsapp}}").replaceAll("JIS Beauty & Fashion", "{{storeName}}").replaceAll("Lagos, Nigeria", "{{address}}").replace("Interstate delivery is free from a ₦50,000 product subtotal; Lagos delivery is free from ₦150,000, before discounts.", "{{deliveryFees}}").replace("GitHub scheduled checks can run late", "scheduled checks can run late")) }));

const links = (items: [string, string][]): NavItem[] => items.map(([label, href]) => ({ label, href, enabled: true }));
const page = (title: string, intro = "", sections: PageSection[] = [], image = ""): PageContent => ({ eyebrow: "Help centre", title, intro, image, buttonLabel: "", buttonHref: "", sections });
export function newHomeSection(type: HomeSection["type"] = "text", id = "new-section"): HomeSection {
  return { id, type, enabled: true, eyebrow: "", title: "New section", body: "", image: "", buttonLabel: "View all", buttonHref: "/shop", source: "category", categorySlug: "women", limit: 4, tone: "white" };
}
const collection = (id: string, title: string, source: HomeSection["source"], categorySlug = "", eyebrow = "", tone: HomeSection["tone"] = "white") => ({ ...newHomeSection("collection", id), title, source, categorySlug, eyebrow, tone, buttonHref: categorySlug ? `/shop/${categorySlug}` : source === "newArrivals" ? "/shop?newArrivals=1&sort=newest" : "/shop?bestSellers=1" });

export const DEFAULT_WEBSITE_CONTENT: WebsiteContent = {
  brand: { name: SITE.name, shortName: SITE.shortName, tagline: SITE.tagline, description: SITE.description, logo: "/images/jis-logo.PNG", shareImage: "/catalog/category-women-v2.jpg", email: "", phone: SITE.phone, whatsapp: SITE.whatsapp, instagram: SITE.instagram, tiktok: SITE.tiktok, address: SITE.address, primaryColor: "#28111f", accentColor: "#b72e73" },
  navigation: { includeCategories: true, hideEmptyCategories: false, links: links([["Shop All", "/shop"], ["Blog", "/blog"], ["About", "/about"]]) },
  home: {
    quickLinks: links([["For her", "/shop/women"], ["For him", "/shop/men"], ["Unisex", "/shop/unisex"], ["Perfume oils", "/shop/perfume-oils"], ["Body sprays", "/shop/body-sprays-deodorants"]]),
    brandLine: "JIS Beauty & Fashion · Lagos, Nigeria",
    sections: [
      { ...newHomeSection("hero", "hero"), title: "Main banner" },
      { ...newHomeSection("categories", "collections"), eyebrow: "Shop by mood / 01", title: "Your scent wardrobe, in full colour.", body: "Move from soft florals to deep woods, playful everyday sprays and concentrated oils without digging through endless menus.", buttonLabel: "See all collections", buttonHref: "/categories" },
      collection("new-arrivals", "New scents, new moods", "newArrivals", "", "Fresh on the shelf / 02"),
      { ...newHomeSection("editorial", "story"), eyebrow: "Wear the feeling", title: "A scent can change the whole energy.", body: "The last detail before you step out. The memory someone keeps after you leave. JIS brings together fragrance and beauty finds for every version of your style — soft, playful, polished, bold or completely your own.", image: "/catalog/category-unisex-v2.jpg", buttonLabel: "Discover our story", buttonHref: "/about" },
      collection("best-sellers", "The bottles everyone notices", "bestSellers", "", "Most wanted / 03", "ivory"),
      { ...collection("women", "The women's fragrance edit", "category", "women", "Soft, bold, unforgettable", "ivory"), enabled: false },
      { ...collection("men", "The men's fragrance edit", "category", "men", "Clean, deep, confident"), enabled: false },
      { ...collection("unisex", "Unisex favourites", "category", "unisex", "No labels, just good scent", "ivory"), enabled: false },
      { ...collection("body-sprays", "Body sprays & deodorants", "category", "body-sprays-deodorants", "Easy everyday energy"), enabled: false },
      { ...collection("kids", "Kids' fragrances", "category", "kids", "Small scents, big personality"), enabled: false },
      { ...collection("oils", "Perfume oils", "category", "perfume-oils", "A little goes a long way", "ivory"), enabled: false },
      { ...newHomeSection("newsletter", "newsletter"), enabled: false, eyebrow: "Newsletter", title: "First to know. Always.", body: "New arrivals, restock alerts and subscriber-only offers, once or twice a month." },
      { ...newHomeSection("promo", "promotion"), enabled: false, title: "Final promotion" },
    ],
  },
  pages: {
    about: { ...page("Beauty is personal. So is fragrance.", "JIS Beauty & Fashion is a Lagos-based fragrance destination, bringing together perfumes and perfume oils for women, men, unisex wearers and children. We believe finding your next scent should be an enjoyable part of expressing your own style.", [
      { title: "Curated with intention", body: ["Explore a considered mix of fragrances and perfume oils for different tastes, occasions and budgets."] },
      { title: "Your style, your scent", body: ["Whether you prefer something soft and understated or a bold statement, the choice should feel like yours."] },
      { title: "A personal connection", body: ["Questions about a fragrance or an order? Our WhatsApp channel is available for a direct conversation."] },
      { title: "This is only the beginning.", body: ["Fragrance is at the heart of our current collection. As JIS evolves, we hope to bring more beauty and fashion discoveries into the mix."] },
    ], "/images/about.jpg"), eyebrow: "Our story", buttonLabel: "Explore the collection", buttonHref: "/shop" },
    contact: page("We’d love to hear from you.", "Need help choosing a fragrance, checking on an order or finding the right gift? Send us a message.", [{ title: "Send a message", body: ["Fill in the form and we’ll respond through your supplied contact details."] }]),
    faq: page("Good to know.", "Answers to common questions about shopping, paying and receiving your JIS order."),
    shipping: page("Shipping & delivery", "Fast, careful delivery from Lagos to every state in Nigeria.", [{ title: "Delivery timelines", body: ["Orders placed before 2pm (Mon–Sat) are dispatched the same day. {{deliveryTimelines}}"] }, { title: "Delivery fees", body: ["{{deliveryFees}} Free-delivery eligibility uses the product subtotal before coupon discounts."] }, { title: "Failed deliveries", body: ["Our courier will attempt delivery twice and call the number on the order. Contact us if you need to arrange another delivery."] }]),
    returns: page("Returns & refunds", "We want you to love what you ordered. Here's how we make things right if you don't.", policySections(RETURNS_SECTIONS as PageSection[])),
    privacy: { ...page("Privacy policy", "Your privacy matters to us. This policy explains what we collect and why.", policySections(PRIVACY_SECTIONS as PageSection[])), eyebrow: "Legal" },
    terms: { ...page("Terms & conditions", "", policySections(TERMS_SECTIONS as PageSection[])), eyebrow: "Legal" },
    shop: page("Shop all", "Every fragrance and perfume oil in one place. Use the filters to find your signature scent."),
    collections: page("Pick a mood. Meet your scent.", "Every collection is a shortcut to the feeling you want — soft, bold, playful, effortless or unforgettable."),
    blog: page("The fragrance journal.", "Fragrance tips, care notes and JIS updates for finding and keeping your signature scent."),
  },
  faq: FAQ_ITEMS.map(({ q, a }) => ({ question: q, answer: q === "How much is delivery?" ? "{{deliveryFees}} Free-delivery eligibility uses the product subtotal before discounts." : q === "How long does delivery take?" ? "{{deliveryTimelines}} Contact us on WhatsApp for an update." : a.replace("0904 233 6294", "{{whatsapp}}") })),
  footer: {
    enabled: true, eyebrow: "The JIS edit", title: "Find your next signature.", buttonLabel: "Explore the collection", buttonHref: "/shop", shopTitle: "Shop", shopLinks: links([["All products", "/shop"]]), includeCategories: true, helpTitle: "Help", companyTitle: "JIS",
    helpLinks: links([["Contact us", "/contact"], ["Frequently asked questions", "/faq"], ["Shipping & delivery", "/shipping"], ["Returns & refunds", "/returns"], ["Track my order", "/account/orders"]]),
    companyLinks: links([["Our story", "/about"], ["All collections", "/categories"], ["Privacy policy", "/privacy"], ["Terms & conditions", "/terms"]]),
    showNewsletter: true, newsletterEyebrow: "Notes from JIS", newsletterTitle: "Stay in the loop.", newsletterBody: "Be the first to hear about new arrivals, restocks and special offers.", copyright: "All rights reserved.",
  },
  assistance: { eyebrow: "Personal assistance", title: "We’re here to help.", body: "Questions about a product, payment or delivery? Reach our team using any of the options below." },
};

export function brandLinks(brand: BrandContent) {
  let phone = brand.whatsapp.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = `234${phone.slice(1)}`;
  return { ...brand, whatsappUrl: phone ? `https://wa.me/${phone}` : "", instagramUrl: brand.instagram ? `https://instagram.com/${brand.instagram.replace(/^@/, "")}` : "", tiktokUrl: brand.tiktok ? `https://tiktok.com/@${brand.tiktok.replace(/^@/, "")}` : "" };
}

export function navigationLinks(website: WebsiteContent, categories: { id: number; name: string; slug: string; isActive: boolean; sortOrder: number; productCount: number }[]) {
  const categoryLinks = website.navigation.includeCategories ? categories.filter((c) => c.isActive && (!website.navigation.hideEmptyCategories || c.productCount > 0)).sort((a, b) => a.sortOrder - b.sortOrder).map((c) => ({ label: c.name, href: `/shop/${c.slug}`, enabled: true })) : [];
  const custom = website.navigation.links.filter((item) => item.enabled);
  const combined = [...custom.slice(0, 1), ...categoryLinks, ...custom.slice(1)];
  return combined.filter((link, index) => combined.findIndex((item) => item.href === link.href) === index);
}

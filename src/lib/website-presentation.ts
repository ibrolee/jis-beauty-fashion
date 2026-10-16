import { deliveryFeeSentence, deliveryTimelineSentence } from "@/lib/delivery-copy";
import type { SiteContent } from "@/lib/site-content";
import type { PageContent } from "@/lib/website-content";
export function websiteText(text: string, content: SiteContent) {
  const values: Record<string, string> = { storeName: content.website.brand.name, whatsapp: content.website.brand.whatsapp, address: content.website.brand.address, deliveryFees: deliveryFeeSentence(content.delivery), deliveryTimelines: deliveryTimelineSentence(content.delivery) };
  return text.replace(/\{\{(storeName|whatsapp|address|deliveryFees|deliveryTimelines)\}\}/g, (token, key) => values[key] ?? token);
}
export function websitePage(page: PageContent, content: SiteContent): PageContent {
  return { ...page, title: websiteText(page.title, content), intro: websiteText(page.intro, content), sections: page.sections.map((section) => ({ title: websiteText(section.title, content), body: section.body.map((paragraph) => websiteText(paragraph, content)) })) };
}

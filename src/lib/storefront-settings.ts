import type { Category } from "@/db/schema";
import type { DeliverySettings } from "@/lib/constants";
import type { AnnouncementContent } from "@/lib/site-content";

/** Both menus read the owner's published category list in the same order. */
export function getCategoryLinks(categories: Pick<Category, "id" | "name" | "slug" | "isActive" | "sortOrder">[]) {
  return categories
    .filter((category) => category.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((category) => ({ id: category.id, label: category.name, href: `/shop/${category.slug}` }));
}

export function deliveryAnnouncement(delivery: DeliverySettings) {
  const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
  if (delivery.freeDeliveryThreshold === delivery.interstateFreeDeliveryThreshold) {
    return `Free nationwide delivery from ${naira(delivery.freeDeliveryThreshold)}`;
  }
  return `Free Lagos delivery from ${naira(delivery.freeDeliveryThreshold)} · Free interstate delivery from ${naira(delivery.interstateFreeDeliveryThreshold)}`;
}

/** Upgrade known old shipping messages without overwriting custom promotions. */
export function resolveAnnouncement(content: AnnouncementContent, delivery: DeliverySettings): AnnouncementContent {
  const oldMessages = [
    "Free Delivery in Lagos for orders above #50,000",
    "Free Delivery in Lagos for orders above ₦50,000",
    "Free delivery on orders above ₦150,000",
    "Free delivery on orders above ₦150,000 · Use code JISWELCOME for 5% off",
    "Free interstate delivery from ₦50,000 · Use code JISWELCOME for 5% off",
    "Free interstate delivery from ₦50,000 · Free Lagos delivery from ₦150,000",
  ];
  const legacyDeliveryMessage = oldMessages.some((text) => text.toLowerCase() === content.text.trim().toLowerCase());
  const autoDeliveryText = content.autoDeliveryText ?? legacyDeliveryMessage;
  return autoDeliveryText
    ? { ...content, autoDeliveryText, text: deliveryAnnouncement(delivery), href: "/shipping" }
    : { ...content, autoDeliveryText };
}

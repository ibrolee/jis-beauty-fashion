import type { InfoSection } from "@/components/info/info-page";
import { FAQ_ITEMS } from "@/content/policies";
import type { DeliverySettings } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

function regionalLabel(delivery: DeliverySettings) {
  return delivery.regionalStates.length ? delivery.regionalStates.join(", ") : "selected nearby states";
}

export function deliveryFeeSentence(delivery: DeliverySettings) {
  return `Below the free-delivery threshold, delivery costs ${formatNaira(delivery.lagosFee)} within Lagos, ${formatNaira(delivery.regionalFee)} to ${regionalLabel(delivery)}, and ${formatNaira(delivery.defaultFee)} to other states. Interstate delivery outside Lagos is free from ${formatNaira(delivery.interstateFreeDeliveryThreshold)}. Lagos delivery is free from ${formatNaira(delivery.freeDeliveryThreshold)}.`;
}

export function deliveryTimelineSentence(delivery: DeliverySettings) {
  return `Lagos orders are estimated at ${delivery.lagosEta}. ${regionalLabel(delivery)} orders are estimated at ${delivery.regionalEta}, and other Nigerian states are estimated at ${delivery.defaultEta}.`;
}

export function getShippingSections(delivery: DeliverySettings): InfoSection[] {
  return [
    {
      title: "Delivery timelines",
      body: [
        `Orders placed before 2pm (Mon-Sat) are dispatched the same day. ${deliveryTimelineSentence(delivery)}`,
        "Timelines may extend during public holidays, sales periods or severe weather. Message us on WhatsApp if you need an update.",
      ],
    },
    {
      title: "Delivery fees",
      body: [
        `${deliveryFeeSentence(delivery)} Free-delivery eligibility uses the product subtotal before coupon discounts.`,
      ],
    },
    {
      title: "Failed deliveries",
      body: ["Our courier will attempt delivery twice and call the number on the order. If both attempts fail, the package returns to us and a re-delivery fee may apply."],
    },
  ];
}

export function getFaqItems(delivery: DeliverySettings) {
  return FAQ_ITEMS.map((item) => {
    if (item.q === "How long does delivery take?") return { ...item, a: `${deliveryTimelineSentence(delivery)} Contact us on WhatsApp if you need an update.` };
    if (item.q === "How much is delivery?") return { ...item, a: `${deliveryFeeSentence(delivery)} Free-delivery eligibility is based on your product subtotal before discounts.` };
    return item;
  });
}

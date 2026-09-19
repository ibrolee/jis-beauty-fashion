import { absoluteUrl, formatNaira } from "@/lib/utils";

type WhatsAppOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  productSlug: string | null;
  variantName?: string | null;
};

/** Build a customer-facing message only from server-validated order data. */
export function whatsappCheckoutMessage(order: {
  orderNumber: string;
  total: number;
  items: WhatsAppOrderItem[];
}): string {
  const lines = [
    "Hello JIS Beauty & Fashion, I want to pay for my order now. Please send me your bank account details.",
    `Order reference: ${order.orderNumber}`,
    "Items:",
    ...order.items.flatMap((item) => [
      `- ${item.name}${item.variantName ? ` (${item.variantName})` : ""} × ${item.quantity} — ${formatNaira(item.unitPrice * item.quantity)}`,
      ...(item.productSlug ? [absoluteUrl(`/product/${encodeURIComponent(item.productSlug)}`)] : []),
    ]),
    `Total to pay: ${formatNaira(order.total)}`,
    `Order details: ${absoluteUrl(`/order/${encodeURIComponent(order.orderNumber)}`)}`,
    "I would like to pay immediately. Thank you.",
  ];

  return lines.join("\n");
}

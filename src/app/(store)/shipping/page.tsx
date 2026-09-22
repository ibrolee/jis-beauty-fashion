import type { Metadata } from "next";
import { ContactAside, InfoPage } from "@/components/info/info-page";
import { getSiteContent } from "@/lib/data/settings";
import { getShippingSections } from "@/lib/delivery-copy";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "JIS Beauty & Fashion delivery across Nigeria: free interstate delivery from ₦50,000 and free Lagos delivery from ₦150,000.",
  alternates: { canonical: "/shipping" },
};

export default async function ShippingPage() {
  const content = await getSiteContent();
  return <InfoPage eyebrow="Help centre" title="Shipping & delivery" intro="Fast, careful delivery from Lagos to every state in Nigeria." sections={getShippingSections(content.delivery)} aside={<ContactAside />} />;
}

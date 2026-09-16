import type { Metadata } from "next";
import { ContactAside, InfoPage } from "@/components/info/info-page";
import { SHIPPING_SECTIONS } from "@/content/policies";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "Delivery timelines and fees for JIS Beauty & Fashion orders across Nigeria. Free delivery on orders above ₦150,000.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return <InfoPage eyebrow="Help centre" title="Shipping & delivery" intro="Fast, careful delivery from Lagos to every state in Nigeria." sections={SHIPPING_SECTIONS} aside={<ContactAside />} />;
}

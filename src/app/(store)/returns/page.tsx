import type { Metadata } from "next";
import { ContactAside, InfoPage } from "@/components/info/info-page";
import { RETURNS_SECTIONS } from "@/content/policies";

export const metadata: Metadata = {
  title: "Returns & Refund Policy",
  description: "How returns, exchanges and refunds work at JIS Beauty & Fashion.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return <InfoPage eyebrow="Help centre" title="Returns & refunds" intro="We want you to love what you ordered. Here's how we make things right if you don't." updated="January 2025" sections={RETURNS_SECTIONS} aside={<ContactAside />} />;
}

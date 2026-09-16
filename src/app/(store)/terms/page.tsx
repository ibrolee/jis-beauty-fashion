import type { Metadata } from "next";
import { InfoPage } from "@/components/info/info-page";
import { TERMS_SECTIONS } from "@/content/policies";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for shopping with JIS Beauty & Fashion.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <InfoPage eyebrow="Legal" title="Terms & conditions" updated="January 2025" sections={TERMS_SECTIONS} />;
}

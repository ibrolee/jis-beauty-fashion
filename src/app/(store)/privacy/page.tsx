import type { Metadata } from "next";
import { InfoPage } from "@/components/info/info-page";
import { PRIVACY_SECTIONS } from "@/content/policies";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How JIS Beauty & Fashion collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <InfoPage eyebrow="Legal" title="Privacy policy" intro="Your privacy matters to us. This policy explains what we collect and why." sections={PRIVACY_SECTIONS} />;
}

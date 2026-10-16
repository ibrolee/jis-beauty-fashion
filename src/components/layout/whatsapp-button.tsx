import { WhatsAppIcon } from "@/components/ui/social-icons";
import { DEFAULT_WEBSITE_CONTENT, brandLinks, type BrandContent } from "@/lib/website-content";

export function WhatsAppButton({ message, brand = DEFAULT_WEBSITE_CONTENT.brand }: { message?: string; brand?: BrandContent }) {
  const SITE = brandLinks(brand);
  if (!SITE.whatsappUrl) return null;
  const href = `${SITE.whatsappUrl}?text=${encodeURIComponent(message || `Hello ${brand.name}, I would like to make an enquiry.`)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
      style={{ height: 52, width: 52 }}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}

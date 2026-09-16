import { WhatsAppIcon } from "@/components/ui/social-icons";
import { SITE } from "@/lib/constants";

export function WhatsAppButton({ message = "Hello JIS Beauty & Fashion, I'd like to make an enquiry." }: { message?: string }) {
  const href = `${SITE.whatsappUrl}?text=${encodeURIComponent(message)}`;
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

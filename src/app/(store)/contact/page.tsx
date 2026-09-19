import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach JIS Beauty & Fashion on WhatsApp, through our contact form or on Instagram for order support and fragrance advice.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return (
    <div className="container-x py-10 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow mb-3">We’re here</p>
        <h1 className="font-serif text-4xl leading-[1.05] sm:text-5xl">Contact us</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-stone">Questions about an order or a fragrance? Send us a message and we’ll get back to you as soon as possible.</p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
        <aside className="space-y-6 lg:col-span-4 lg:col-start-9">
          <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border border-line p-5 transition-colors hover:border-ink">
            <span className="flex h-11 w-11 items-center justify-center bg-[#25D366]/10 text-[#128C7E]"><WhatsAppIcon className="h-5 w-5" /></span>
            <span>
              <span className="block text-xs uppercase tracking-[0.16em] text-stone">WhatsApp (fastest)</span>
              <span className="block font-medium">{SITE.whatsapp}</span>
            </span>
          </a>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-4 border border-line p-5 transition-colors hover:border-ink">
              <span className="flex h-11 w-11 items-center justify-center bg-ivory text-ink">@</span>
              <span>
                <span className="block text-xs uppercase tracking-[0.16em] text-stone">Email</span>
                <span className="block font-medium">{contactEmail}</span>
              </span>
            </a>
          )}
          <div className="border border-line p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-stone">Social</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline"><InstagramIcon className="h-4 w-4" /> @{SITE.instagram}</a>
              <a href={SITE.tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline"><TikTokIcon className="h-4 w-4" /> @{SITE.tiktok}</a>
            </div>
          </div>
          <div className="border border-line bg-cream p-5 text-sm text-ink-soft">
            <p className="text-xs uppercase tracking-[0.16em] text-stone">Hours</p>
            <p className="mt-2">Monday – Saturday: 9am – 7pm WAT</p>
            <p>Sunday: Closed (WhatsApp messages answered Monday)</p>
            <p className="mt-2 text-stone">{SITE.address}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

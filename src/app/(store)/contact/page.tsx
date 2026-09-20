import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact JIS Beauty & Fashion for order support and fragrance questions on WhatsApp, Instagram or through the contact form.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return (
    <div className="pb-20 lg:pb-28">
      <header className="border-b border-line bg-ivory py-16 sm:py-20 lg:py-24">
        <div className="container-x grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-5">The JIS concierge / Get in touch</p>
            <h1 className="font-serif text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-[clamp(5rem,7vw,8rem)]">We’d love to <span className="italic text-rosewood">hear from you.</span></h1>
          </div>
          <p className="max-w-sm text-base leading-[1.9] text-ink-soft lg:col-span-4">Need help choosing a fragrance, checking on an order or finding the right gift? Send us a message.</p>
        </div>
      </header>

      <div className="container-x mt-12 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
        <section className="lg:col-span-7" aria-labelledby="contact-form-heading">
          <div className="mb-9 border-b border-line pb-7">
            <p className="eyebrow mb-3">01 / Write to us</p>
            <h2 id="contact-form-heading" className="font-serif text-4xl leading-tight sm:text-5xl">Send a message</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone">Fill in the form and we’ll respond through your supplied contact details.</p>
          </div>
          <ContactForm />
        </section>
        <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="contact-channels-heading">
          <div className="border border-line bg-cream p-7 sm:p-9">
            <p className="eyebrow mb-3">02 / Stay connected</p>
            <h2 id="contact-channels-heading" className="font-serif text-4xl leading-tight">Find us here.</h2>
            <div className="mt-7 space-y-1 border-t border-line pt-3">
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center gap-4 border-b border-line text-ink transition-colors hover:text-rosewood">
                <WhatsAppIcon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1"><span className="block text-[10px] uppercase tracking-[0.17em] text-stone">WhatsApp</span><span className="mt-1 block text-sm">{SITE.whatsapp}</span></span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              {contactEmail && <a href={`mailto:${contactEmail}`} className="flex min-h-16 items-center justify-between gap-3 border-b border-line text-sm text-ink transition-colors hover:text-rosewood"><span className="min-w-0 break-all">{contactEmail}</span><ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /></a>}
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center gap-4 border-b border-line text-ink transition-colors hover:text-rosewood"><InstagramIcon className="h-5 w-5 shrink-0" /><span className="flex-1 text-sm">@{SITE.instagram}</span><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
              <a href={SITE.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center gap-4 text-ink transition-colors hover:text-rosewood"><TikTokIcon className="h-5 w-5 shrink-0" /><span className="flex-1 text-sm">@{SITE.tiktok}</span><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
            </div>
            <p className="mt-6 border-t border-line pt-5 text-xs leading-relaxed text-stone">JIS Beauty &amp; Fashion · {SITE.address}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

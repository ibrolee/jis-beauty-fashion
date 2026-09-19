import Link from "next/link";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import { SITE } from "@/lib/constants";
import { isOnlinePaymentEnabled } from "@/lib/payments";
import type { CategoryWithCount } from "@/types";
import { Logo } from "./logo";

const HELP_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping & Delivery", href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Track My Order", href: "/account/orders" },
];

const COMPANY_LINKS = [
  { label: "About JIS", href: "/about" },
  { label: "All Collections", href: "/categories" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function Footer({ categories }: { categories: CategoryWithCount[] }) {
  const onlinePaymentsEnabled = isOnlinePaymentEnabled();
  return (
    <footer className="border-t border-line bg-cream">
      <div className="container-x py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo className="items-start" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-stone">
              {SITE.tagline}. Fragrances and beauty essentials, thoughtfully curated in Lagos and delivered across Nigeria.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram @jisbeautyfashion" className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-ink">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href={SITE.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok @jisbeautyfashion" className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-ink">
                <TikTokIcon className="h-4 w-4" />
              </a>
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="flex h-10 w-10 items-center justify-center border border-line text-ink transition-colors hover:border-ink">
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <span className="text-xs text-stone">@{SITE.instagram}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <h3 className="eyebrow mb-4 font-sans">Shop</h3>
              <ul className="space-y-2.5">
                <li><Link href="/shop" className="text-sm text-ink-soft hover:text-ink">All Products</Link></li>
                {categories.map((c) => (
                  <li key={c.id}><Link href={`/shop/${c.slug}`} className="text-sm text-ink-soft hover:text-ink">{c.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow mb-4 font-sans">Help</h3>
              <ul className="space-y-2.5">
                {HELP_LINKS.map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-sm text-ink-soft hover:text-ink">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow mb-4 font-sans">Company</h3>
              <ul className="space-y-2.5">
                {COMPANY_LINKS.map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-sm text-ink-soft hover:text-ink">{l.label}</Link></li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-stone">
                WhatsApp: <a href={SITE.whatsappUrl} className="text-ink">{SITE.whatsapp}</a>
                <br />
                Mon – Sat, 9am – 7pm WAT
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-serif text-2xl">Stay in the loop</h3>
            <p className="mt-2 text-sm text-stone">New arrivals, restocks and subscriber-only offers. No spam.</p>
            <NewsletterForm className="mt-5" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-xs text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
            {onlinePaymentsEnabled ? "Pay online via Paystack or choose direct bank transfer at checkout" : "See available payment options at checkout"}
          </p>
        </div>
      </div>
    </footer>
  );
}

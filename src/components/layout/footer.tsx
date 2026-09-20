import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import { SITE } from "@/lib/constants";
import { isOnlinePaymentEnabled } from "@/lib/payments";
import type { CategoryWithCount } from "@/types";
import { Logo } from "./logo";

const HELP_LINKS = [
  { label: "Contact us", href: "/contact" },
  { label: "Frequently asked questions", href: "/faq" },
  { label: "Shipping & delivery", href: "/shipping" },
  { label: "Returns & refunds", href: "/returns" },
  { label: "Track my order", href: "/account/orders" },
];

const COMPANY_LINKS = [
  { label: "Our story", href: "/about" },
  { label: "All collections", href: "/categories" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms & conditions", href: "/terms" },
];

export function Footer({ categories }: { categories: CategoryWithCount[] }) {
  const onlinePaymentsEnabled = isOnlinePaymentEnabled();

  return (
    <footer className="border-t border-line bg-cream">
      <div className="container-x border-b border-line py-12 sm:py-16 lg:flex lg:items-end lg:justify-between lg:gap-10 lg:py-20">
        <div>
          <p className="eyebrow mb-4">The JIS edit</p>
          <h2 className="max-w-2xl font-serif text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Find your next <em className="font-normal text-rosewood">signature.</em>
          </h2>
        </div>
        <Link href="/shop" className="mt-7 inline-flex min-h-12 items-center gap-5 border-b border-ink pb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:border-rosewood hover:text-rosewood lg:mb-2">
          Explore the collection <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>

      <div className="container-x grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-9 lg:py-20">
        <div className="lg:col-span-4">
          <Logo className="items-start" />
          <p className="mt-6 max-w-sm text-[15px] leading-[1.85] text-stone">
            {SITE.tagline}. Fragrances, perfume oils and beauty essentials, thoughtfully curated in Lagos.
          </p>
          <div className="mt-7 flex items-center gap-3">
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="JIS on Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-rosewood hover:bg-blush">
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a href={SITE.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="JIS on TikTok" className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-rosewood hover:bg-blush">
              <TikTokIcon className="h-4 w-4" />
            </a>
            <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with JIS on WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-rosewood hover:bg-blush">
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            <span className="ml-1 text-xs text-stone">@{SITE.instagram}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-2 lg:col-span-5">
          <div>
            <h3 className="eyebrow mb-5">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-sm text-ink-soft transition-colors hover:text-rosewood">All products</Link></li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/shop/${category.slug}`} className="text-sm text-ink-soft transition-colors hover:text-rosewood">{category.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow mb-5">Help</h3>
            <ul className="space-y-3">
              {HELP_LINKS.map((link) => (
                <li key={link.href}><Link href={link.href} className="text-sm text-ink-soft transition-colors hover:text-rosewood">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow mb-5">JIS</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}><Link href={link.href} className="text-sm text-ink-soft transition-colors hover:text-rosewood">{link.label}</Link></li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-stone">
              Need a hand? <a href={SITE.whatsappUrl} className="font-medium text-ink underline underline-offset-4">Chat on WhatsApp</a>.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <p className="eyebrow mb-3">Notes from JIS</p>
          <h3 className="font-serif text-3xl leading-tight">Stay in the loop.</h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone">Be the first to hear about new arrivals, restocks and special offers.</p>
          <NewsletterForm className="mt-6" />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>{onlinePaymentsEnabled ? "Online payment and direct bank transfer options at checkout" : "See available payment options at checkout"}</p>
        </div>
      </div>
    </footer>
  );
}

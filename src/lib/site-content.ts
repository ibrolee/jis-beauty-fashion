/**
 * Admin-editable homepage/site content. Stored in the `site_settings` table
 * as JSON keyed by these names; the defaults below are used as fallbacks.
 */
export type AnnouncementContent = { text: string; href: string; enabled: boolean };

export type HeroContent = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  image: string;
};

export type PromoContent = {
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
  href: string;
  couponCode: string;
};

export type BusinessContent = {
  footerTagline: string;
  footerPaymentNote: string;
  checkoutIntro: string;
  paymentVerificationNote: string;
  whatsappPaymentTitle: string;
  whatsappPaymentBody: string;
  bankTransferTitle: string;
  bankTransferBody: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankTransferInstructions: string;
  whatsappOrderInstructions: string;
  submittedPaymentNotice: string;
};

export type SiteContent = {
  announcement: AnnouncementContent;
  hero: HeroContent;
  promo: PromoContent;
  business: BusinessContent;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  announcement: {
    text: "Free interstate delivery from ₦50,000 · Use code JISWELCOME for 5% off",
    href: "/shipping",
    enabled: true,
  },
  hero: {
    eyebrow: "New season fragrances",
    headline: "Discover Your Signature Scent",
    subheadline: "Fragrance that speaks before you do. Authentic perfumes and perfume oils, delivered anywhere in Nigeria.",
    primaryCta: "Shop Now",
    primaryHref: "/shop",
    secondaryCta: "Explore Collections",
    secondaryHref: "/categories",
    image: "/images/hero.jpg",
  },
  promo: {
    eyebrow: "A little welcome gift",
    headline: "5% off your first order",
    body: "Join the JIS family and enjoy 5% off with code JISWELCOME at checkout. Because your first signature scent should feel special.",
    cta: "Start Shopping",
    href: "/shop",
    couponCode: "JISWELCOME",
  },
  business: {
    footerTagline: "Fragrances, perfume oils and beauty essentials, thoughtfully curated in Lagos.",
    footerPaymentNote: "Online payment and direct bank transfer options at checkout",
    checkoutIntro: "Your details, your delivery and your preferred way to pay. Review everything before placing your order.",
    paymentVerificationNote: "Payment is confirmed only after we verify that your transfer has reached our account. Merely opening WhatsApp or reporting payment does not confirm it.",
    whatsappPaymentTitle: "Instant payment on WhatsApp",
    whatsappPaymentBody: "Place your order to open WhatsApp with product links, reference and exact total. Request our bank details, transfer within six hours, then return to your order page and select 'I have paid -- request verification'. We verify the bank receipt manually.",
    bankTransferTitle: "Bank transfer on this website",
    bankTransferBody: "Place your order to view JIS's confirmed GTBank account details and your exact total on the order page. Transfer within six hours, then select 'I have transferred the amount' on your order page. Reported payments are held for manual review; unreported, unpaid orders are eligible for cancellation after six hours.",
    bankName: "GTBank",
    bankAccountName: "Salmon Salmat Oyindamola",
    bankAccountNumber: "0165946091",
    bankTransferInstructions: "Transfer exactly {total} and use {orderNumber} as your narration. Only press the button after making your transfer. We will verify receipt before marking the order paid.",
    whatsappOrderInstructions: "Your WhatsApp message includes the products, product links, order reference and total of {total}. Request our bank details and pay within six hours. Return to this page to report your transfer. Merely opening or sending a WhatsApp message does not confirm payment or hold the order for review.",
    submittedPaymentNotice: "Your reservation is held for manual review. Do not pay again unless our team confirms you need to.",
  },
};

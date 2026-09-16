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

export type SiteContent = {
  announcement: AnnouncementContent;
  hero: HeroContent;
  promo: PromoContent;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  announcement: {
    text: "Free delivery on orders above ₦150,000 · Use code JISWELCOME for 5% off",
    href: "/shop",
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
};

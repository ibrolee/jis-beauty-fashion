import { BadgeCheck, Headset, RotateCcw, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { ButtonLink } from "@/components/ui/button";
import { InstagramIcon, TikTokIcon } from "@/components/ui/social-icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { seedTestimonials } from "@/db/seed-data/catalog";
import { SITE } from "@/lib/constants";
import type { PromoContent } from "@/lib/site-content";

/* ------------------------------ Brand story ------------------------------ */
export function BrandStory() {
  return (
    <section className="container-x py-16 lg:py-24" aria-labelledby="story-heading">
      <div className="grid items-center gap-10 lg:grid-cols-12">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory lg:col-span-5">
          <Image src="/images/about.jpg" alt="A JIS customer applying fragrance to her wrist" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="eyebrow mb-4">The JIS way</p>
          <h2 id="story-heading" className="font-serif text-4xl leading-[1.05] sm:text-5xl">
            Where beauty <em className="font-normal italic text-rosewood">meets</em> style.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-stone sm:text-base">
            JIS Beauty &amp; Fashion started with a simple belief: a great fragrance is the most personal thing you can wear. We source authentic perfumes, oils and beauty essentials, test every scent ourselves, and package each order like a gift — because it usually is one.
          </p>
          <ul className="mt-8 grid gap-4 text-sm text-ink-soft sm:grid-cols-2">
            {["Hand-picked, sealed & authentic", "Honest scent descriptions", "Nationwide delivery from Lagos", "Real people on WhatsApp"].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-px w-5 shrink-0 bg-rosewood" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-9">
            <ButtonLink href="/about" variant="secondary">
              Our story
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Why JIS -------------------------------- */
const REASONS = [
  { icon: BadgeCheck, title: "100% authentic", body: "Every bottle is sourced from trusted distributors and sealed. No knock-offs, ever." },
  { icon: Truck, title: "Fast nationwide delivery", body: "1–2 days in Lagos, 3–5 days everywhere else. Free above ₦150,000." },
  { icon: RotateCcw, title: "Easy returns", body: "Wrong or damaged item? We'll sort it within 48 hours of delivery." },
  { icon: Headset, title: "Scent advice on WhatsApp", body: "Not sure what to pick? Chat with us — we'll recommend based on what you love." },
];

export function WhyJis() {
  return (
    <section className="border-y border-line bg-cream" aria-labelledby="why-heading">
      <div className="container-x py-16 lg:py-20">
        <SectionHeading eyebrow="Why JIS" title="Shopping with us feels different" align="center" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="text-center sm:text-left">
              <span className="inline-flex h-12 w-12 items-center justify-center border border-line bg-white">
                <Icon className="h-5 w-5" strokeWidth={1.25} aria-hidden />
              </span>
              <h3 className="mt-5 font-serif text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Testimonials ------------------------------ */
export function Testimonials() {
  return (
    <section className="container-x py-16 lg:py-24" aria-labelledby="testimonials-heading">
      <SectionHeading eyebrow="Customer love" title="Compliments, delivered" align="center" />
      <div className="grid gap-6 md:grid-cols-3">
        {seedTestimonials.map((t) => (
          <figure key={t.name} className="flex flex-col border border-line p-7">
            <div className="flex gap-0.5 text-ink" aria-label="5 out of 5 stars">
              {"★★★★★".split("").map((s, i) => (
                <span key={i} className="text-sm">{s}</span>
              ))}
            </div>
            <blockquote className="mt-4 flex-1 font-serif text-xl leading-snug text-ink">“{t.quote}”</blockquote>
            <figcaption className="mt-6 text-xs uppercase tracking-[0.16em] text-stone">
              {t.name} · {t.location}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- Social --------------------------------- */
const SOCIAL_TILES = [
  "/images/products/women-2.jpg",
  "/images/products/men-1.jpg",
  "/images/about.jpg",
  "/images/products/oil-1.jpg",
  "/images/products/unisex-1.jpg",
  "/images/hero.jpg",
];

export function SocialSection() {
  return (
    <section className="bg-ivory py-16 lg:py-24" aria-labelledby="social-heading">
      <div className="container-x">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <p className="eyebrow">Follow along</p>
          <h2 id="social-heading" className="font-serif text-3xl sm:text-4xl">@{SITE.instagram}</h2>
          <div className="flex items-center gap-3">
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 border border-ink px-5 text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink hover:text-white">
              <InstagramIcon className="h-4 w-4" /> Instagram
            </a>
            <a href={SITE.tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 border border-ink px-5 text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-ink hover:text-white">
              <TikTokIcon className="h-4 w-4" /> TikTok
            </a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
          {SOCIAL_TILES.map((src, i) => (
            <a key={src + i} href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden bg-white" aria-label="View on Instagram">
              <Image src={src} alt="" fill sizes="(min-width: 640px) 16vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Newsletter ------------------------------- */
export function NewsletterBand() {
  return (
    <section className="bg-ink text-white" aria-labelledby="newsletter-heading">
      <div className="container-x grid gap-8 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">Newsletter</p>
          <h2 id="newsletter-heading" className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            First to know. <span className="italic font-normal text-blush">Always.</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">New arrivals, restock alerts and subscriber-only offers, once or twice a month.</p>
        </div>
        <div className="lg:max-w-md lg:justify-self-end lg:w-full">
          <NewsletterForm dark />
          <p className="mt-3 text-xs text-white/50">By subscribing you agree to our <Link href="/privacy" className="underline">privacy policy</Link>.</p>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Promo CTA ------------------------------- */
export function PromoCta({ content }: { content: PromoContent }) {
  return (
    <section className="container-x py-16 lg:py-24" aria-labelledby="promo-heading">
      <div className="relative overflow-hidden border border-line bg-blush/60 px-6 py-14 text-center sm:px-12 lg:py-20">
        <p className="eyebrow">{content.eyebrow}</p>
        <h2 id="promo-heading" className="mx-auto mt-4 max-w-2xl font-serif text-4xl leading-[1.05] sm:text-5xl">
          {content.headline}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">{content.body}</p>
        {content.couponCode && (
          <p className="mt-6 inline-flex items-center gap-3 border border-dashed border-ink/40 bg-white px-5 py-3 text-sm">
            <span className="text-stone">Code</span>
            <span className="font-medium tracking-[0.2em]">{content.couponCode}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={content.href || "/shop"} size="lg">
            {content.cta}
          </ButtonLink>
          <ButtonLink href={SITE.whatsappUrl} variant="secondary" size="lg">
            Chat on WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

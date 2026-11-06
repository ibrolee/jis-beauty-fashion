import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VariantChoices, VariantProductGallery, VariantSelectionProvider } from "@/components/product/variant-selection";
import { ProductRail } from "@/components/product/product-grid";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ReviewForm, ReviewList } from "@/components/product/reviews";
import { RatingStars } from "@/components/ui/rating-stars";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/lib/auth/session";
import { GENDER_LABELS } from "@/lib/constants";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getProductReviews, hasUserReviewed } from "@/lib/data/reviews";
import { brandLinks } from "@/lib/website-content";
import { getSiteContent, getPublishedSiteContent } from "@/lib/data/settings";
import { absoluteUrl, discountPercent, effectivePrice, isOnSale } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const title = product.metaTitle ?? `${product.name} by ${product.brandName ?? (await getSiteContent()).website.brand.name}`;
  const description = product.metaDescription ?? product.shortDescription ?? product.description.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title, description, type: "website", images: product.images.map((url) => ({ url, alt: product.name })) },
    twitter: { card: "summary_large_image", title, description, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  const user = await getCurrentUser();
  const [reviews, related, alreadyReviewed, content, published] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product, 4),
    user ? hasUserReviewed(product.id, user.id) : Promise.resolve(false),
    getSiteContent(),
    getPublishedSiteContent(),
  ]);
  const SITE = brandLinks(content.website.brand);
  const soldOut = product.stock <= 0 && !product.variants.some((variant) => variant.stock > 0);
  const badges = soldOut
    ? [{ tone: "soldout" as const, label: "Sold out" }]
    : [
        ...(isOnSale(product) ? [{ tone: "sale" as const, label: `-${discountPercent(product)}%` }] : []),
        ...(product.isNewArrival ? [{ tone: "new" as const, label: "New" }] : []),
        ...(product.isBestSeller ? [{ tone: "best" as const, label: "Best seller" }] : []),
      ];
  const details: [string, string | null][] = [
    ["Volume", product.volume],
    ["Fragrance type", product.fragranceType],
    ["Gender", GENDER_LABELS[product.gender]],
    ["Longevity", product.longevity],
    ["Occasion", product.occasion],
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description,
    sku: product.sku,
    image: [...product.images, ...product.variants.flatMap((variant) => variant.images)].map((image) => absoluteUrl(image)),
    brand: product.brandName ? { "@type": "Brand", name: product.brandName } : undefined,
    category: product.categoryName,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "NGN",
      price: effectivePrice(product),
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.name },
    },
    aggregateRating: product.reviewCount > 0 ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } : undefined,
  };

  return (
    <div className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x pb-8 pt-3 sm:pb-12 sm:pt-4 lg:pb-24 lg:pt-8">
        <nav aria-label="Breadcrumb" className="mb-3 flex min-w-0 items-center gap-1.5 overflow-hidden text-[9px] font-medium uppercase tracking-[0.1em] text-stone sm:mb-5 sm:gap-2 lg:mb-10 lg:text-[10px]">
          <Link href="/" className="shrink-0 hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          <Link href="/shop" className="shrink-0 hover:text-ink">Shop</Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          <Link href={`/shop/${product.categorySlug}`} className="shrink-0 hover:text-ink">{product.categoryName}</Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate text-ink" aria-current="page">{product.name}</span>
        </nav>

        <VariantSelectionProvider product={product}>
          {product.variants.length > 0 && (
            <div className="mb-3 border-y border-line py-2.5 lg:hidden">
              <VariantChoices product={product} />
            </div>
          )}
          <div className="grid items-start gap-5 sm:gap-7 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            <div className="min-w-0 lg:col-span-7">
              <VariantProductGallery product={product} badges={badges} />
            </div>
            <div className="min-w-0 lg:col-span-5">
              <div className="lg:sticky lg:top-40">
                <p className="mb-2.5 flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.2em] text-rosewood sm:mb-4 sm:text-[10px]">
                  <span className="h-px w-7 bg-rosewood" aria-hidden="true" />
                  {product.brandName ?? `${SITE.shortName} fragrance edit`}
                </p>
                <h1 className="max-w-[22ch] font-serif text-[clamp(1.9rem,7vw,5.5rem)] leading-[1.02] tracking-[-0.035em] text-ink sm:max-w-[15ch] sm:leading-[0.94]">{product.name}</h1>
                {(product.volume || product.fragranceType) && (
                  <p className="mt-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-stone sm:mt-5 sm:text-xs sm:tracking-[0.16em]">{[product.volume, product.fragranceType].filter(Boolean).join("  /  ")}</p>
                )}
                {product.shortDescription && <p className="mt-3 max-w-prose text-xs leading-5 text-ink-soft sm:mt-5 sm:text-sm sm:leading-7">{product.shortDescription}</p>}
                <div className="mt-4 sm:mt-7"><PurchasePanel product={product} delivery={published.delivery} whatsappUrl={SITE.whatsappUrl} storeName={SITE.shortName} /></div>
                <div className="mt-3 sm:mt-5">
                  <a href="#reviews" className="inline-flex items-center gap-2 text-xs text-ink-soft underline-offset-4 hover:underline">
                    {product.reviewCount > 0 ? (
                      <><RatingStars rating={product.rating} showValue /><span>{product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}</span></>
                    ) : "See customer reviews"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </VariantSelectionProvider>

        <div className="mt-9 grid gap-7 border-t border-line pt-7 sm:mt-14 sm:gap-9 sm:pt-9 lg:mt-28 lg:grid-cols-12 lg:gap-16 lg:pt-20">
          <section className="lg:col-span-7" aria-labelledby="description-heading">
            <p className="eyebrow mb-2">Explore the fragrance</p>
            <h2 id="description-heading" className="font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">The scent, in detail.</h2>
            <p className="mt-3 max-w-[65ch] whitespace-pre-line text-[13px] leading-6 text-ink-soft sm:mt-5 sm:text-[15px] sm:leading-8">{product.description}</p>
            {(product.topNotes || product.heartNotes || product.baseNotes) && (
              <div className="mt-6 border-t border-line pt-5 sm:mt-10 sm:pt-8">
                <h3 className="eyebrow mb-4">Fragrance notes</h3>
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
                  {[
                    ["01 / Top", product.topNotes],
                    ["02 / Heart", product.heartNotes],
                    ["03 / Base", product.baseNotes],
                  ].map(([label, value]) => value ? (
                    <div key={label} className="border-l border-rosewood/40 pl-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone">{label}</p>
                      <p className="mt-2 font-serif text-xl leading-snug text-ink sm:mt-3 sm:text-2xl">{value}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
          </section>
          <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="details-heading">
            <p className="eyebrow mb-3">The essentials</p>
            <h2 id="details-heading" className="font-serif text-3xl sm:text-4xl">Product details</h2>
            <dl className="mt-3 divide-y divide-line border-y border-line text-xs sm:mt-5 sm:text-sm">
              {details.map(([label, value]) => value ? (
                <div key={label} className="flex justify-between gap-4 py-2.5 sm:gap-6 sm:py-4">
                  <dt className="text-stone">{label}</dt>
                  <dd className="max-w-[60%] text-right text-ink">{value}</dd>
                </div>
              ) : null)}
            </dl>
            <p className="mt-3 text-xs leading-5 text-stone sm:mt-5 sm:leading-6">Questions about this item? <a href={`${SITE.whatsappUrl}?text=${encodeURIComponent(`Hello JIS, I have a question about ${product.name}.`)}`} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4">Speak with us on WhatsApp</a>.</p>
          </aside>
        </div>
      </div>

      <section id="reviews" className="border-t border-line bg-white py-8 sm:py-12 lg:py-24" aria-labelledby="reviews-heading">
        <div className="container-x grid gap-7 sm:gap-9 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-3">Your experience</p>
            <h2 id="reviews-heading" className="font-serif text-4xl leading-tight sm:text-5xl">Customer reviews</h2>
            {product.reviewCount > 0 && (
              <div className="mt-4 flex items-end gap-3 sm:mt-6">
                <span className="font-serif text-6xl leading-none">{product.rating.toFixed(1)}</span>
                <div className="pb-1"><RatingStars rating={product.rating} size="md" /><p className="mt-1 text-xs text-stone">Based on {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}</p></div>
              </div>
            )}
            <div className="mt-5 border-t border-line pt-4 sm:mt-8 sm:pt-6">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.16em]">Write a review</h3>
              <ReviewForm productId={product.id} productSlug={product.slug} canReview={Boolean(user)} alreadyReviewed={alreadyReviewed} />
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6"><ReviewList reviews={reviews} /></div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-ivory py-8 sm:py-12 lg:py-24" aria-label="You may also like">
          <div className="container-x">
            <SectionHeading eyebrow="Continue the discovery" title="You may also like" href={`/shop/${product.categorySlug}`} linkLabel={`More ${product.categoryName.toLowerCase()}`} />
            <ProductRail products={related} />
          </div>
        </section>
      )}
    </div>
  );
}

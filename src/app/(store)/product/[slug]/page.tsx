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
import { GENDER_LABELS, SITE } from "@/lib/constants";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getProductReviews, hasUserReviewed } from "@/lib/data/reviews";
import { absoluteUrl, discountPercent, effectivePrice, isOnSale } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const title = product.metaTitle ?? `${product.name} by ${product.brandName ?? SITE.name}`;
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
  const [reviews, related, alreadyReviewed] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product, 4),
    user ? hasUserReviewed(product.id, user.id) : Promise.resolve(false),
  ]);
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
    ["Category", product.categoryName],
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
      <div className="container-x pb-16 pt-5 lg:pb-24 lg:pt-8">
        <nav aria-label="Breadcrumb" className="mb-7 flex min-w-0 items-center gap-2 overflow-hidden text-[10px] font-medium uppercase tracking-[0.12em] text-stone lg:mb-10">
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
            <div className="mb-5 border-y border-line py-4 lg:hidden">
              <VariantChoices product={product} />
            </div>
          )}
          <div className="grid items-start gap-9 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            <div className="min-w-0 lg:col-span-7">
              <VariantProductGallery product={product} badges={badges} />
            </div>
            <div className="min-w-0 lg:col-span-5">
              <div className="lg:sticky lg:top-40">
                <p className="mb-4 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em] text-rosewood">
                  <span className="h-px w-7 bg-rosewood" aria-hidden="true" />
                  {product.brandName ?? "JIS fragrance edit"}
                </p>
                <h1 className="max-w-[15ch] font-serif text-[clamp(2.8rem,5vw,5.5rem)] leading-[0.94] tracking-[-0.035em] text-ink">{product.name}</h1>
                {(product.volume || product.fragranceType) && (
                  <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-stone">{[product.volume, product.fragranceType].filter(Boolean).join("  /  ")}</p>
                )}
                {product.shortDescription && <p className="mt-5 max-w-prose text-sm leading-7 text-ink-soft">{product.shortDescription}</p>}
                <div className="mt-7"><PurchasePanel product={product} /></div>
                <div className="mt-5">
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

        <div className="mt-20 grid gap-12 border-t border-line pt-12 lg:mt-28 lg:grid-cols-12 lg:gap-16 lg:pt-20">
          <section className="lg:col-span-7" aria-labelledby="description-heading">
            <p className="eyebrow mb-3">Explore the fragrance</p>
            <h2 id="description-heading" className="font-serif text-4xl leading-tight sm:text-5xl">The scent, in detail.</h2>
            <p className="mt-6 max-w-[65ch] whitespace-pre-line text-[15px] leading-8 text-ink-soft">{product.description}</p>
            {(product.topNotes || product.heartNotes || product.baseNotes) && (
              <div className="mt-12 border-t border-line pt-9">
                <h3 className="eyebrow mb-6">Fragrance notes</h3>
                <div className="grid gap-8 sm:grid-cols-3">
                  {[
                    ["01 / Top", product.topNotes],
                    ["02 / Heart", product.heartNotes],
                    ["03 / Base", product.baseNotes],
                  ].map(([label, value]) => value ? (
                    <div key={label} className="border-l border-rosewood/40 pl-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone">{label}</p>
                      <p className="mt-3 font-serif text-2xl leading-snug text-ink">{value}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
          </section>
          <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="details-heading">
            <p className="eyebrow mb-3">The essentials</p>
            <h2 id="details-heading" className="font-serif text-4xl">Product details</h2>
            <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
              {details.map(([label, value]) => value ? (
                <div key={label} className="flex justify-between gap-6 py-4">
                  <dt className="text-stone">{label}</dt>
                  <dd className="max-w-[60%] text-right text-ink">{value}</dd>
                </div>
              ) : null)}
            </dl>
            <p className="mt-6 text-xs leading-6 text-stone">Questions about this item? <a href={`${SITE.whatsappUrl}?text=${encodeURIComponent(`Hello JIS, I have a question about ${product.name}.`)}`} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4">Speak with us on WhatsApp</a>.</p>
          </aside>
        </div>
      </div>

      <section id="reviews" className="border-t border-line bg-white py-16 lg:py-24" aria-labelledby="reviews-heading">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-3">Your experience</p>
            <h2 id="reviews-heading" className="font-serif text-4xl leading-tight sm:text-5xl">Customer reviews</h2>
            {product.reviewCount > 0 && (
              <div className="mt-6 flex items-end gap-3">
                <span className="font-serif text-6xl leading-none">{product.rating.toFixed(1)}</span>
                <div className="pb-1"><RatingStars rating={product.rating} size="md" /><p className="mt-1 text-xs text-stone">Based on {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}</p></div>
              </div>
            )}
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.16em]">Write a review</h3>
              <ReviewForm productId={product.id} productSlug={product.slug} canReview={Boolean(user)} alreadyReviewed={alreadyReviewed} />
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6"><ReviewList reviews={reviews} /></div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-ivory py-16 lg:py-24" aria-label="You may also like">
          <div className="container-x">
            <SectionHeading eyebrow="Continue the discovery" title="You may also like" href={`/shop/${product.categorySlug}`} linkLabel={`More ${product.categoryName.toLowerCase()}`} />
            <ProductRail products={related} />
          </div>
        </section>
      )}
    </div>
  );
}

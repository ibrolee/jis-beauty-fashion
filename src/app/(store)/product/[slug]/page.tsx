import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VariantProductGallery, VariantSelectionProvider } from "@/components/product/variant-selection";
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

  const soldOut = product.stock <= 0 && !product.variants.some((v) => v.stock > 0);
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
    image: [...product.images, ...product.variants.flatMap((v) => v.images)].map((i) => absoluteUrl(i)),
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
    <div className="container-x py-6 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-stone">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href={`/shop/${product.categorySlug}`} className="hover:text-ink">{product.categoryName}</Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <span className="truncate text-ink" aria-current="page">{product.name}</span>
      </nav>

      <VariantSelectionProvider product={product}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <VariantProductGallery product={product} badges={badges} />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            {product.brandName && <p className="eyebrow">{product.brandName}</p>}
            <h1 className="mt-2 font-serif text-4xl leading-[1.05] sm:text-5xl">{product.name}</h1>
            <p className="mt-2 text-sm text-stone">
              {product.volume} · {product.fragranceType}
            </p>
            <div className="mt-3 flex items-center gap-3">
              {product.reviewCount > 0 ? (
                <a href="#reviews" className="inline-flex items-center gap-2 text-sm hover:underline">
                  <RatingStars rating={product.rating} showValue />
                  <span className="text-stone">{product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}</span>
                </a>
              ) : (
                <a href="#reviews" className="text-sm text-stone hover:underline">No reviews yet</a>
              )}
            </div>
            {product.shortDescription && <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{product.shortDescription}</p>}

            <div className="mt-7">
              <PurchasePanel product={product} />
            </div>
          </div>
        </div>
      </div>

      </VariantSelectionProvider>

      {/* Details */}
      <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:mt-24 lg:grid-cols-12 lg:pt-16">
        <section className="lg:col-span-7" aria-labelledby="description-heading">
          <h2 id="description-heading" className="font-serif text-3xl">About this scent</h2>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{product.description}</p>

          {(product.topNotes || product.heartNotes || product.baseNotes) && (
            <div className="mt-10">
              <h3 className="eyebrow mb-5 font-sans">Fragrance notes</h3>
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  ["Top notes", product.topNotes, "The first impression — bright and fleeting."],
                  ["Heart notes", product.heartNotes, "The character that unfolds after a few minutes."],
                  ["Base notes", product.baseNotes, "The lasting trail that stays for hours."],
                ].map(([label, value, hint]) =>
                  value ? (
                    <div key={label} className="border-l border-line pl-4">
                      <p className="text-xs font-medium uppercase tracking-[0.14em]">{label}</p>
                      <p className="mt-2 font-serif text-xl leading-snug">{value}</p>
                      <p className="mt-1 text-xs text-stone">{hint}</p>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="details-heading">
          <h2 id="details-heading" className="font-serif text-3xl">Details</h2>
          <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
            {details.map(([k, v]) =>
              v ? (
                <div key={k} className="flex justify-between gap-6 py-3">
                  <dt className="text-stone">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ) : null,
            )}
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-stone">
            Questions about this fragrance?{" "}
            <a href={`${SITE.whatsappUrl}?text=${encodeURIComponent(`Hello JIS, I have a question about ${product.name}.`)}`} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4">
              Ask us on WhatsApp
            </a>
            .
          </p>
        </aside>
      </div>

      {/* Reviews */}
      <section id="reviews" className="mt-16 grid gap-10 border-t border-line pt-12 lg:mt-24 lg:grid-cols-12 lg:pt-16" aria-labelledby="reviews-heading">
        <div className="lg:col-span-4">
          <h2 id="reviews-heading" className="font-serif text-3xl">Customer reviews</h2>
          {product.reviewCount > 0 && (
            <div className="mt-4 flex items-end gap-3">
              <span className="font-serif text-6xl leading-none">{product.rating.toFixed(1)}</span>
              <div className="pb-1">
                <RatingStars rating={product.rating} size="md" />
                <p className="mt-1 text-xs text-stone">Based on {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}</p>
              </div>
            </div>
          )}
          <div className="mt-8">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.16em]">Write a review</h3>
            <ReviewForm productId={product.id} productSlug={product.slug} canReview={Boolean(user)} alreadyReviewed={alreadyReviewed} />
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <ReviewList reviews={reviews} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-12 lg:mt-24 lg:pt-16" aria-label="You may also like">
          <SectionHeading eyebrow="Pairs well with" title="You may also like" href={`/shop/${product.categorySlug}`} linkLabel={`More ${product.categoryName.toLowerCase()}`} />
          <ProductRail products={related} />
        </section>
      )}
    </div>
  );
}

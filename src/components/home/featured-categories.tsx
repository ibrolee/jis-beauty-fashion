import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HomeSection } from "@/lib/website-content";
import type { CategoryWithCount } from "@/types";

/**
 * Homepage discovery cards are deliberately compact on phones.
 * The full collection cards live at /categories; homepage cards should not
 * require several screens of scrolling before visitors reach products.
 */
export function FeaturedCategories({
  categories,
  section,
}: {
  categories: CategoryWithCount[];
  section: HomeSection;
}) {
  // Do not promote empty collections on the homepage. The owner's separate
  // menu setting still governs whether empty categories appear elsewhere.
  const available = categories
    .filter((category) => category.isActive && category.productCount > 0)
    .slice(0, 4);

  if (!available.length) return null;

  return (
    <section id={section.id} className="scroll-mt-36 py-12 sm:py-20 lg:py-24" aria-label={section.title}>
      <div className="container-x">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 sm:mb-10 sm:gap-6 sm:pb-9">
          <div>
            <p className="eyebrow mb-3 sm:mb-4">{section.eyebrow}</p>
            <h2 className="max-w-4xl font-serif text-4xl leading-[0.98] sm:text-5xl lg:text-6xl">{section.title}</h2>
            {section.body && <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone sm:mt-5 sm:text-base">{section.body}</p>}
          </div>
          {section.buttonLabel && (
            <Link href={section.buttonHref || "/categories"} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-xs uppercase tracking-wider sm:min-h-12 sm:gap-3 sm:px-5">
              {section.buttonLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {available.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="group relative isolate aspect-[4/5] min-h-[185px] min-w-0 overflow-hidden rounded-2xl bg-ink text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosewood sm:aspect-auto sm:min-h-[350px] sm:rounded-[2rem] lg:min-h-[420px]"
              aria-label={`Shop ${category.name}`}
            >
              {category.image && (
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 45vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-6">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/85 sm:mb-3 sm:text-xs">
                  {category.productCount} {category.productCount === 1 ? "product" : "products"}
                </p>
                <h3 className="break-words font-serif text-[clamp(1.2rem,4.9vw,1.65rem)] leading-[1.02] sm:text-4xl">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-3 hidden max-w-lg text-sm leading-relaxed text-white/85 sm:block">{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

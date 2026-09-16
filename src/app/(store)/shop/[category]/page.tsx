import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/shop/shop-page";
import { getCategoryBySlug } from "@/lib/data/categories";
import type { SearchParamsRecord } from "@/lib/shop-params";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<SearchParamsRecord> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Category not found" };
  return {
    title: cat.name,
    description: cat.description ?? `Shop ${cat.name} at JIS Beauty & Fashion.`,
    alternates: { canonical: `/shop/${cat.slug}` },
    openGraph: { title: cat.name, description: cat.description ?? undefined, images: cat.image ? [{ url: cat.image }] : undefined },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ category }, sp] = await Promise.all([params, searchParams]);
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  return (
    <ShopPage
      eyebrow="Collection"
      title={cat.name}
      description={cat.description}
      basePath={`/shop/${cat.slug}`}
      searchParams={sp}
      overrides={{ category: cat.slug }}
      lockCategory
      emptyTitle={`No ${cat.name.toLowerCase()} match these filters`}
    />
  );
}

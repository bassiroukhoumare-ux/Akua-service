import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FaqCta } from "@/components/home/sections";
import { ProductCarousel } from "@/components/home/product-carousel";
import { ShopView } from "@/components/shop/shop-view";
import { getCategories, getCategoryBySlug, getFeaturedProducts, getProducts } from "@/lib/catalog";
import { parseShopParams, type RawParams } from "@/lib/shop-params";

type Props = { params: Promise<{ categorie: string }>; searchParams: Promise<RawParams> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ categorie: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategoryBySlug((await params).categorie);
  return cat ? { title: cat.name, description: cat.description } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorie } = await params;
  const category = await getCategoryBySlug(categorie);
  if (!category) notFound();
  const [products, featured] = await Promise.all([getProducts(parseShopParams(await searchParams, categorie)), getFeaturedProducts()]);
  return (
    <>
      <Suspense>
        <ShopView products={products} category={category} />
      </Suspense>
      <ProductCarousel eyebrow="Sélection AKUA" title="Explorez nos recommandations" products={featured.filter((p) => p.categoryId !== category.id)} />
      <FaqCta />
    </>
  );
}

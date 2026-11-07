import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqCta } from "@/components/home/sections";
import { ProductCarousel } from "@/components/home/product-carousel";
import { ShopView } from "@/components/shop/shop-view";
import { getCategoryBySlug, getFeaturedProducts, getProducts } from "@/lib/catalog";
import { parseShopParams, type RawParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Consoles, jeux vidéo, manettes, simulation et accessoires neufs et garantis. Livraison au Togo et dans la sous-région.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const query = parseShopParams(await searchParams);
  const [products, category, featured] = await Promise.all([
    getProducts(query),
    query.categorySlug ? getCategoryBySlug(query.categorySlug) : Promise.resolve(null),
    getFeaturedProducts(),
  ]);
  return (
    <>
      <Suspense>
        <ShopView products={products} category={category} query={query.search} />
      </Suspense>
      <ProductCarousel eyebrow="Sélection AKUA" title="Explorez nos recommandations" products={featured} />
      <FaqCta />
    </>
  );
}

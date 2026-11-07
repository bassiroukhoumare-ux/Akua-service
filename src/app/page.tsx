import { ProductFeed } from "@/components/home/product-feed";
import { CategoryRail, DealsSection, FaqCta, PacksSection, PlatformMarquee } from "@/components/home/sections";
import { getCategories, getDealsOfTheDay, getPacks, getProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, products, deals, packs] = await Promise.all([getCategories(), getProducts(), getDealsOfTheDay(), getPacks()]);
  return (
    <>
      <CategoryRail categories={categories} products={products} />
      <PlatformMarquee />
      <DealsSection deals={deals} />
      <ProductFeed products={products} />
      <PacksSection packs={packs} />
      <FaqCta />
    </>
  );
}

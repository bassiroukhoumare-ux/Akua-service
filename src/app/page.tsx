import { HeroSlider } from "@/components/home/hero-slider";
import { HomeShell } from "@/components/home/home-shell";
import { ProductFeed } from "@/components/home/product-feed";
import { CategoryRail, DealsSection, PacksSection, PlatformMarquee } from "@/components/home/sections";
import { getCategories, getDealsOfTheDay, getMixedPacks, getProducts, loadHome } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, products, deals, packs, home] = await Promise.all([getCategories(), getProducts(), getDealsOfTheDay(), getMixedPacks(), loadHome()]);
  // sections : affichage, ordre d'origine et textes réglés dans l'admin
  const sec = (id: string) => home?.sections?.find((s) => s.id === id);
  const shown = (id: string) => sec(id)?.visible !== false;
  const text = (id: string) => ({ ...(sec(id)?.eyebrow ? { eyebrow: sec(id)!.eyebrow } : {}), ...(sec(id)?.title ? { title: sec(id)!.title } : {}) });
  return (
    <HomeShell>
      {/* bannière en tête : 3 visuels qui glissent (Black Friday, saison, confiance), puis les catégories */}
      <HeroSlider deals={deals} month={new Date().getUTCMonth()} />
      <CategoryRail categories={categories} products={products} />
      {shown("platforms") && <PlatformMarquee />}
      {shown("deals") && <DealsSection deals={deals} config={home?.deals ?? null} />}
      {shown("catalogue") && <ProductFeed products={products} {...text("catalogue")} />}
      {shown("packs") && <PacksSection packs={packs} {...text("packs")} />}
    </HomeShell>
  );
}

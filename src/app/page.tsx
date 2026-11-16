import { HeroSlider } from "@/components/home/hero-slider";
import { HomeShell } from "@/components/home/home-shell";
import { ProductFeed } from "@/components/home/product-feed";
import { CategoryRail, DealsSection, PacksSection, PlatformMarquee, PromoBand, TrustStrip } from "@/components/home/sections";
import { getCategories, getDealsOfTheDay, getMixedPacks, getProducts, loadHome } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, products, deals, packs, home] = await Promise.all([getCategories(), getProducts(), getDealsOfTheDay(), getMixedPacks(), loadHome()]);
  // sections : affichage, ordre d'origine et textes réglés dans l'admin
  const sec = (id: string) => home?.sections?.find((s) => s.id === id);
  const shown = (id: string) => sec(id)?.visible !== false;
  const text = (id: string) => ({ ...(sec(id)?.eyebrow ? { eyebrow: sec(id)!.eyebrow } : {}), ...(sec(id)?.title ? { title: sec(id)!.title } : {}) });
  // bannières ajoutées dans l'admin (jusqu'à 3) : elles remplacent les bannières automatiques dès qu'il y en a une
  const href = (x: { linkKind: string; link: string }) => (x.linkKind === "category" ? `/boutique/${x.link}` : x.linkKind === "product" ? `/produit/${x.link}` : x.linkKind === "none" ? null : x.link || null);
  const banners = (["hero1", "hero2", "hero3"] as const)
    .map((k) => home?.slides?.[k]?.[0])
    .filter((x): x is NonNullable<typeof x> => !!x && x.active && !!x.image)
    .map((x) => ({ id: x.id, src: x.image, alt: x.alt, href: href(x), media: x.media ?? ("image" as const) }));
  return (
    <HomeShell>
      {/* bannière, catégories, promotions, bandeau packs, catalogue, packs, marques, garanties */}
      <HeroSlider deals={deals} month={new Date().getUTCMonth()} banners={banners} />
      <CategoryRail categories={categories} products={products} />
      {shown("deals") && <DealsSection deals={deals} config={home?.deals ?? null} />}
      {shown("packs") && <PromoBand packs={packs} />}
      {shown("catalogue") && <ProductFeed products={products} {...text("catalogue")} />}
      {shown("packs") && <PacksSection packs={packs} {...text("packs")} />}
      {shown("platforms") && <PlatformMarquee />}
      <TrustStrip />
    </HomeShell>
  );
}

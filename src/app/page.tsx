import { ProductFeed } from "@/components/home/product-feed";
import { CategoryRail, DealsSection, FaqCta, type HomeSlot, PacksSection, PlatformMarquee } from "@/components/home/sections";
import { getCategories, getDealsOfTheDay, getPacks, getProducts, loadHome } from "@/lib/catalog";

type Slide = { image: string; alt: string; linkKind: string; link: string; active: boolean; media?: "image" | "video" };

/** Lien d'un visuel de l'accueil selon le type choisi dans l'admin. */
function slot(slides?: Slide[]): HomeSlot | null {
  const s = slides?.find((x) => x.active);
  if (!s) return null;
  const href = s.linkKind === "category" ? `/boutique/${s.link}` : s.linkKind === "product" ? `/produit/${s.link}` : s.linkKind === "page" || s.linkKind === "url" ? s.link || null : null;
  return { src: s.image, alt: s.alt, href, media: s.media ?? "image" };
}

export default async function HomePage() {
  const [categories, products, deals, packs, home] = await Promise.all([getCategories(), getProducts(), getDealsOfTheDay(), getPacks(), loadHome()]);
  // sections : affichage, ordre d'origine et textes réglés dans l'admin
  const sec = (id: string) => home?.sections?.find((s) => s.id === id);
  const shown = (id: string) => sec(id)?.visible !== false;
  const text = (id: string) => ({ ...(sec(id)?.eyebrow ? { eyebrow: sec(id)!.eyebrow } : {}), ...(sec(id)?.title ? { title: sec(id)!.title } : {}) });
  return (
    <>
      <CategoryRail categories={categories} products={products} poster={slot(home?.slides?.poster)} banner={slot(home?.slides?.banner)} />
      {shown("platforms") && <PlatformMarquee />}
      {shown("deals") && <DealsSection deals={deals} config={home?.deals ?? null} />}
      {shown("catalogue") && <ProductFeed products={products} {...text("catalogue")} />}
      {shown("packs") && <PacksSection packs={packs} {...text("packs")} />}
      {shown("faq") && <FaqCta {...text("faq")} />}
    </>
  );
}

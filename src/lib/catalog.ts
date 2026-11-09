// Couche d'accès aux données du site public.
// Catalogue géré depuis l'espace admin (base Neon). Tant que rien n'a été enregistré depuis l'admin,
// le site affiche ses données d'origine.

import { banners } from "@/data/banners";
import { categories as baseCategories } from "@/data/categories";
import { products as baseProducts } from "@/data/products";
import { readState } from "@/lib/content";
import { initialSettings, type ShopSettings } from "@/lib/shop-settings";
import type { Banner, Category, Condition, Platform, Product } from "@/types/catalog";

/** Catalogue publié : produits visibles et catégories, depuis la base (ou les données d'origine). */
export async function loadCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  const v = await readState<{ products?: Product[]; categories?: Category[] }>("akua-admin-catalog");
  const products = (v?.state.products ?? baseProducts).filter((p) => p.published !== false);
  const categories = v?.state.categories ?? baseCategories;
  return { products, categories };
}

/** Paramètres de la boutique enregistrés dans l'admin (sinon : valeurs d'origine). */
export async function loadSettings(): Promise<ShopSettings> {
  const v = await readState<{ settings?: ShopSettings }>("akua-admin-settings");
  return { ...initialSettings, ...(v?.state.settings ?? {}) };
}

/** Réglages de l'accueil et de l'offre spéciale enregistrés dans l'admin (null : réglages d'origine). */
export async function loadHome() {
  const v = await readState<{ slides?: Record<"poster" | "banner", { id: string; image: string; alt: string; linkKind: string; link: string; active: boolean }[]>; sections?: { id: string; visible: boolean; eyebrow?: string; title?: string }[]; deals?: { enabled: boolean; mode: "midnight" | "duration"; hours: number; startedAt: string; repeat: boolean; title: string; highlight: string; text: string; productIds: string[]; videos: [string[], string[]] } }>("akua-admin-home");
  return v?.state ?? null;
}

export type SortKey = "pertinence" | "prix-asc" | "prix-desc" | "nouveautes";

export interface ProductQuery {
  categorySlug?: string;
  platforms?: Platform[];
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
  sort?: SortKey;
}

const PROMO_SLUG = "promos";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export async function getCategories(): Promise<Category[]> {
  const { categories } = await loadCatalog();
  return [...categories].sort((a, b) => a.order - b.order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { categories } = await loadCatalog();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { categories } = await loadCatalog();
  return categories.find((c) => c.id === id) ?? null;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const { products, categories } = await loadCatalog();
  let list = [...products];

  if (query.categorySlug) {
    if (query.categorySlug === PROMO_SLUG) {
      list = list.filter((p) => p.badges.includes("promo") || p.compareAtPrice);
    } else {
      const cat = categories.find((c) => c.slug === query.categorySlug);
      list = cat ? list.filter((p) => p.categoryId === cat.id) : [];
    }
  }
  if (query.platforms?.length) {
    list = list.filter((p) => p.platforms.some((pl) => query.platforms!.includes(pl)));
  }
  if (query.condition) list = list.filter((p) => p.condition === query.condition);
  if (query.minPrice != null) list = list.filter((p) => p.price >= query.minPrice!);
  if (query.maxPrice != null) list = list.filter((p) => p.price <= query.maxPrice!);
  if (query.inStockOnly) list = list.filter((p) => p.stockStatus !== "rupture");
  if (query.search) {
    const q = normalize(query.search.trim());
    list = list.filter((p) =>
      normalize(`${p.name} ${p.shortDescription} ${p.platforms.join(" ")}`).includes(q),
    );
  }

  switch (query.sort) {
    case "prix-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "prix-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "nouveautes":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    default:
      list.sort(
        (a, b) =>
          Number(!!b.isFeatured) - Number(!!a.isFeatured) ||
          (b.soldCount ?? 0) - (a.soldCount ?? 0),
      );
  }
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { products } = await loadCatalog();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { products } = await loadCatalog();
  return products.find((p) => p.id === id) ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const { products } = await loadCatalog();
  return products.filter((p) => ids.includes(p.id));
}

export async function getDealsOfTheDay(): Promise<Product[]> {
  const [{ products }, home] = await Promise.all([loadCatalog(), loadHome()]);
  // produits choisis dans « Offre spéciale » (admin), dans l'ordre choisi
  if (home?.deals) return home.deals.enabled ? home.deals.productIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p) : [];
  return products.filter((p) => p.isDealOfDay);
}

export async function getPacks(): Promise<Product[]> {
  const { products } = await loadCatalog();
  return products.filter((p) => p.isPack).sort((a, b) => a.price - b.price);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { products } = await loadCatalog();
  return products.filter((p) => p.isFeatured);
}

export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const { products } = await loadCatalog();
  return products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, limit);
}

export async function getBanners(placement: Banner["placement"]): Promise<Banner[]> {
  return banners.filter((b) => b.placement === placement).sort((a, b) => a.order - b.order);
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  ps5: "PS5",
  ps4: "PS4",
  ps3: "PS3",
  switch2: "Switch 2",
  switch: "Switch",
  "xbox-series": "Xbox Series",
  "xbox-360": "Xbox 360",
  pc: "PC",
  android: "Android",
  ios: "iOS",
};

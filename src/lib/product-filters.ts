// Filtres du catalogue, partagés par l'accueil (filtrage immédiat) et la boutique (filtrage par l'adresse de la page).
import { BRANDS, type BrandDef } from "@/data/brands";
import type { Category, Condition, Platform, Product } from "@/types/catalog";

export interface FilterState {
  /** id de catégorie, « promo » pour les produits à prix barré, ou null pour tout */
  category: string | null;
  /** sous-rayon (slug) dans la catégorie choisie */
  group: string | null;
  /** fourchette de prix en F CFA, null = tous les prix */
  price: [number, number] | null;
  platforms: Platform[];
  brands: string[];
  inStock: boolean;
  condition: Condition | null;
}

export const EMPTY_FILTERS: FilterState = { category: null, group: null, price: null, platforms: [], brands: [], inStock: false, condition: null };

export const CONDITIONS: { id: Condition; label: string }[] = [
  { id: "neuf", label: "Neuf" },
  { id: "occasion", label: "Venant" },
  { id: "reconditionne", label: "Reconditionné" },
];

/** Plafond du curseur de prix (relevé si un produit coûte plus cher). */
export const PRICE_CEILING = 3_000_000;

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const BY_ID = new Map(BRANDS.map((b) => [b.id, b]));
export const brandDef = (id: string | undefined): BrandDef | undefined => (id ? BY_ID.get(id) : undefined);

/** Marque d'un produit : celle choisie dans l'admin, sinon reconnue d'après son nom. */
export function brandOf(p: Pick<Product, "name" | "brand">): string | undefined {
  if (p.brand && BY_ID.has(p.brand)) return p.brand;
  const n = ` ${norm(p.name)} `;
  return BRANDS.find((b) => b.keywords.some((k) => n.includes(k)))?.id;
}

/** Marques présentes dans une liste de produits, avec leur nombre, de la plus fournie à la moins fournie. */
export function brandCounts(products: Product[]): { brand: BrandDef; n: number }[] {
  const m = new Map<string, number>();
  for (const p of products) {
    const b = brandOf(p);
    if (b) m.set(b, (m.get(b) ?? 0) + 1);
  }
  return [...m.entries()].map(([id, n]) => ({ brand: BY_ID.get(id)!, n })).sort((a, b) => b.n - a.n || a.brand.name.localeCompare(b.brand.name));
}

export const priceMax = (products: Product[]) => Math.max(PRICE_CEILING, ...products.map((p) => p.price));

/**
 * Échelle du curseur de prix : la majorité des produits coûtent moins de 500 000 F, le plafond est à 3 000 000 F.
 * Une échelle progressive (au carré) donne de la précision en bas sans perdre le haut de gamme.
 */
const POS = 1000;
export const posToPrice = (pos: number, max: number) => {
  const raw = max * (pos / POS) ** 2;
  const step = raw < 50_000 ? 1_000 : raw < 500_000 ? 5_000 : 25_000;
  return Math.min(max, Math.round(raw / step) * step);
};
export const priceToPos = (price: number, max: number) => Math.round(Math.sqrt(Math.max(0, Math.min(price, max)) / max) * POS);
export const SLIDER_STEPS = POS;

const isPromo = (p: Product) => !!p.compareAtPrice && p.compareAtPrice > p.price;

/** Applique les filtres (hors recherche texte et tri). */
export function applyFilters(products: Product[], f: FilterState): Product[] {
  return products.filter((p) => {
    if (p.published === false) return false;
    if (f.category === "promo" ? !isPromo(p) : f.category && p.categoryId !== f.category) return false;
    if (f.group && p.group !== f.group) return false;
    if (f.price && (p.price < f.price[0] || p.price > f.price[1])) return false;
    if (f.platforms.length && !f.platforms.some((pl) => p.platforms.includes(pl))) return false;
    if (f.brands.length && !f.brands.includes(brandOf(p) ?? "")) return false;
    if (f.inStock && (p.stockStatus === "rupture" || p.stockStatus === "sur_commande")) return false;
    if (f.condition && p.condition !== f.condition) return false;
    return true;
  });
}

/** Nombre de filtres actifs (hors catégorie), pour le badge du bouton « Filtres ». */
export const activeCount = (f: FilterState) => (f.price ? 1 : 0) + f.platforms.length + f.brands.length + (f.inStock ? 1 : 0) + (f.condition ? 1 : 0) + (f.group ? 1 : 0);

/** La catégorie choisie concerne-t-elle les consoles (filtre « Compatible avec » utile) ? */
export const showsPlatforms = (category: Category | undefined | null) => !category || category.id === "cat-consoles";

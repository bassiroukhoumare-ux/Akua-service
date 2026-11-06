import type { ProductQuery, SortKey } from "@/lib/catalog";
import type { Condition, Platform } from "@/types/catalog";

export type RawParams = Record<string, string | string[] | undefined>;

export const PRICE_RANGES = [
  { id: "0-10000", label: "Moins de 10 000 F" },
  { id: "10000-50000", label: "10 000 à 50 000 F" },
  { id: "50000-200000", label: "50 000 à 200 000 F" },
  { id: "200000-1000000", label: "Plus de 200 000 F" },
] as const;

export const SHOP_PLATFORMS: Platform[] = ["ps5", "ps4", "ps3", "switch2", "switch", "xbox-series", "xbox-360", "pc", "android"];

export const SORTS: { id: SortKey; label: string }[] = [
  { id: "pertinence", label: "Pertinence" },
  { id: "prix-asc", label: "Prix croissant" },
  { id: "prix-desc", label: "Prix décroissant" },
  { id: "nouveautes", label: "Nouveautés" },
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseShopParams(sp: RawParams, categorySlug?: string): ProductQuery & { prix?: string } {
  const prix = one(sp.prix);
  const [min, max] = prix ? prix.split("-").map(Number) : [];
  const platforms = (one(sp.plateforme) ?? "").split(",").filter(Boolean) as Platform[];
  return {
    categorySlug: categorySlug ?? one(sp.categorie) ?? undefined,
    platforms: platforms.length ? platforms : undefined,
    condition: (one(sp.etat) as Condition) || undefined,
    minPrice: Number.isFinite(min) ? min : undefined,
    maxPrice: Number.isFinite(max) ? max : undefined,
    inStockOnly: one(sp.dispo) === "1",
    search: one(sp.q) || undefined,
    sort: (one(sp.tri) as SortKey) || "pertinence",
    prix,
  };
}

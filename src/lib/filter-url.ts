// Filtres ⇄ adresse de la boutique (/boutique/<catégorie>?type=…&prix=…&marque=…&plateforme=…&dispo=1&etat=…).
import type { FilterState } from "@/lib/product-filters";
import type { Category, Condition, Platform } from "@/types/catalog";

export function filtersToHref(f: FilterState, categories: Category[], extra?: Record<string, string | null | undefined>): string {
  const cat = f.category === "promo" ? "promos" : categories.find((c) => c.id === f.category)?.slug;
  const q = new URLSearchParams();
  if (f.group) q.set("type", f.group);
  if (f.price) q.set("prix", `${f.price[0]}-${f.price[1]}`);
  if (f.brands.length) q.set("marque", f.brands.join(","));
  if (f.platforms.length) q.set("plateforme", f.platforms.join(","));
  if (f.inStock) q.set("dispo", "1");
  if (f.condition) q.set("etat", f.condition);
  for (const [k, v] of Object.entries(extra ?? {})) if (v) q.set(k, v);
  return `/boutique${cat ? `/${cat}` : ""}${q.size ? `?${q}` : ""}`;
}

export function filtersFromParams(sp: URLSearchParams, category: Category | null): FilterState {
  const prix = sp.get("prix")?.split("-").map(Number);
  const list = (k: string) => (sp.get(k) ?? "").split(",").filter(Boolean);
  return {
    category: category ? (category.slug === "promos" ? "promo" : category.id) : null,
    group: sp.get("type"),
    price: prix && prix.length === 2 && prix.every(Number.isFinite) ? [prix[0], prix[1]] : null,
    platforms: list("plateforme") as Platform[],
    brands: list("marque"),
    inStock: sp.get("dispo") === "1",
    condition: (sp.get("etat") as Condition) || null,
  };
}

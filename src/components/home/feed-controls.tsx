"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useCatalog } from "@/components/catalog-provider";
import { BrandMark } from "@/components/shop/filter-panel";
import { SearchSelect } from "@/components/ui/search-select";
import { PLATFORM_LABELS } from "@/lib/catalog";
import { activeCount, brandDef, CONDITIONS, EMPTY_FILTERS, type FilterState } from "@/lib/product-filters";
import { SORTS } from "@/lib/shop-params";
import { cn } from "@/lib/utils";

const fmt = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ")} F`;

/**
 * Commandes du catalogue : bouton « Filtres », tri, catégories en pastilles et filtres actifs.
 * Sur l'accueil (téléphone), elles sont placées juste sous les catégories ; sur ordinateur, au-dessus des produits.
 */
export function FeedControls({
  filters: f,
  onFilters: setF,
  sort,
  onSort,
  total,
  onOpenFilters,
  className,
}: {
  filters: FilterState;
  onFilters: (f: FilterState) => void;
  sort: string;
  onSort: (s: string) => void;
  total: number;
  onOpenFilters: () => void;
  className?: string;
}) {
  const { categories } = useCatalog();
  const realCats = categories.filter((c) => c.slug !== "promos");
  const current = realCats.find((c) => c.id === f.category);
  const count = activeCount(f);
  const catLabel = f.category === "promo" ? "Promotions" : (current?.shortName ?? current?.name ?? "Tous les produits");

  // filtres actifs, retirables d'un clic
  const chips: { key: string; label: React.ReactNode; clear: () => void }[] = [
    ...(f.group && current ? [{ key: "g", label: current.groups?.find((g) => g.slug === f.group)?.name ?? f.group, clear: () => setF({ ...f, group: null }) }] : []),
    ...(f.price ? [{ key: "p", label: `${fmt(f.price[0])} – ${fmt(f.price[1])}`, clear: () => setF({ ...f, price: null }) }] : []),
    ...f.brands.map((b) => ({ key: `b-${b}`, label: brandDef(b)?.name ?? b, clear: () => setF({ ...f, brands: f.brands.filter((x) => x !== b) }) })),
    ...f.platforms.map((pl) => ({ key: `pl-${pl}`, label: PLATFORM_LABELS[pl], clear: () => setF({ ...f, platforms: f.platforms.filter((x) => x !== pl) }) })),
    ...(f.inStock ? [{ key: "s", label: "En stock", clear: () => setF({ ...f, inStock: false }) }] : []),
    ...(f.condition ? [{ key: "c", label: CONDITIONS.find((c) => c.id === f.condition)?.label ?? f.condition, clear: () => setF({ ...f, condition: null }) }] : []),
  ];

  return (
    <div className={className}>
      {/* barre d'outils */}
      <div className="flex items-center justify-between gap-2 rounded-[20px] bg-akua-page p-1.5 sm:pl-5">
        <p className="hidden min-w-0 truncate text-[14px] text-akua-gray-500 sm:block">
          <span className="font-semibold text-akua-ink">{catLabel}</span> · {total} produit{total > 1 ? "s" : ""}
        </p>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button type="button" onClick={onOpenFilters} className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-akua-gray-200 bg-akua-white px-4 text-[13.5px] font-semibold lg:hidden">
            <SlidersHorizontal aria-hidden className="size-4" /> Filtres
            {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-akua-blue text-[11px] text-akua-white">{count}</span>}
          </button>
          <SearchSelect
            value={sort}
            onChange={onSort}
            options={SORTS.map((x) => ({ value: x.id, label: x.label, display: `Trier : ${x.label}` }))}
            searchable={false}
            variant="pill"
            aria-label="Trier les produits"
            className="flex-1 sm:w-auto sm:flex-none"
          />
        </div>
      </div>

      {/* catégories rapides (téléphone et tablette) */}
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 lg:hidden" role="tablist" aria-label="Catégories">
        {[{ id: null as string | null, label: "Tout" }, ...realCats.map((c) => ({ id: c.id as string | null, label: c.shortName ?? c.name })), { id: "promo", label: "Promos" }].map((c) => {
          const on = f.category === c.id;
          return (
            <button key={c.id ?? "all"} type="button" role="tab" aria-selected={on} onClick={() => setF({ ...f, category: c.id, group: null })} className={cn("h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold whitespace-nowrap transition-colors", on ? "bg-akua-ink text-akua-white" : "bg-akua-white ring-1 ring-akua-gray-200")}>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* filtres actifs */}
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button key={c.key} type="button" onClick={c.clear} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-akua-blue-100 pr-2 pl-3 text-[12.5px] font-semibold text-akua-blue transition-colors hover:bg-akua-blue hover:text-akua-white">
              {c.key.startsWith("b-") && brandDef(c.key.slice(2))?.logo ? <BrandMark brand={brandDef(c.key.slice(2))!} className="h-3.5" /> : c.label}
              <X aria-hidden className="size-3.5" />
            </button>
          ))}
          <button type="button" onClick={() => setF({ ...EMPTY_FILTERS, category: f.category })} className="h-8 px-2 text-[12.5px] font-semibold text-akua-gray-500 hover:text-akua-ink">
            Tout effacer
          </button>
        </div>
      )}
    </div>
  );
}

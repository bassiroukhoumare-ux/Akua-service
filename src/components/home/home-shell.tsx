"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { FilterPanel } from "@/components/shop/filter-panel";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { activeCount, applyFilters, EMPTY_FILTERS, type FilterState } from "@/lib/product-filters";

type Ctx = { filters: FilterState; setFilters: (f: FilterState) => void; sort: string; setSort: (s: string) => void; openFilters: () => void };
const HomeFiltersCtx = createContext<Ctx | null>(null);

/** Filtres de l'accueil, partagés entre la colonne de gauche, la barre mobile et le catalogue (null hors de l'accueil). */
export const useHomeFilters = () => useContext(HomeFiltersCtx);

const KEY = "akua-filtres-accueil";

/** Amène les résultats filtrés à l'écran s'ils n'y sont pas déjà. */
function revealResults(force = false) {
  const el = document.getElementById("catalogue-resultats");
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (force || r.top > window.innerHeight * 0.55 || r.bottom < 200) {
    window.scrollTo({ top: window.scrollY + r.top - (window.innerWidth >= 1024 ? 150 : 120), behavior: "smooth" });
  }
}

/**
 * Accueil : sur ordinateur, colonne de filtres à gauche visible dès le haut de la page ;
 * sur téléphone, panneau « Filtres » ouvert depuis la barre placée sous les catégories ou depuis le catalogue.
 * Les filtres choisis sont gardés pendant la visite (retour depuis une fiche produit).
 */
export function HomeShell({ children }: { children: React.ReactNode }) {
  const { products } = useCatalog();
  const [filters, setState] = useState<FilterState>(EMPTY_FILTERS);
  const [sheet, setSheet] = useState(false);
  const [sort, setSort] = useState("pertinence");

  // reprise des filtres de la visite en cours
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) setState({ ...EMPTY_FILTERS, ...JSON.parse(saved) });
    } catch {
      // stockage indisponible : on repart sans filtre
    }
  }, []);

  const setFilters = useCallback((f: FilterState) => {
    setState(f);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(f));
    } catch {
      // sans importance
    }
    // sur ordinateur, les produits filtrés s'affichent à droite : on les amène à l'écran
    if (window.matchMedia("(min-width: 1024px)").matches) window.requestAnimationFrame(() => revealResults());
  }, []);

  const total = useMemo(() => applyFilters(products, filters).length, [products, filters]);

  return (
    <HomeFiltersCtx.Provider value={{ filters, setFilters, sort, setSort, openFilters: () => setSheet(true) }}>
      <div className="lg:container-akua lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[280px_minmax(0,1fr)] lg:[&_.container-akua]:max-w-none lg:[&_.container-akua]:px-0">
        <aside className="hidden pt-8 lg:block" aria-label="Filtres du catalogue">
          <div className="no-scrollbar sticky top-[140px] max-h-[calc(100vh-160px)] overflow-y-auto overscroll-contain rounded-[24px] bg-akua-white p-5 pb-2 ring-1 ring-akua-gray-200">
            <FilterPanel value={filters} onChange={setFilters} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>

      {/* filtres sur téléphone et tablette */}
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="max-h-[88vh] gap-0 rounded-t-[28px] border-0 p-0 [&>button]:hidden">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-akua-gray-200" />
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <SheetTitle className="text-[20px] font-bold">Filtres</SheetTitle>
            <button type="button" onClick={() => setSheet(false)} aria-label="Fermer" className="grid size-10 place-items-center rounded-full bg-akua-page">
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 pb-4">
            <FilterPanel value={filters} onChange={setFilters} inSheet />
          </div>
          <div className="border-t border-akua-gray-200 p-4">
            <button
              type="button"
              onClick={() => {
                setSheet(false);
                window.setTimeout(() => revealResults(true), 250);
              }}
              className="h-12 w-full rounded-full bg-akua-ink font-semibold text-akua-white"
            >
              Voir {total} produit{total > 1 ? "s" : ""}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </HomeFiltersCtx.Provider>
  );
}

/**
 * Téléphone et tablette : uniquement le bouton « Filtres », juste sous les catégories (avant la bannière).
 * Il ouvre le panneau complet ; « Voir N produits » amène ensuite aux résultats. Masqué sur ordinateur.
 */
export function MobileFilterBar() {
  const ctx = useHomeFilters();
  if (!ctx) return null;
  const n = activeCount(ctx.filters) + (ctx.filters.category ? 1 : 0);
  return (
    <section aria-label="Filtrer les produits" className="container-akua pt-6 lg:hidden">
      <button type="button" onClick={ctx.openFilters} className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-akua-gray-200 bg-akua-white text-[14.5px] font-semibold transition-colors active:bg-akua-page">
        <SlidersHorizontal aria-hidden className="size-[18px]" strokeWidth={2} /> Filtres
        {n > 0 && <span className="grid size-5 place-items-center rounded-full bg-akua-blue text-[11px] font-bold text-akua-white">{n}</span>}
      </button>
    </section>
  );
}

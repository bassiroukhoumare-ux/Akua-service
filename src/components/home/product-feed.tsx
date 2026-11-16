"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, PackageSearch, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { ProductCard } from "@/components/product/product-card";
import { FilterPanel } from "@/components/shop/filter-panel";
import { Reveal } from "@/components/ui/reveal";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { btn } from "@/lib/btn";
import { filtersToHref } from "@/lib/filter-url";
import { activeCount, applyFilters, EMPTY_FILTERS, type FilterState } from "@/lib/product-filters";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import { FeedControls } from "./feed-controls";
import { useHomeFilters } from "./home-shell";
import { SectionHeading } from "./section-heading";

/** Mélange les catégories à tour de rôle : « Tous les produits » montre chaque univers dès la première ligne. */
function interleave(products: Product[], order: string[]) {
  const buckets = order.map((id) => products.filter((p) => p.categoryId === id));
  const rest = products.filter((p) => !order.includes(p.categoryId));
  const out: Product[] = [];
  for (let i = 0; buckets.some((b) => i < b.length); i++) for (const b of buckets) if (b[i]) out.push(b[i]);
  return [...out, ...rest];
}

const STEP = 12;

/**
 * Catalogue de l'accueil avec filtres : colonne à gauche sur ordinateur, panneau « Filtres » sur téléphone.
 * Catégories, prix, marques, compatibilité, disponibilité et état ; 12 produits puis « Afficher plus ».
 */
export function ProductFeed({ products, eyebrow = "Catalogue", title = "Nos produits disponibles." }: { products: Product[]; initial?: number; eyebrow?: string; title?: string }) {
  const { categories } = useCatalog();
  // sur l'accueil, les filtres sont partagés avec la colonne de gauche (HomeShell)
  const shared = useHomeFilters();
  const [localF, setLocalF] = useState<FilterState>(EMPTY_FILTERS);
  const f = shared?.filters ?? localF;
  const setF = shared?.setFilters ?? setLocalF;
  const [localSort, setLocalSort] = useState("pertinence");
  const sort = shared?.sort ?? localSort;
  const setSort = shared?.setSort ?? setLocalSort;
  const [n, setN] = useState(STEP);
  const [sheet, setSheet] = useState(false);
  const realCats = useMemo(() => categories.filter((c) => c.slug !== "promos"), [categories]);

  const list = useMemo(() => {
    const base = applyFilters(products, f);
    if (sort === "prix-asc") return [...base].sort((a, b) => a.price - b.price);
    if (sort === "prix-desc") return [...base].sort((a, b) => b.price - a.price);
    if (sort === "nouveautes") return [...base].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return f.category ? base : interleave(base, realCats.map((c) => c.id));
  }, [products, f, sort, realCats]);

  useEffect(() => setN(STEP), [f, sort]);
  const shown = Math.min(n, list.length);
  const count = activeCount(f);
  const shopHref = filtersToHref(f, categories, { tri: sort === "pertinence" ? null : sort });

  return (
    <section aria-labelledby="catalogue" className="container-akua pt-14 md:pt-20">
      <Reveal>
        <SectionHeading index="01" eyebrow={eyebrow} centerMobile title={<span id="catalogue">{title}</span>} />
      </Reveal>

      <div className={cn("mt-7 grid grid-cols-1 gap-6", !shared && "lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-8")}>
        {/* filtres : colonne à gauche sur ordinateur (sauf si l'accueil l'affiche déjà sur toute sa hauteur) */}
        <aside className={cn("hidden", !shared && "lg:block")} aria-label="Filtres du catalogue">
          <div className="no-scrollbar sticky top-[140px] max-h-[calc(100vh-160px)] overflow-y-auto overscroll-contain rounded-[24px] bg-akua-white p-5 pb-2 ring-1 ring-akua-gray-200">
            <FilterPanel value={f} onChange={setF} />
          </div>
        </aside>

        <div id="catalogue-resultats" className="min-w-0 scroll-mt-36">
          <FeedControls
            filters={f}
            onFilters={setF}
            sort={sort}
            onSort={setSort}
            total={list.length}
            onOpenFilters={() => (shared ? shared.openFilters() : setSheet(true))}
            // sur l'accueil (téléphone), ces commandes sont placées juste sous les catégories
            className={shared ? "hidden lg:block" : undefined}
          />
          {shared && (
            <p className="text-[13.5px] text-akua-gray-500 lg:hidden" aria-live="polite">
              <span className="font-semibold text-akua-ink">
                {f.category === "promo" ? "Promotions" : (() => { const c = realCats.find((x) => x.id === f.category); return c ? (c.shortName ?? c.name) : "Tous les produits"; })()}
              </span>{" "}
              · {list.length} produit{list.length > 1 ? "s" : ""}
              {activeCount(f) > 0 && ` · ${activeCount(f)} filtre${activeCount(f) > 1 ? "s" : ""}`}
            </p>
          )}

          {list.length > 0 ? (
            <div className={cn("grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 xl:gap-5", shared ? "mt-3 lg:mt-5" : "mt-5")}>
              {list.slice(0, n).map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: (i % STEP) * 0.03, ease: [0.22, 1, 0.36, 1] }}>
                  <ProductCard product={p} priority={i < 3} sizes="(min-width:1024px) 300px, (min-width:768px) 31vw, 48vw" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-[28px] bg-akua-page px-6 py-14 text-center">
              <PackageSearch aria-hidden className="size-12 text-akua-blue" strokeWidth={1.3} />
              <p className="mt-4 text-[19px] font-bold">Aucun produit ne correspond</p>
              <p className="mt-1.5 max-w-sm text-[14px] text-akua-gray-500">Élargissez vos filtres, ou demandez-nous sur WhatsApp : nous avons souvent le produit en stock.</p>
              <button type="button" onClick={() => setF(EMPTY_FILTERS)} className={btn({ variant: "dark", size: "md", className: "mt-5" })}>
                Tout effacer
              </button>
            </div>
          )}

          {list.length > 0 && (
            <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-5">
              <div className="w-full text-center" aria-live="polite">
                <p className="text-[13.5px] text-akua-gray-500">
                  <span className="font-bold text-akua-ink tabular-nums">{shown}</span> produit{shown > 1 ? "s" : ""} sur <span className="font-bold text-akua-ink tabular-nums">{list.length}</span>
                </p>
                <div className="mx-auto mt-2.5 h-1 w-48 overflow-hidden rounded-full bg-akua-gray-200">
                  <motion.div className="h-full rounded-full bg-akua-blue" initial={false} animate={{ width: `${(shown / list.length) * 100}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {shown < list.length && (
                  <button type="button" onClick={() => setN((v) => v + STEP)} className={btn({ variant: "outline", size: "lg", className: "w-auto" })}>
                    Afficher plus <ChevronDown aria-hidden className="size-4" />
                  </button>
                )}
                <Link href={shopHref} className={btn({ variant: "dark", size: "lg", className: "w-auto" })}>
                  {count || f.category ? "Voir dans la boutique" : "Toute la boutique"} <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* filtres sur téléphone */}
      <Sheet open={!shared && sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="max-h-[88vh] gap-0 rounded-t-[28px] border-0 p-0 [&>button]:hidden">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-akua-gray-200" />
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <SheetTitle className="text-[20px] font-bold">Filtres</SheetTitle>
            <button type="button" onClick={() => setSheet(false)} aria-label="Fermer" className="grid size-10 place-items-center rounded-full bg-akua-page">
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 pb-4">
            <FilterPanel value={f} onChange={setF} inSheet />
          </div>
          <div className="border-t border-akua-gray-200 p-4">
            <button type="button" onClick={() => setSheet(false)} className="h-12 w-full rounded-full bg-akua-ink font-semibold text-akua-white">
              Voir {list.length} produit{list.length > 1 ? "s" : ""}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

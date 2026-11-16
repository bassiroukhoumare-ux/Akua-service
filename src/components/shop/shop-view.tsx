"use client";

import { ArrowLeft, ArrowRight, PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUI } from "@/store/ui";
import { useEffect, useState, useTransition } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCatalog } from "@/components/catalog-provider";
import { FilterPanel } from "@/components/shop/filter-panel";
import { filtersFromParams, filtersToHref } from "@/lib/filter-url";
import { categoryImages } from "@/data/category-media";
import { SORTS } from "@/lib/shop-params";
import { cn } from "@/lib/utils";
import { SearchSelect } from "@/components/ui/search-select";
import type { Category, Product } from "@/types/catalog";

const PER_PAGE = 12;

function useParamsUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  const togglePlatform = (pl: string) => {
    const cur = (sp.get("plateforme") ?? "").split(",").filter(Boolean);
    const nxt = cur.includes(pl) ? cur.filter((x) => x !== pl) : [...cur, pl];
    set("plateforme", nxt.join(",") || null);
  };
  const reset = () => start(() => router.replace(pathname, { scroll: false }));
  return { sp, set, togglePlatform, reset, pending };
}

/** Filtres de la boutique : le panneau commun, relié à l'adresse de la page (catégorie, prix, marque…). */
function ShopFilters({ category, inSheet }: { category: Category | null; inSheet?: boolean }) {
  const { categories } = useCatalog();
  const router = useRouter();
  const sp = useSearchParams();
  const [, start] = useTransition();
  const value = filtersFromParams(new URLSearchParams(sp.toString()), category);
  return (
    <FilterPanel
      value={value}
      inSheet={inSheet}
      onChange={(next) => {
        const href = filtersToHref(next, categories, { tri: sp.get("tri"), q: sp.get("q") });
        start(() => router.replace(href, { scroll: false }));
      }}
    />
  );
}

function EmptyState() {
  const { reset } = useParamsUpdater();
  return (
    <div className="col-span-full flex flex-col items-center rounded-[12px] bg-akua-tile px-6 py-16 text-center">
      <PackageSearch aria-hidden className="size-14 text-akua-blue" strokeWidth={1.2} />
      <p className="mt-5 font-display text-[22px] font-semibold">Aucun produit trouvé</p>
      <p className="mt-2 max-w-sm text-[14.5px] text-akua-gray-500">Essayez d&apos;autres filtres, ou demandez-nous sur WhatsApp : nous avons souvent le produit en stock.</p>
      <button type="button" onClick={reset} className="btn-shine mt-6 h-11 rounded-full bg-akua-ink px-6 text-[14px] font-semibold text-akua-white hover:bg-akua-blue">
        Réinitialiser les filtres
      </button>
    </div>
  );
}

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function ShopView({ products, category, query }: { products: Product[]; category: Category | null; query?: string }) {
  const { categories } = useCatalog();
  const { sp, set, pending } = useParamsUpdater();
  const [sheet, setSheet] = useState(false);

  // bouton « Filtrer » de l'en-tête (téléphone) : ouvre ce panneau
  const filtersAsked = useUI((s) => s.filtersOpen);
  const setFiltersAsked = useUI((s) => s.setFiltersOpen);
  useEffect(() => {
    if (!filtersAsked) return;
    setSheet(true);
    setFiltersAsked(false);
  }, [filtersAsked, setFiltersAsked]);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(query ?? "");
  const router = useRouter();
  const pathname = usePathname();
  const sort = sp.get("tri") ?? "pertinence";
  const activeCount = ["plateforme", "prix", "etat", "dispo", "marque", "type"].filter((k) => sp.get(k)).length;
  const type = sp.get("type");
  const groupName = category?.groups?.find((g) => g.slug === type)?.name;
  const pages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const visible = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const heroImg = category ? (category.image ?? categoryImages[category.id] ?? "/products/ps4-ds4.webp") : "/products/ps4-ds4.webp";
  const heroCover = heroImg.includes("/fb-") || heroImg.startsWith("/api/");

  useEffect(() => setPage(1), [products.length, sort]);

  const go = (n: number) => {
    setPage(n);
    document.getElementById("resultats")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* En-tête de résultats (réf. marketplace) */}
      <section className="border-b border-akua-gray-200 bg-akua-white">
        <div className="container-akua py-4 md:py-6">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[12.5px] text-akua-gray-500">
            <Link href="/" className="hover:text-akua-ink">
              Accueil
            </Link>
            <span aria-hidden>›</span>
            <Link href="/boutique" className="hover:text-akua-ink">
              Boutique
            </Link>
            {category && (
              <>
                <span aria-hidden>›</span>
                {groupName ? (
                  <Link href={`/boutique/${category.slug}`} className="hover:text-akua-ink">
                    {category.name}
                  </Link>
                ) : (
                  <span className="font-medium text-akua-ink">{category.name}</span>
                )}
              </>
            )}
            {groupName && (
              <>
                <span aria-hidden>›</span>
                <span className="font-medium text-akua-ink">{groupName}</span>
              </>
            )}
          </nav>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {category && (
              <span className="relative hidden size-16 shrink-0 overflow-hidden rounded-2xl bg-akua-page md:block">
                <Image src={heroImg} alt="" fill sizes="64px" className={heroCover ? "object-cover" : "object-contain p-2"} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-bold tracking-[-0.01em] md:text-[28px]">{query ? `Résultats pour « ${query} »` : (groupName ?? category?.name ?? "Toute la boutique")}</h1>
              <p className="mt-0.5 text-[13.5px] text-akua-gray-500">
                {products.length} produit{products.length > 1 ? "s" : ""} · {category?.description ?? "Consoles, ordinateurs, tablettes, accessoires et équipements testés et garantis."}
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const next = new URLSearchParams(sp.toString());
                if (q.trim()) next.set("q", q.trim());
                else next.delete("q");
                router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
              }}
              className="hidden h-11 w-full max-w-[380px] items-center gap-2 rounded-full border border-akua-gray-200 pr-1 pl-4 focus-within:border-akua-blue lg:flex"
            >
              <Search aria-hidden className="size-[18px] shrink-0 text-akua-gray-500" />
              <label htmlFor="shop-q" className="sr-only">
                Rechercher dans {category?.name ?? "la boutique"}
              </label>
              <input id="shop-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Rechercher dans ${category?.name ?? "la boutique"}`} className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-akua-gray-500" />
              <button type="submit" className="btn-shine h-8 rounded-full bg-akua-blue px-4 text-[13px] font-semibold text-akua-white hover:bg-akua-blue-600">
                OK
              </button>
            </form>
          </div>
        </div>
      </section>

      <section id="resultats" className="scroll-mt-32 bg-akua-white pt-5 pb-10 md:pt-8"><div className="container-akua">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block" aria-label="Filtres">
            <div className="sticky top-[140px] max-h-[calc(100vh-160px)] overflow-y-auto overscroll-contain rounded-[12px] bg-akua-white p-5 pb-2 ring-1 ring-akua-gray-200 no-scrollbar">
              <ShopFilters category={category} />
            </div>
          </aside>

          <div className="min-w-0">
            {/* barre d'outils */}
            <div className="flex items-center justify-between gap-2 rounded-[12px] bg-akua-page p-1.5 sm:pl-5">
              <p className="hidden text-[14px] text-akua-gray-500 sm:block">
                <span className="font-semibold text-akua-ink">{products.length}</span> produit{products.length > 1 ? "s" : ""}
              </p>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button type="button" onClick={() => setSheet(true)} className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-akua-gray-200 bg-akua-white px-4 text-[13.5px] font-medium lg:hidden">
                  <SlidersHorizontal aria-hidden className="size-4" /> Filtres{activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-akua-blue text-[11px] text-akua-white">{activeCount}</span>}
                </button>
                <SearchSelect
                  value={sort}
                  onChange={(v) => set("tri", v === "pertinence" ? null : v)}
                  options={SORTS.map((x) => ({ value: x.id, label: x.label, display: `Trier : ${x.label}` }))}
                  searchable={false}
                  variant="pill"
                  aria-label="Trier les produits"
                  className="flex-1 sm:w-auto sm:flex-none"
                />
              </div>
            </div>

            {/* catégories rapides mobile */}
            <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
              <Link href="/boutique" className={cn("h-10 shrink-0 rounded-full px-4 text-[13.5px] leading-10 font-medium", !category ? "bg-akua-ink text-akua-white" : "bg-akua-white ring-1 ring-akua-gray-200")}>
                Tout
              </Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/boutique/${c.slug}`} className={cn("h-10 shrink-0 rounded-full px-4 text-[13.5px] leading-10 font-medium whitespace-nowrap", category?.id === c.id ? "bg-akua-ink text-akua-white" : "bg-akua-white ring-1 ring-akua-gray-200")}>
                  {c.shortName ?? c.name}
                </Link>
              ))}
            </div>

            {!!category?.groups?.length && (
              <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:mt-4 lg:flex-wrap lg:px-0" role="tablist" aria-label={`Rayons de ${category.name}`}>
                <button type="button" role="tab" aria-selected={!type} onClick={() => set("type", null)} className={cn("h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold whitespace-nowrap transition-colors", !type ? "bg-akua-blue text-akua-white" : "bg-akua-blue-100/70 text-akua-blue hover:bg-akua-blue-100")}>
                  Tout
                </button>
                {category.groups.map((g) => (
                  <button key={g.slug} type="button" role="tab" aria-selected={type === g.slug} onClick={() => set("type", g.slug)} className={cn("h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold whitespace-nowrap transition-colors", type === g.slug ? "bg-akua-blue text-akua-white" : "bg-akua-blue-100/70 text-akua-blue hover:bg-akua-blue-100")}>
                    {g.name}
                  </button>
                ))}
              </div>
            )}

            <div className={cn("mt-5 grid grid-cols-2 gap-2.5 transition-opacity md:grid-cols-3 md:gap-4 xl:gap-5", pending && "opacity-50")}>
              {visible.length ? visible.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 3} />) : <EmptyState />}
            </div>

            {pages > 1 && (
              <nav aria-label="Pagination" className="mt-8 flex items-center justify-between rounded-2xl bg-akua-white px-3 py-2.5 ring-1 ring-akua-gray-200">
                <button type="button" onClick={() => go(page - 1)} disabled={page === 1} className="flex h-10 items-center gap-2 rounded-full px-3 text-[13.5px] font-medium disabled:opacity-35">
                  <ArrowLeft aria-hidden className="size-4" /> <span className="hidden sm:inline">Précédent</span>
                </button>
                <ul className="flex items-center gap-1">
                  {pageList(page, pages).map((n, i) =>
                    n === "…" ? (
                      <li key={`e${i}`} className="px-2 text-akua-gray-500">
                        …
                      </li>
                    ) : (
                      <li key={n}>
                        <button
                          type="button"
                          onClick={() => go(n)}
                          aria-current={page === n ? "page" : undefined}
                          className={cn("grid size-10 place-items-center rounded-full text-[13.5px] font-medium transition-colors", page === n ? "bg-akua-ink text-akua-white" : "hover:bg-akua-tile")}
                        >
                          {n}
                        </button>
                      </li>
                    ),
                  )}
                </ul>
                <button type="button" onClick={() => go(page + 1)} disabled={page === pages} className="flex h-10 items-center gap-2 rounded-full px-3 text-[13.5px] font-medium disabled:opacity-35">
                  <span className="hidden sm:inline">Suivant</span> <ArrowRight aria-hidden className="size-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
        </div>
      </section>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="max-h-[88vh] gap-0 rounded-t-[12px] border-0 p-0 [&>button]:hidden">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-akua-gray-200" />
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <SheetTitle className="font-display text-[20px] font-semibold">Filtres</SheetTitle>
            <button type="button" onClick={() => setSheet(false)} aria-label="Fermer" className="grid size-10 place-items-center rounded-full bg-akua-tile">
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 pb-4">
            <ShopFilters category={category} inSheet />
          </div>
          <div className="border-t border-akua-gray-200 p-4">
            <button type="button" onClick={() => setSheet(false)} className="btn-shine h-12 w-full rounded-[10px] bg-akua-ink font-semibold text-akua-white">
              Voir {products.length} produits
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

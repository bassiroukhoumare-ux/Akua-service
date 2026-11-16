"use client";

import { Check, ChevronDown, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import type { BrandDef } from "@/data/brands";
import { PLATFORM_LABELS } from "@/lib/catalog";
import { getCategoryIcon, ICON_STROKE } from "@/lib/icons";
import { activeCount, brandCounts, CONDITIONS, EMPTY_FILTERS, type FilterState, posToPrice, priceMax, priceToPos, showsPlatforms, SLIDER_STEPS } from "@/lib/product-filters";
import { SHOP_PLATFORMS } from "@/lib/shop-params";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";

const fmt = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ")} F`;

/** Logo d'une marque (ou son nom, si la marque n'a pas de logo). */
export function BrandMark({ brand, className }: { brand: BrandDef; className?: string }) {
  if (!brand.logo) return <span className={cn("text-[13px] font-extrabold tracking-[-0.01em] whitespace-nowrap", className)}>{brand.name}</span>;
  return (
    <svg viewBox={brand.logo.viewBox} fill="currentColor" role="img" aria-label={brand.name} className={cn("h-5 w-auto max-w-full", className)}>
      <path d={brand.logo.d} />
    </svg>
  );
}

function Section({ title, hint, children, defaultOpen = true, badge }: { title: string; hint?: string; children: React.ReactNode; defaultOpen?: boolean; badge?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-akua-gray-200 py-5">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="flex items-center gap-2 text-[12px] font-extrabold tracking-[0.1em] text-akua-ink uppercase">
          {title}
          {!!badge && <span className="grid size-[18px] place-items-center rounded-full bg-akua-blue text-[10.5px] font-bold tracking-normal text-akua-white">{badge}</span>}
        </span>
        <ChevronDown aria-hidden className={cn("size-4 text-akua-gray-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-3.5">
          {hint && <p className="-mt-1.5 mb-3 text-[12.5px] leading-snug text-akua-gray-500">{hint}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

const chip = (on: boolean) =>
  cn("inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors", on ? "bg-akua-ink text-akua-white" : "bg-akua-white text-akua-ink ring-1 ring-akua-gray-200 hover:ring-akua-ink");

/** Curseur de prix à deux poignées (échelle progressive jusqu'au plafond). Le filtre s'applique quand on relâche. */
function PriceFilter({ max, value, onCommit }: { max: number; value: [number, number] | null; onCommit: (v: [number, number] | null) => void }) {
  const [lo, setLo] = useState(priceToPos(value?.[0] ?? 0, max));
  const [hi, setHi] = useState(priceToPos(value?.[1] ?? max, max));
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    setLo(priceToPos(value?.[0] ?? 0, max));
    setHi(priceToPos(value?.[1] ?? max, max));
    setTouched(false);
  }, [max, value?.[0], value?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!touched) return;
    const t = window.setTimeout(() => onCommit(lo <= 0 && hi >= SLIDER_STEPS ? null : [posToPrice(lo, max), posToPrice(hi, max)]), 450);
    return () => window.clearTimeout(t);
  }, [lo, hi, touched]); // eslint-disable-line react-hooks/exhaustive-deps
  const presets: { label: string; v: [number, number] }[] = [
    { label: "Moins de 50 000 F", v: [0, 50_000] },
    { label: "50 000 – 200 000 F", v: [50_000, 200_000] },
    { label: "200 000 – 500 000 F", v: [200_000, 500_000] },
    { label: "Plus de 500 000 F", v: [500_000, max] },
  ];
  const range = "range-thumb absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2";
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-xl bg-akua-page px-3 py-2">
          <p className="text-[11px] font-medium text-akua-gray-500">Minimum</p>
          <p className="truncate text-[14px] font-bold tabular-nums">{fmt(posToPrice(lo, max))}</p>
        </div>
        <div className="min-w-0 rounded-xl bg-akua-page px-3 py-2 text-right">
          <p className="text-[11px] font-medium text-akua-gray-500">Maximum</p>
          <p className="truncate text-[14px] font-bold tabular-nums">{fmt(posToPrice(hi, max))}</p>
        </div>
      </div>
      <div className="relative mx-[11px] mt-5 mb-1 h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-akua-gray-200" />
        <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-akua-blue" style={{ left: `${(lo / SLIDER_STEPS) * 100}%`, right: `${100 - (hi / SLIDER_STEPS) * 100}%` }} />
        <input
          type="range"
          aria-label="Prix minimum"
          aria-valuetext={fmt(posToPrice(lo, max))}
          min={0}
          max={SLIDER_STEPS}
          value={lo}
          onChange={(e) => {
            setLo(Math.min(Number(e.target.value), hi - 10));
            setTouched(true);
          }}
          className={cn(range, lo > SLIDER_STEPS * 0.9 && "z-[2]")}
        />
        <input
          type="range"
          aria-label="Prix maximum"
          aria-valuetext={fmt(posToPrice(hi, max))}
          min={0}
          max={SLIDER_STEPS}
          value={hi}
          onChange={(e) => {
            setHi(Math.max(Number(e.target.value), lo + 10));
            setTouched(true);
          }}
          className={range}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-akua-gray-500 tabular-nums">
        <span>0 F</span>
        <span>{fmt(max)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const on = !!value && value[0] === p.v[0] && value[1] === p.v[1];
          return (
            <button key={p.label} type="button" onClick={() => onCommit(on ? null : p.v)} aria-pressed={on} className={cn("h-8 rounded-full px-3 text-[12px] font-semibold transition-colors", on ? "bg-akua-ink text-akua-white" : "bg-akua-page text-akua-ink hover:bg-akua-gray-200")}>
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Panneau de filtres : catégories, prix, marques (avec logos), compatibilité, disponibilité, état.
 * Contrôlé : l'accueil filtre immédiatement, la boutique passe les filtres dans l'adresse de la page.
 */
export function FilterPanel({ value, onChange, inSheet }: { value: FilterState; onChange: (next: FilterState) => void; inSheet?: boolean }) {
  const { categories, products: all } = useCatalog();
  const [allBrands, setAllBrands] = useState(false);
  // catégories dépliées avec la flèche (pour voir leurs sous-rayons sans filtrer)
  const [opened, setOpened] = useState<string[]>([]);
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });
  const realCats = categories.filter((c) => c.slug !== "promos");
  const visible = useMemo(() => all.filter((p) => p.published !== false), [all]);
  const promoCount = visible.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).length;
  const current = realCats.find((c) => c.id === value.category);
  const scope: Product[] = useMemo(
    () => visible.filter((p) => (value.category === "promo" ? p.compareAtPrice && p.compareAtPrice > p.price : !value.category || p.categoryId === value.category) && (!value.group || p.group === value.group)),
    [visible, value.category, value.group],
  );
  const brands = useMemo(() => brandCounts(scope), [scope]);
  // une marque cochée reste visible même si elle sort du périmètre
  const shownBrands = allBrands ? brands : brands.slice(0, 9);
  const max = useMemo(() => priceMax(visible), [visible]);
  const n = activeCount(value);
  const catRow = (on: boolean) => cn("flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[13.5px] transition-colors", on ? "bg-akua-ink font-semibold text-akua-white" : "text-akua-ink hover:bg-akua-page");
  const countCls = (on: boolean) => cn("text-[12px] tabular-nums", on ? "text-akua-white/70" : "text-akua-gray-500");

  return (
    <div>
      <div className={cn("flex items-center justify-between pb-4", inSheet && n === 0 && !value.category && "hidden")}>
        <p className={cn("flex items-center gap-2 text-[17px] font-extrabold tracking-[-0.01em]", inSheet && "invisible")}>
          <SlidersHorizontal aria-hidden className="size-[18px]" strokeWidth={2} /> Filtres
          {n > 0 && <span className="grid size-5 place-items-center rounded-full bg-akua-blue text-[11px] font-bold text-akua-white">{n}</span>}
        </p>
        {(n > 0 || value.category) && (
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="text-[13px] font-semibold text-akua-blue">
            Tout effacer
          </button>
        )}
      </div>

      <Section title="Catégories">
        <ul className="space-y-0.5">
          <li>
            <button type="button" onClick={() => set({ category: null, group: null })} className={cn(catRow(!value.category), "pr-9")}>
              <LayoutGrid aria-hidden className="size-4 shrink-0" strokeWidth={ICON_STROKE} />
              <span className="flex-1 truncate">Tous les produits</span>
              <span className={countCls(!value.category)}>{visible.length}</span>
            </button>
          </li>
          {realCats.map((c) => {
            const Icon = getCategoryIcon(c.icon);
            const on = value.category === c.id;
            const hasGroups = !!c.groups?.length;
            // déplié : catégorie choisie, ou ouverte avec la flèche pour voir ce qu'elle contient
            const open = hasGroups && (on || opened.includes(c.id));
            return (
              <li key={c.id}>
                <div className={cn("flex h-10 items-center rounded-xl transition-colors", on ? "bg-akua-ink text-akua-white" : "text-akua-ink hover:bg-akua-page")}>
                  <button type="button" onClick={() => set({ category: on ? null : c.id, group: null })} aria-pressed={on} className={cn("flex h-full min-w-0 flex-1 items-center gap-2.5 pl-3 text-left text-[13.5px]", on && "font-semibold")}>
                    <Icon aria-hidden className="size-4 shrink-0" strokeWidth={ICON_STROKE} />
                    <span className="flex-1 truncate">{c.shortName ?? c.name}</span>
                    <span className={countCls(on)}>{visible.filter((p) => p.categoryId === c.id).length}</span>
                  </button>
                  {hasGroups ? (
                    <button
                      type="button"
                      onClick={() => setOpened((o) => (o.includes(c.id) ? o.filter((x) => x !== c.id) : [...o, c.id]))}
                      aria-expanded={open}
                      aria-label={`${open ? "Replier" : "Voir le contenu de"} ${c.name}`}
                      className={cn("grid size-9 shrink-0 place-items-center rounded-lg transition-colors", on ? "text-akua-white/80 hover:text-akua-white" : "text-akua-gray-500 hover:bg-akua-white hover:text-akua-ink")}
                    >
                      <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-300", open && "rotate-180")} strokeWidth={2.2} />
                    </button>
                  ) : (
                    <span className="w-3 shrink-0" />
                  )}
                </div>
                {open && (
                  <ul className="mt-1 mb-2 ml-5 space-y-0.5 border-l-2 border-akua-gray-200 pl-2">
                    {c.groups!.map((g) => {
                      const sel = on && value.group === g.slug;
                      return (
                        <li key={g.slug}>
                          <button
                            type="button"
                            onClick={() => set({ category: c.id, group: sel ? null : g.slug })}
                            aria-pressed={sel}
                            className={cn("flex h-8 w-full items-center justify-between gap-2 rounded-lg px-2.5 text-left text-[13px] transition-colors", sel ? "bg-akua-blue-100 font-semibold text-akua-blue" : "text-akua-gray-500 hover:bg-akua-page hover:text-akua-ink")}
                          >
                            <span className="truncate">{g.name}</span>
                            <span className="text-[11.5px] tabular-nums">{visible.filter((p) => p.categoryId === c.id && p.group === g.slug).length}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => set({ category: value.category === "promo" ? null : "promo", group: null })} aria-pressed={value.category === "promo"} className={cn(catRow(value.category === "promo"), "pr-9")}>
              {(() => {
                const Icon = getCategoryIcon("percent");
                return <Icon aria-hidden className="size-4 shrink-0" strokeWidth={ICON_STROKE} />;
              })()}
              <span className="flex-1 truncate">Promotions</span>
              <span className={countCls(value.category === "promo")}>{promoCount}</span>
            </button>
          </li>
        </ul>
      </Section>

      <Section title="Prix" badge={value.price ? 1 : 0}>
        <PriceFilter max={max} value={value.price} onCommit={(price) => set({ price })} />
      </Section>

      {brands.length > 0 && (
        <Section title="Marques" badge={value.brands.length}>
          <ul className="grid grid-cols-3 gap-1.5">
            {shownBrands.map(({ brand, n: count }) => {
              const on = value.brands.includes(brand.id);
              return (
                <li key={brand.id}>
                  <button
                    type="button"
                    onClick={() => set({ brands: on ? value.brands.filter((b) => b !== brand.id) : [...value.brands, brand.id] })}
                    aria-pressed={on}
                    title={`${brand.name} (${count})`}
                    className={cn(
                      "relative flex h-[58px] w-full flex-col items-center justify-center gap-1 rounded-xl px-1.5 transition-colors",
                      on ? "bg-akua-ink text-akua-white" : "bg-akua-page text-akua-ink hover:bg-akua-gray-200",
                    )}
                  >
                    <BrandMark brand={brand} className="h-[18px]" />
                    <span className={cn("text-[10.5px] font-medium tabular-nums", on ? "text-akua-white/70" : "text-akua-gray-500")}>{count}</span>
                    {on && <Check aria-hidden className="absolute top-1 right-1 size-3" strokeWidth={3} />}
                  </button>
                </li>
              );
            })}
          </ul>
          {brands.length > 9 && (
            <button type="button" onClick={() => setAllBrands((v) => !v)} className="mt-2.5 text-[13px] font-semibold text-akua-blue">
              {allBrands ? "Moins de marques" : `Voir les ${brands.length} marques`}
            </button>
          )}
        </Section>
      )}

      {showsPlatforms(current) && value.category !== "promo" && (
        <Section title="Compatible avec" hint="Affichez seulement les consoles, jeux et manettes faits pour votre appareil." badge={value.platforms.length}>
          <div className="flex flex-wrap gap-2">
            {SHOP_PLATFORMS.map((pl) => {
              const on = value.platforms.includes(pl);
              return (
                <button key={pl} type="button" onClick={() => set({ platforms: on ? value.platforms.filter((x) => x !== pl) : [...value.platforms, pl] })} aria-pressed={on} className={chip(on)}>
                  {on && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
                  {PLATFORM_LABELS[pl]}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Disponibilité" badge={value.inStock ? 1 : 0}>
        <button type="button" role="switch" aria-checked={value.inStock} onClick={() => set({ inStock: !value.inStock })} className="flex w-full items-center justify-between gap-3 text-left">
          <span className="text-[14px] font-medium">En stock uniquement</span>
          <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", value.inStock ? "bg-akua-blue" : "bg-akua-gray-200")}>
            <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-akua-white shadow transition-transform", value.inStock && "translate-x-5")} />
          </span>
        </button>
      </Section>

      <Section title="État" badge={value.condition ? 1 : 0}>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((e) => {
            const on = value.condition === e.id;
            return (
              <button key={e.id} type="button" onClick={() => set({ condition: on ? null : e.id })} aria-pressed={on} className={chip(on)}>
                {on && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
                {e.label}
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

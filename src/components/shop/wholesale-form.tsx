"use client";

import { useMoney } from "@/components/currency";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LayoutGrid, ListFilter, Minus, PackagePlus, PencilLine, Plus, Search, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { allCountryOptions } from "@/components/ui/country-options";
import { SearchSelect } from "@/components/ui/search-select";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { categoryImages } from "@/data/category-media";
import { SITE_URL } from "@/config/site";
import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildWholesaleLink } from "@/lib/whatsapp";
import type { Product } from "@/types/catalog";

const OTHER = "Autre";
const COUNTRY_OPTIONS = allCountryOptions(OTHER);
const DEFAULT_QTY = 10;
const MAX_QTY = 9999;

const MODES = [
  { id: "site" as const, icon: ListFilter, t: "Choisir parmi les produits du site", d: "Par catégorie, puis ajoutez ce qui vous intéresse" },
  { id: "manual" as const, icon: PencilLine, t: "Écrire ma liste moi-même", d: "Saisissez le nom de chaque produit" },
];

/** Ligne de la demande : un produit du site, ou un produit saisi à la main. */
type Line = { key: string; product?: Product; label: string; qty: number };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function Thumb({ src, sizes = "56px" }: { src?: string; sizes?: string }) {
  if (!src) return <PackagePlus aria-hidden className="size-5 text-akua-gray-500" strokeWidth={1.6} />;
  if (src.startsWith("/") && !src.startsWith("/api/")) return <Image src={src} alt="" fill sizes={sizes} className="object-contain p-1" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className="absolute inset-0 size-full object-contain p-1" />;
}

/** Tous les produits du site : filtre par catégorie et recherche par nom de produit ou d'appareil. */
function ProductBrowser({ selected, onToggle }: { selected: Set<string>; onToggle: (p: Product) => void }) {
  const { products, categories } = useCatalog();
  const [q, setQ] = useState("");
  // null : la personne choisit d'abord une catégorie
  const [cat, setCat] = useState<string | null>(null);
  const cats = useMemo(() => categories.filter((c) => c.slug !== "promos"), [categories]);
  const visible = useMemo(() => products.filter((p) => p.published !== false), [products]);
  const money = useMoney();

  const list = useMemo(() => {
    const words = norm(q.trim()).split(/\s+/).filter(Boolean);
    const text = (p: Product) => {
      const c = categories.find((x) => x.id === p.categoryId);
      const g = c?.groups?.find((x) => x.slug === p.group)?.name ?? "";
      return norm(`${p.name} ${p.platforms.join(" ")} ${(p.otherPlatforms ?? []).join(" ")} ${c?.name ?? ""} ${g} ${(p.compatibility ?? []).join(" ")}`);
    };
    const scope = words.length && !cat ? "all" : cat;
    const hits = visible.filter((p) => (scope === "all" || p.categoryId === scope) && words.every((w) => text(p).includes(w)));
    // le plus pertinent d'abord : nom qui contient le premier mot cherché, au plus tôt
    if (!words.length) return hits;
    const rank = (p: Product) => {
      const i = norm(p.name).indexOf(words[0]);
      return i === -1 ? 1000 : i;
    };
    return [...hits].sort((a, b) => rank(a) - rank(b));
  }, [visible, categories, q, cat]);

  const count = (id: string) => visible.filter((p) => id === "all" || p.categoryId === id).length;
  const chips = [{ id: "all", label: "Tout" }, ...cats.map((c) => ({ id: c.id, label: c.shortName ?? c.name }))];
  const picking = !cat && !q.trim();

  return (
    <div className="overflow-hidden rounded-2xl border border-akua-gray-200">
      <div className="border-b border-akua-gray-200 bg-akua-page/60 p-3 md:p-4">
        <div className="flex h-12 items-center gap-3 rounded-xl border border-akua-gray-200 bg-akua-white px-3.5 transition-colors focus-within:border-akua-blue">
          <Search aria-hidden className="size-[18px] shrink-0 text-akua-gray-500" strokeWidth={1.8} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            aria-label="Rechercher un produit ou un appareil"
            placeholder="Nom du produit ou de l'appareil…"
            className="h-full min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-akua-gray-500"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Effacer la recherche" className="grid size-7 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-page hover:text-akua-ink">
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>
        {!picking && (
          <div role="tablist" aria-label="Filtrer par catégorie" className="no-scrollbar -mx-3 mt-3 flex gap-2 overflow-x-auto px-3 md:-mx-4 md:flex-wrap md:px-4">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={(cat ?? "all") === c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                  (cat ?? "all") === c.id ? "bg-akua-ink text-akua-white" : "border border-akua-gray-200 bg-akua-white text-akua-gray-500 hover:text-akua-ink",
                )}
              >
                {c.label}
                <span className={cn("text-[11.5px] tabular-nums", (cat ?? "all") === c.id ? "text-akua-white/70" : "text-akua-gray-500")}>{count(c.id)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {picking ? (
        <div className="p-3 md:p-4">
          <p className="px-1 text-[13px] font-semibold text-akua-ink">Choisissez une catégorie</p>
          <ul className="mt-3 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 md:grid-cols-3 md:gap-2.5">
            {[...cats, { id: "all", slug: "all", name: "Tous les produits", image: undefined }].map((c) => {
              const img = c.image ?? (c.id === "all" ? undefined : categoryImages[c.id]);
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setCat(c.id)} className="group flex w-full items-center gap-3 rounded-2xl border border-akua-gray-200 bg-akua-white p-2.5 text-left transition-colors hover:border-akua-ink">
                    <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-akua-tile">
                      {img ? <Thumb src={img} /> : <LayoutGrid aria-hidden className="size-5 text-akua-ink" strokeWidth={1.6} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[13.5px] leading-tight font-bold text-akua-ink">{c.name}</span>
                      <span className="mt-0.5 block text-[12px] text-akua-gray-500">
                        {count(c.id)} produit{count(c.id) > 1 ? "s" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <ul className="max-h-[380px] divide-y divide-akua-gray-200 overflow-y-auto overscroll-contain" aria-label="Produits du site">
          {list.map((p) => {
            const on = selected.has(p.id);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => onToggle(p)} aria-pressed={on} className={cn("flex w-full items-center gap-3 p-2.5 text-left transition-colors md:px-4", on ? "bg-akua-blue-100/60" : "hover:bg-akua-page")}>
                  <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-akua-tile">
                    <Thumb src={p.images[0]} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[14px] leading-snug font-semibold text-akua-ink">{p.name}</span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-akua-gray-500">{money(p.price)} l&apos;unité en boutique</span>
                  </span>
                  <span className={cn("flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors", on ? "bg-akua-ink text-akua-white" : "border border-akua-gray-200 bg-akua-white text-akua-ink")}>
                    {on ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
                    <span className="hidden sm:inline">{on ? "Ajouté" : "Ajouter"}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="px-4 py-8 text-center text-[13.5px] text-akua-gray-500">Aucun produit trouvé. Vous pouvez l&apos;écrire vous-même dans « Écrire ma liste ».</li>}
        </ul>
      )}
    </div>
  );
}

/** Produit absent du site : saisi à la main. */
function ManualAdd({ onAdd }: { onAdd: (name: string) => void }) {
  const [v, setV] = useState("");
  const add = () => {
    if (!v.trim()) return;
    onAdd(v.trim());
    setV("");
  };
  return (
    <div className="flex gap-2">
      <input
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        aria-label="Produit non listé sur le site"
        placeholder="Nom du produit (ex. Imprimante Epson L3250)"
        className="h-12 min-w-0 flex-1 rounded-xl border border-akua-gray-200 bg-akua-white px-3.5 text-[14px] outline-none transition-colors focus:border-akua-blue"
      />
      <button type="button" onClick={add} disabled={!v.trim()} className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl bg-akua-ink px-4 text-[13.5px] font-semibold text-akua-white transition-opacity disabled:opacity-40">
        <Plus aria-hidden className="size-4" /> <span className="hidden sm:inline">Ajouter</span>
      </button>
    </div>
  );
}

function QtyStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const set = (n: number) => onChange(Math.max(1, Math.min(MAX_QTY, Number.isFinite(n) ? Math.round(n) : 1)));
  return (
    <div className="flex h-10 shrink-0 items-center rounded-full border border-akua-gray-200 bg-akua-white">
      <button type="button" onClick={() => set(value - 1)} aria-label={`Retirer une unité : ${label}`} className="grid size-10 place-items-center text-akua-ink disabled:opacity-30" disabled={value <= 1}>
        <Minus aria-hidden className="size-4" />
      </button>
      <input
        inputMode="numeric"
        aria-label={`Quantité : ${label}`}
        value={value}
        onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")) || 1)}
        onFocus={(e) => e.target.select()}
        className="w-11 bg-transparent text-center text-[14.5px] font-bold tabular-nums outline-none"
      />
      <button type="button" onClick={() => set(value + 1)} aria-label={`Ajouter une unité : ${label}`} className="grid size-10 place-items-center text-akua-ink">
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}

export function WholesaleForm() {
  const [f, setF] = useState({ name: "", company: "", phone: "", country: "Togo", otherCountry: "", city: "", address: "", message: "" });
  const [lines, setLines] = useState<Line[]>([]);
  const [mode, setMode] = useState<"site" | "manual" | null>(null);
  const [error, setError] = useState(false);
  const isOther = f.country === OTHER;
  const field = "h-12 w-full rounded-2xl border border-akua-gray-200 bg-akua-white px-4 text-[14.5px] outline-none transition-colors focus:border-akua-blue";
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const selected = useMemo(() => new Set(lines.flatMap((l) => (l.product ? [l.product.id] : []))), [lines]);
  const units = lines.reduce((n, l) => n + l.qty, 0);
  const money = useMoney();

  const toggle = (p: Product) => {
    setError(false);
    setLines((ls) => (ls.some((l) => l.product?.id === p.id) ? ls.filter((l) => l.product?.id !== p.id) : [...ls, { key: p.id, product: p, label: p.name, qty: DEFAULT_QTY }]));
  };
  const addManual = (name: string) => {
    setError(false);
    setLines((ls) => (ls.some((l) => !l.product && norm(l.label) === norm(name)) ? ls : [...ls, { key: `libre-${Date.now()}`, label: name, qty: DEFAULT_QTY }]));
  };

  const step = "flex items-center gap-2.5 text-[15px] font-bold text-akua-ink";
  const num = "grid size-6 place-items-center rounded-full bg-akua-ink text-[12px] font-bold text-akua-white";
  const lab = "mb-1.5 block text-[13px] font-medium";
  const opt = <span className="font-normal text-akua-gray-500"> (facultatif)</span>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!lines.length) {
          setError(true);
          document.getElementById("wh-selection")?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        const products = lines
          .map((l) => (l.product ? `• ${l.qty} × ${l.product.name} (${formatFCFA(l.product.price)} l'unité en boutique)\n  ${SITE_URL}/produit/${l.product.slug}` : `• ${l.qty} × ${l.label} (non listé sur le site)`))
          .join("\n");
        window.open(
          buildWholesaleLink({
            name: f.name.trim(),
            company: f.company.trim() || undefined,
            phone: f.phone.trim(),
            country: isOther ? f.otherCountry.trim() : f.country,
            city: f.city.trim(),
            address: f.address.trim(),
            products: `${products}\nTotal : ${units} unités`,
            message: f.message.trim() || undefined,
          }),
          "_blank",
          "noopener",
        );
      }}
      className="overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white shadow-card"
    >
      {/* 1. Produits */}
      <fieldset className="min-w-0 p-5 md:p-8">
        <legend className="contents">
          <span className={step}>
            <span className={num}>1</span> Produits et quantités
          </span>
        </legend>
        <p className="mt-1.5 text-[13.5px] text-akua-gray-500">Comment voulez-vous indiquer les produits qui vous intéressent ?</p>
        <div role="tablist" aria-label="Façon d'ajouter les produits" className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {MODES.map((m) => {
            const on = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setMode(m.id)}
                className={cn("flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors", on ? "border-akua-ink bg-akua-ink text-akua-white" : "border-akua-gray-200 bg-akua-white hover:border-akua-ink")}
              >
                <m.icon aria-hidden className={cn("size-6 shrink-0", on ? "text-akua-white" : "text-akua-blue")} strokeWidth={1.6} />
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-bold">{m.t}</span>
                  <span className={cn("block text-[12.5px]", on ? "text-akua-white/70" : "text-akua-gray-500")}>{m.d}</span>
                </span>
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {mode && (
            <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="mt-4">
              {mode === "site" ? <ProductBrowser selected={selected} onToggle={toggle} /> : <ManualAdd onAdd={addManual} />}
            </motion.div>
          )}
        </AnimatePresence>

        <div id="wh-selection" className="mt-6 scroll-mt-32">
          <p className="flex items-baseline justify-between gap-3 text-[14px] font-bold text-akua-ink">
            Votre sélection
            {lines.length > 0 && (
              <span className="text-[13px] font-normal text-akua-gray-500">
                {lines.length} produit{lines.length > 1 ? "s" : ""} · <span className="font-bold text-akua-ink tabular-nums">{units}</span> unités
              </span>
            )}
          </p>
          {lines.length > 0 ? (
            <ul className="mt-3 divide-y divide-akua-gray-200 rounded-2xl border border-akua-gray-200">
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.li key={l.key} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap md:p-3.5">
                      <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-akua-tile">
                        <Thumb src={l.product?.images[0]} />
                      </span>
                      <span className="min-w-0 flex-1 basis-[calc(100%-120px)] sm:basis-auto">
                        <span className="line-clamp-2 text-[14px] leading-snug font-semibold text-akua-ink">{l.label}</span>
                        <span className="mt-0.5 block text-[12.5px] text-akua-gray-500">{l.product ? `${money(l.product.price)} l'unité en boutique` : "Non listé sur le site"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}
                        aria-label={`Retirer ${l.label}`}
                        className="order-last grid size-10 shrink-0 place-items-center rounded-full text-akua-gray-500 transition-colors hover:bg-akua-page hover:text-akua-red sm:order-none"
                      >
                        <X aria-hidden className="size-4" />
                      </button>
                      <div className="ml-[68px] sm:ml-0">
                        <QtyStepper value={l.qty} label={l.label} onChange={(qty) => setLines((ls) => ls.map((x) => (x.key === l.key ? { ...x, qty } : x)))} />
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className={cn("mt-3 rounded-2xl border border-dashed px-4 py-6 text-center text-[13.5px]", error ? "border-akua-red bg-akua-red/5 text-akua-red" : "border-akua-gray-200 text-akua-gray-500")}>
              {error ? "Ajoutez au moins un produit à votre demande." : "Aucun produit ajouté pour le moment."}
            </div>
          )}
        </div>
      </fieldset>

      {/* 2. Coordonnées */}
      <fieldset className="grid min-w-0 gap-4 border-t border-akua-gray-200 p-5 md:grid-cols-2 md:p-8">
        <legend className="contents">
          <span className={cn(step, "md:col-span-2")}>
            <span className={num}>2</span> Vos coordonnées
          </span>
        </legend>
        <label className="block">
          <span className={lab}>Nom et prénom</span>
          <input required value={f.name} onChange={up("name")} className={field} autoComplete="name" />
        </label>
        <label className="block">
          <span className={lab}>Entreprise{opt}</span>
          <input value={f.company} onChange={up("company")} className={field} autoComplete="organization" placeholder="Ex. Boutique, école, salle de jeux…" />
        </label>
        <label className="block">
          <span className={lab}>Téléphone (WhatsApp)</span>
          <input required type="tel" value={f.phone} onChange={up("phone")} className={field} placeholder="+228 …" autoComplete="tel" />
        </label>
        <div>
          <label htmlFor="wh-country" className={lab}>
            Pays
          </label>
          <SearchSelect
            id="wh-country"
            value={f.country}
            onChange={(country) => setF((s) => ({ ...s, country }))}
            options={COUNTRY_OPTIONS}
            searchPlaceholder="Rechercher un pays…"
            emptyText="Pays introuvable : choisissez « Autre pays » en bas de la liste."
          />
        </div>
        {isOther && (
          <label className="block md:col-span-2">
            <span className={lab}>Votre pays</span>
            <input required autoFocus value={f.otherCountry} onChange={up("otherCountry")} className={field} placeholder="Ex. Sénégal, Nigeria, Guinée…" autoComplete="country-name" />
          </label>
        )}
        <label className="block">
          <span className={lab}>Ville</span>
          <input required value={f.city} onChange={up("city")} className={field} placeholder="Ex. Lomé" autoComplete="address-level2" />
        </label>
        <label className="block">
          <span className={lab}>Adresse exacte</span>
          <input required value={f.address} onChange={up("address")} className={field} placeholder="Quartier, rue, point de repère" autoComplete="street-address" />
        </label>
      </fieldset>

      {/* 3. Message */}
      <fieldset className="min-w-0 border-t border-akua-gray-200 p-5 md:p-8">
        <legend className="contents">
          <span className={step}>
            <span className={num}>3</span> Votre message <span className="text-[13px] font-medium text-akua-gray-500">(facultatif)</span>
          </span>
        </legend>
        <textarea value={f.message} onChange={up("message")} rows={4} className={`${field} mt-3 h-auto py-3`} placeholder="Ex. livraison souhaitée avant la fin du mois, commande régulière chaque trimestre, budget…" />
        <button type="submit" className="btn-shine mt-5 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-full bg-akua-whatsapp text-[15.5px] font-semibold text-akua-white">
          <WhatsAppIcon size={20} /> Envoyer ma demande sur WhatsApp
        </button>
        <p className="mt-3 text-center text-[12.5px] text-akua-gray-500">Votre demande s&apos;ouvre dans WhatsApp, prête à être envoyée. Nous vous répondons avec nos meilleurs tarifs.</p>
      </fieldset>
    </form>
  );
}

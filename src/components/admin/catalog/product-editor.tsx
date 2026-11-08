"use client";

import {
  ArrowLeft,
  BadgeCheck,
  Box,
  Check,
  Eye,
  EyeOff,
  Info,
  Package,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SearchSelect } from "@/components/ui/search-select";
import { btn } from "@/lib/btn";
import { PLATFORM_LABELS } from "@/lib/catalog";
import { discountPercent, formatFCFA } from "@/lib/format";
import { getCategoryIcon } from "@/lib/icons";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { newProductId, slugify, useAdminCatalog } from "@/store/admin-catalog";
import type { Condition, Packaging, Platform, Product, ProductBadgeType, StockStatus } from "@/types/catalog";
import { useAdmin } from "../actor-context";
import { Field, inputCls, PriceInput, Segmented, TagInput, Toggle } from "../form";
import { ImageUploader } from "./image-uploader";

const PLATFORMS: Platform[] = ["ps5", "ps4", "ps3", "switch2", "switch", "xbox-series", "xbox-360", "pc", "android", "ios"];
const COMPAT_SUGGEST = ["Télévision HDMI", "Jeu en ligne", "Netflix", "YouTube", "Compte PlayStation", "Wi-Fi", "Bluetooth", "PC Windows", "Smartphone Android", "iPhone"];
const PACK_SUGGEST = ["1 console", "2 manettes sans fil", "Câble HDMI", "Câble d'alimentation", "Câble de charge", "Jeux installés", "Tous les accessoires"];
const BOX_SUGGEST = ["Câble de charge", "Notice", "Câble HDMI", "Adaptateur secteur"];
const STOCK: { value: StockStatus; label: string }[] = [
  { value: "en_stock", label: "En stock" },
  { value: "stock_faible", label: "Stock limité" },
  { value: "sur_commande", label: "Sur commande" },
  { value: "rupture", label: "Rupture" },
];

type Draft = {
  isPack: boolean;
  name: string;
  categoryId: string;
  images: string[];
  shortDescription: string;
  description: string;
  promo: boolean;
  price?: number;
  compareAt?: number;
  includes: string[];
  condition: Condition;
  packaging: Packaging;
  platforms: Platform[];
  compatibility: string[];
  stockStatus: StockStatus;
  stockLeft?: number;
  warranty: boolean;
  warrantyLabel: string;
  wholesale: boolean;
  featured: boolean;
  isNew: boolean;
  published: boolean;
};
type Errors = Partial<Record<"images" | "name" | "categoryId" | "shortDescription" | "price" | "compareAt" | "includes" | "stockLeft", string>>;

function toDraft(p?: Product, pack?: boolean): Draft {
  return {
    isPack: p?.isPack ?? !!pack,
    name: p?.name ?? "",
    categoryId: p?.categoryId ?? (pack ? "cat-packs" : ""),
    images: p?.images ?? [],
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    promo: !!p?.compareAtPrice,
    price: p?.price,
    compareAt: p?.compareAtPrice,
    includes: p?.includes ?? [],
    condition: p?.condition ?? "neuf",
    packaging: p?.packaging ?? "carton",
    platforms: p?.platforms ?? [],
    compatibility: p?.compatibility ?? [],
    stockStatus: p?.stockStatus ?? "en_stock",
    stockLeft: p?.stockLeft,
    warranty: p?.warranty ?? true,
    warrantyLabel: p?.warrantyLabel ?? "",
    wholesale: p?.wholesale ?? false,
    featured: !!p?.isFeatured,
    isNew: p?.badges.includes("nouveau") ?? !p,
    published: p?.published ?? true,
  };
}

function Section({ n, title, description, children }: { n: number; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-akua-ink text-[12.5px] font-bold text-akua-white">{n}</span>
        <div>
          <h2 className="text-[16.5px] font-bold tracking-[-0.01em]">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-akua-gray-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** Création et modification d'un produit ou d'un pack, avec aperçu en direct de la carte du site. */
export function ProductEditor({ productId, pack }: { productId?: string; pack?: boolean }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const { actor, base } = useAdmin();
  const products = useAdminCatalog((s) => s.products);
  const categories = useAdminCatalog((s) => s.categories);
  const saveProduct = useAdminCatalog((s) => s.saveProduct);
  const deleteProduct = useAdminCatalog((s) => s.deleteProduct);
  const existing = productId ? products.find((p) => p.id === productId) : undefined;

  const [d, setD] = useState<Draft>(() => toDraft(existing, pack));
  const [errors, setErrors] = useState<Errors>({});
  const [loaded, setLoaded] = useState(!productId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // le catalogue est lu depuis ce navigateur : on remplit le formulaire une fois chargé
  useEffect(() => {
    if (hydrated && !loaded) {
      setD(toDraft(existing, pack));
      setLoaded(true);
    }
  }, [hydrated, loaded, existing, pack]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((x) => ({ ...x, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const listHref = `${base}/produits`;
  const pct = d.promo && d.price && d.compareAt ? (discountPercent(d.price, d.compareAt) ?? 0) : 0;
  const catOptions = useMemo(
    () =>
      [...categories]
        .sort((a, b) => a.order - b.order)
        .map((c) => {
          const Icon = getCategoryIcon(c.icon);
          return { value: c.id, label: c.name, icon: <Icon className="size-[18px] shrink-0 text-akua-gray-500" strokeWidth={1.7} /> };
        }),
    [categories],
  );

  function build(): Product {
    const keep = (existing?.badges ?? []).filter((b): b is ProductBadgeType => b === "best-seller" || b === "premium");
    const badges: ProductBadgeType[] = [...keep];
    if (d.promo) badges.push("promo");
    if (d.isNew) badges.push("nouveau");
    if (d.warranty) badges.push("garantie");
    let slug = existing?.slug ?? slugify(d.name);
    if (!existing) {
      const base0 = slug || "produit";
      let i = 2;
      while (products.some((p) => p.slug === slug)) slug = `${base0}-${i++}`;
    }
    return {
      ...(existing ?? { id: newProductId(), createdAt: new Date().toISOString().slice(0, 10) }),
      slug,
      name: d.name.trim(),
      categoryId: d.categoryId,
      platforms: d.platforms,
      condition: d.condition,
      packaging: d.packaging,
      price: d.price ?? 0,
      compareAtPrice: d.promo ? d.compareAt : undefined,
      stockStatus: d.stockStatus,
      stockLeft: d.stockStatus === "en_stock" || d.stockStatus === "stock_faible" ? d.stockLeft : undefined,
      images: d.images,
      badges,
      shortDescription: d.shortDescription.trim(),
      description: d.description.trim() || d.shortDescription.trim(),
      compatibility: d.compatibility,
      includes: d.includes,
      isPack: d.isPack,
      isFeatured: d.featured,
      warranty: d.warranty,
      warrantyLabel: d.warranty ? d.warrantyLabel.trim() || undefined : undefined,
      wholesale: d.wholesale,
      published: d.published,
    } as Product;
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!d.images.length) e.images = "Ajoutez au moins une photo.";
    if (d.name.trim().length < 3) e.name = "Indiquez le nom du produit.";
    if (!d.categoryId) e.categoryId = "Choisissez une catégorie.";
    if (d.shortDescription.trim().length < 10) e.shortDescription = "Décrivez le produit en une phrase (10 caractères minimum).";
    if (!d.price) e.price = d.promo ? "Indiquez le prix promotionnel." : "Indiquez le prix.";
    if (d.promo && (!d.compareAt || (d.price && d.compareAt <= d.price))) e.compareAt = "Le prix de départ doit être supérieur au prix promotionnel.";
    if (d.isPack && !d.includes.length) e.includes = "Indiquez ce que contient le pack.";
    if (d.stockStatus === "stock_faible" && !d.stockLeft) e.stockLeft = "Indiquez combien il en reste.";
    return e;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`pe-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const p = build();
    let detail: string | undefined;
    if (existing && existing.price !== p.price) detail = `prix : ${formatFCFA(existing.price)} → ${formatFCFA(p.price)}`;
    else if (!existing) detail = `${p.images.length} photo${p.images.length > 1 ? "s" : ""} · ${formatFCFA(p.price)}`;
    saveProduct(p, actor, detail);
    router.push(`${listHref}?ok=${existing ? "modifie" : "ajoute"}`);
  }

  if (!hydrated || !loaded) {
    return <div className="h-[60vh] animate-pulse rounded-[24px] bg-akua-white" />;
  }
  if (productId && !existing) {
    return (
      <div className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-10 text-center">
        <p className="text-[18px] font-bold">Produit introuvable</p>
        <p className="mt-1 text-[14px] text-akua-gray-500">Il a peut-être été supprimé.</p>
        <Link href={listHref} className={btn({ variant: "outline", size: "md", className: "mt-5" })}>
          Retour aux produits
        </Link>
      </div>
    );
  }

  const preview = build();
  const title = existing ? `Modifier ${existing.isPack ? "le pack" : "le produit"}` : d.isPack ? "Nouveau pack" : "Nouveau produit";
  const checklist = [
    { ok: d.images.length > 0, t: "Au moins une photo" },
    { ok: d.name.trim().length >= 3, t: "Nom du produit" },
    { ok: !!d.categoryId, t: "Catégorie" },
    { ok: !!d.price && (!d.promo || (!!d.compareAt && d.compareAt > d.price)), t: "Prix" },
    { ok: d.shortDescription.trim().length >= 10, t: "Description courte" },
    ...(d.isPack ? [{ ok: d.includes.length > 0, t: "Contenu du pack" }] : []),
  ];

  return (
    <form onSubmit={submit} noValidate className="pb-24 lg:pb-0">
      {/* en-tête */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href={listHref} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-akua-gray-500 hover:text-akua-ink">
            <ArrowLeft aria-hidden className="size-4" /> Produits
          </Link>
          <h1 className="mt-2 text-[26px] leading-[1.1] font-extrabold tracking-[-0.03em] md:text-[32px]">{title}</h1>
          {existing && (
            <p className="mt-1.5 text-[13.5px] text-akua-gray-500">
              {existing.createdBy ? `Ajouté par ${existing.createdBy}` : "Produit d'origine du catalogue"}
              {existing.updatedBy ? ` · modifié en dernier par ${existing.updatedBy}` : ""}
            </p>
          )}
        </div>
        <div className="hidden gap-2 lg:flex">
          {existing && (
            <button type="button" onClick={() => setConfirmDelete(true)} className={btn({ variant: "outline", size: "md", className: "text-akua-red hover:border-akua-red" })}>
              <Trash2 aria-hidden className="size-4" /> Supprimer
            </button>
          )}
          <Link href={listHref} className={btn({ variant: "outline", size: "md" })}>
            Annuler
          </Link>
          <button type="submit" className={btn({ variant: "primary", size: "md" })}>
            <Check aria-hidden className="size-4" /> {existing ? "Enregistrer" : d.isPack ? "Créer le pack" : "Créer le produit"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          {!existing && (
            <Section n={1} title="Type" description="Un pack regroupe plusieurs articles vendus ensemble (console, manettes, jeux…).">
              <Segmented
                value={d.isPack ? "pack" : "simple"}
                onChange={(v) => {
                  set("isPack", v === "pack");
                  if (v === "pack" && !d.categoryId) set("categoryId", "cat-packs");
                }}
                options={[
                  { value: "simple", label: "Produit", icon: Package },
                  { value: "pack", label: "Pack", icon: PackageOpen },
                ]}
              />
            </Section>
          )}

          <div id="pe-images">
            <Section n={existing ? 1 : 2} title="Photos" description="Jusqu'à 4 photos. Format carré conseillé, fond clair.">
              <ImageUploader value={d.images} onChange={(v) => set("images", v)} error={errors.images} />
            </Section>
          </div>

          <Section n={existing ? 2 : 3} title="Informations">
            <div className="grid gap-4">
              <Field id="pe-name" label={d.isPack ? "Nom du pack" : "Nom du produit"} error={errors.name}>
                <input id="pe-name" value={d.name} onChange={(e) => set("name", e.target.value)} placeholder={d.isPack ? "Ex. PS4 Slim Complète" : "Ex. Manette DualSense PS5"} className={inputCls(errors.name)} />
              </Field>
              <Field id="pe-categoryId" label="Catégorie" error={errors.categoryId}>
                <SearchSelect id="pe-categoryId" value={d.categoryId} onChange={(v) => set("categoryId", v)} options={catOptions} placeholder="Choisir une catégorie" searchPlaceholder="Rechercher une catégorie…" invalid={!!errors.categoryId} />
              </Field>
              <Field id="pe-shortDescription" label="Description courte" error={errors.shortDescription} hint={`${d.shortDescription.length}/140 · affichée sous le nom, sur la fiche produit`}>
                <input
                  id="pe-shortDescription"
                  value={d.shortDescription}
                  maxLength={140}
                  onChange={(e) => set("shortDescription", e.target.value)}
                  placeholder={d.isPack ? "Ex. 1 console, 2 manettes, 10 jeux et tous les accessoires." : "Ex. Manette sans fil officielle, retour haptique."}
                  className={inputCls(errors.shortDescription)}
                />
              </Field>
              <Field id="pe-description" label="Description détaillée" optional>
                <textarea
                  id="pe-description"
                  value={d.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                  placeholder="Points forts, état, ce qui rend ce produit intéressant…"
                  className={cn(inputCls(), "h-auto resize-y py-3 leading-relaxed")}
                />
              </Field>
            </div>
          </Section>

          <div id="pe-price">
            <Section n={existing ? 3 : 4} title="Prix" description="Activez le prix promotionnel pour afficher un prix barré et le pourcentage de réduction.">
              <div className="grid gap-4">
                <Toggle checked={d.promo} onChange={(v) => set("promo", v)} label="Prix promotionnel" description="Le prix de départ sera barré, le prix promo mis en avant." icon={Sparkles} />
                <div className={cn("grid gap-4", d.promo && "sm:grid-cols-2")}>
                  {d.promo && (
                    <Field id="pe-compareAt" label="Prix de départ (barré)" error={errors.compareAt}>
                      <PriceInput id="pe-compareAt" value={d.compareAt} onChange={(v) => set("compareAt", v)} error={errors.compareAt} placeholder="195 000" />
                    </Field>
                  )}
                  <Field id="pe-priceField" label={d.promo ? "Prix promotionnel" : "Prix"} error={errors.price}>
                    <PriceInput id="pe-priceField" value={d.price} onChange={(v) => set("price", v)} error={errors.price} placeholder="170 000" />
                  </Field>
                </div>
                {d.promo && pct > 0 && (
                  <div className="flex flex-wrap items-center gap-3 rounded-[16px] bg-akua-page px-4 py-3 text-[14px]">
                    <span className="rounded-full bg-akua-red px-2.5 py-1 text-[12.5px] font-bold text-akua-white">-{pct} %</span>
                    <span className="text-akua-gray-500 line-through tabular-nums">{formatFCFA(d.compareAt!)}</span>
                    <span className="font-extrabold text-akua-blue tabular-nums">{formatFCFA(d.price!)}</span>
                    <span className="text-akua-gray-500">· économie de {formatFCFA(d.compareAt! - d.price!)}</span>
                  </div>
                )}
              </div>
            </Section>
          </div>

          <div id="pe-includes">
            <Section
              n={existing ? 4 : 5}
              title={d.isPack ? "Contenu du pack" : "Dans la boîte"}
              description={d.isPack ? "Tout ce que le client reçoit. Un élément par ligne." : "Ce qui est livré avec le produit (facultatif)."}
            >
              <TagInput id="pe-includes-input" value={d.includes} onChange={(v) => set("includes", v)} placeholder={d.isPack ? "Ex. 2 manettes sans fil" : "Ex. Câble de charge"} suggestions={d.isPack ? PACK_SUGGEST : BOX_SUGGEST} ordered />
              {errors.includes && <p className="mt-2 text-[12.5px] font-medium text-akua-red">{errors.includes}</p>}
            </Section>
          </div>

          <Section n={existing ? 5 : 6} title="Caractéristiques">
            <div className="grid gap-5">
              <Field label="État du produit">
                <Segmented
                  value={d.condition}
                  onChange={(v) => set("condition", v)}
                  options={[
                    { value: "neuf", label: "Neuf", icon: BadgeCheck },
                    { value: "occasion", label: "Venant" },
                    { value: "reconditionne", label: "Reconditionné" },
                  ]}
                />
              </Field>
              <Field label="Emballage">
                <Segmented
                  value={d.packaging}
                  onChange={(v) => set("packaging", v)}
                  options={[
                    { value: "carton", label: "Dans son carton", icon: Box },
                    { value: "sans-carton", label: "Sans carton" },
                  ]}
                />
              </Field>
              <Field label="Plateformes" optional>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((pl) => {
                    const on = d.platforms.includes(pl);
                    return (
                      <button
                        key={pl}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("platforms", on ? d.platforms.filter((x) => x !== pl) : [...d.platforms, pl])}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
                          on ? "border-akua-blue bg-akua-blue-100 text-akua-blue" : "border-akua-gray-200 text-akua-ink hover:border-akua-ink",
                        )}
                      >
                        {on && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
                        {PLATFORM_LABELS[pl]}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Compatibilité" optional hint="Avec quoi le produit fonctionne : télévision, jeu en ligne, applications…">
                <TagInput value={d.compatibility} onChange={(v) => set("compatibility", v)} placeholder="Ex. Télévision HDMI" suggestions={COMPAT_SUGGEST} />
              </Field>
            </div>
          </Section>

          <div id="pe-stockLeft">
            <Section n={existing ? 6 : 7} title="Disponibilité">
              <div className="grid gap-4">
                <Segmented value={d.stockStatus} onChange={(v) => set("stockStatus", v)} options={STOCK} />
                {(d.stockStatus === "en_stock" || d.stockStatus === "stock_faible") && (
                  <Field id="pe-stock-qty" label="Quantité en stock" optional={d.stockStatus === "en_stock"} error={errors.stockLeft} hint={d.stockStatus === "stock_faible" ? "Affiché « Plus que X » sur le site." : undefined} className="max-w-[240px]">
                    <input
                      id="pe-stock-qty"
                      inputMode="numeric"
                      value={d.stockLeft ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                        set("stockLeft", v ? Number(v) : undefined);
                      }}
                      placeholder="Ex. 5"
                      className={inputCls(errors.stockLeft)}
                    />
                  </Field>
                )}
              </div>
            </Section>
          </div>

          <Section n={existing ? 7 : 8} title="Options">
            <div className="grid gap-3">
              <Toggle checked={d.warranty} onChange={(v) => set("warranty", v)} label="Produit garanti" description="Affiche la garantie sur la fiche produit." icon={ShieldCheck} />
              {d.warranty && (
                <Field id="pe-warranty" label="Durée de garantie" optional className="sm:max-w-[320px] sm:pl-1">
                  <input id="pe-warranty" value={d.warrantyLabel} onChange={(e) => set("warrantyLabel", e.target.value)} placeholder="Ex. 3 mois" className={inputCls()} />
                </Field>
              )}
              <Toggle checked={d.wholesale} onChange={(v) => set("wholesale", v)} label="Disponible en vente en gros" description="Propose un devis aux revendeurs et salles de jeux." icon={Store} />
              <Toggle checked={d.isNew} onChange={(v) => set("isNew", v)} label="Badge « Nouveau »" description="Met en avant un produit qui vient d'arriver." icon={Sparkles} />
              <Toggle checked={d.featured} onChange={(v) => set("featured", v)} label="Mettre en avant" description="Apparaît en priorité dans les suggestions." icon={BadgeCheck} />
            </div>
          </Section>
        </div>

        {/* aperçu */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-[96px]">
          <div className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5">
            <p className="text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Aperçu sur le site</p>
            <div className="pointer-events-none mx-auto mt-3 max-w-[260px] select-none" aria-hidden>
              <ProductCard product={{ ...preview, name: preview.name || (d.isPack ? "Nom du pack" : "Nom du produit"), images: d.images }} sizes="260px" />
            </div>
          </div>
          <div className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5">
            <Toggle
              checked={d.published}
              onChange={(v) => set("published", v)}
              label={d.published ? "Visible sur le site" : "Masqué du site"}
              description={d.published ? "Les clients peuvent le voir et le commander." : "Gardé en brouillon, invisible pour les clients."}
              icon={d.published ? Eye : EyeOff}
            />
            <p className="mt-4 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">À compléter</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {checklist.map((c) => (
                <li key={c.t} className={cn("flex items-center gap-2 text-[13.5px]", c.ok ? "text-akua-ink" : "text-akua-gray-500")}>
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", c.ok ? "bg-akua-whatsapp/15 text-[#128c4a]" : "bg-akua-page")}>{c.ok && <Check aria-hidden className="size-3" strokeWidth={3} />}</span>
                  {c.t}
                </li>
              ))}
            </ul>
          </div>
          <p className="flex items-start gap-2 px-1 text-[12.5px] text-akua-gray-500">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            Démonstration : le produit est enregistré dans ce navigateur. Il apparaîtra sur le site dès que la base de données sera branchée.
          </p>
        </aside>
      </div>

      {/* barre d'enregistrement mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-akua-gray-200 bg-akua-white/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        {existing && (
          <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Supprimer" className={btn({ variant: "outline", size: "icon", className: "text-akua-red" })}>
            <Trash2 aria-hidden className="size-[18px]" />
          </button>
        )}
        <Link href={listHref} className={btn({ variant: "outline", size: "md", className: "flex-1" })}>
          Annuler
        </Link>
        <button type="submit" className={btn({ variant: "primary", size: "md", className: "flex-[2]" })}>
          <Check aria-hidden className="size-4" /> {existing ? "Enregistrer" : "Créer"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Supprimer « ${existing?.name ?? ""} » ?`}
        description="Le produit sera retiré du catalogue. Pour le cacher temporairement, utilisez plutôt « Masqué du site »."
        onConfirm={() => {
          if (existing) deleteProduct(existing.id, actor);
          router.push(`${listHref}?ok=supprime`);
        }}
      />
    </form>
  );
}

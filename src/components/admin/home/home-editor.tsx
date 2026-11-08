"use client";

import { ArrowDown, ArrowUp, ArrowUpRight, Check, Eye, EyeOff, ImagePlus, Link2, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SearchSelect } from "@/components/ui/search-select";
import { cropToRatio, overflowAxis, readFile } from "@/lib/admin/image";
import { btn } from "@/lib/btn";
import { getCategoryIcon } from "@/lib/icons";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { HOME_SECTION_META, type HomeSection, type LinkKind, newSlideId, type Slide, SLOTS, type SlotId, useAdminHome } from "@/store/admin-home";
import { useAdmin } from "../actor-context";
import { Field, inputCls, Segmented, Toggle } from "../form";
import { DemoNotice, PageHeader } from "../ui";

const PAGES = [
  { value: "/boutique", label: "Boutique (tous les produits)" },
  { value: "/boutique/promos", label: "Promotions" },
  { value: "/packs", label: "Packs" },
  { value: "/vente-en-gros", label: "Vente en gros" },
  { value: "/contact", label: "Contact" },
  { value: "/livraison", label: "Livraison" },
];

/** Adresse finale d'un lien de slide. */
export function slideHref(s: Pick<Slide, "linkKind" | "link">) {
  if (s.linkKind === "category") return `/boutique/${s.link}`;
  if (s.linkKind === "product") return `/produit/${s.link}`;
  if (s.linkKind === "none") return "";
  return s.link;
}

function useLinkLabel() {
  const categories = useAdminCatalog((s) => s.categories);
  const products = useAdminCatalog((s) => s.products);
  return (s: Slide) => {
    if (s.linkKind === "none") return "Aucun lien";
    if (s.linkKind === "category") return `Catégorie : ${categories.find((c) => c.slug === s.link)?.name ?? s.link}`;
    if (s.linkKind === "product") return `Produit : ${products.find((p) => p.slug === s.link)?.name ?? s.link}`;
    if (s.linkKind === "page") return `Page : ${PAGES.find((p) => p.value === s.link)?.label ?? s.link}`;
    return s.link;
  };
}

/* ---------------------------------------------------------------- dialogue */

function SlideDialog({ slot, open, onOpenChange, initial }: { slot: SlotId; open: boolean; onOpenChange: (o: boolean) => void; initial?: Slide }) {
  const { actor } = useAdmin();
  const save = useAdminHome((s) => s.saveSlide);
  const categories = useAdminCatalog((s) => s.categories);
  const products = useAdminCatalog((s) => s.products);
  const meta = SLOTS[slot];
  const input = useRef<HTMLInputElement>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [axis, setAxis] = useState<"x" | "y" | null>(null);
  const [focus, setFocus] = useState(50);
  const [alt, setAlt] = useState("");
  const [linkKind, setLinkKind] = useState<LinkKind>("category");
  const [link, setLink] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setOriginal(null);
    setAxis(null);
    setFocus(50);
    setAlt(initial?.alt ?? "");
    setLinkKind(initial?.linkKind ?? "category");
    setLink(initial?.link ?? "");
    setActive(initial?.active ?? true);
    setError("");
  }, [open, initial]);

  async function pick(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Choisissez une image (JPG, PNG ou WebP).");
    const data = await readFile(f);
    setOriginal(data);
    setAxis(await overflowAxis(data, meta.ratio));
    setFocus(50);
    setError("");
    if (input.current) input.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!original && !initial) return setError("Ajoutez une image.");
    if ((linkKind === "category" || linkKind === "product" || linkKind === "page") && !link) return setError("Choisissez la destination du lien.");
    if (linkKind === "url" && !/^https?:\/\/\S+\.\S+/.test(link.trim())) return setError("Saisissez une adresse complète, commençant par https://");
    setBusy(true);
    const image = original ? await cropToRatio(original, meta.ratio, meta.width, focus / 100) : initial!.image;
    save(slot, { id: initial?.id ?? newSlideId(), image, alt: alt.trim(), linkKind, link: linkKind === "url" ? link.trim() : link, active }, actor);
    setBusy(false);
    onOpenChange(false);
  }

  const preview = original ?? initial?.image;
  const pos = axis === "x" ? `${focus}% 50%` : `50% ${focus}%`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
        className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[680px] flex-col gap-0 overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white p-0 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0 sm:max-w-[680px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-akua-gray-200 px-5 py-5 sm:px-7">
          <div>
            <DialogTitle className="text-[20px] font-extrabold tracking-[-0.02em]">
              {initial ? "Modifier" : "Ajouter"} · {meta.label.toLowerCase()}
            </DialogTitle>
            <DialogDescription className="mt-1 text-[13.5px] text-akua-gray-500">
              Format {meta.ratioLabel} : l&apos;image est recadrée automatiquement à ce format, quelle que soit sa taille.
            </DialogDescription>
          </div>
          <button type="button" onClick={() => onOpenChange(false)} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-akua-page">
            <X aria-hidden className="size-[18px]" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            <div className={cn("grid gap-5", slot === "poster" ? "sm:grid-cols-[220px_minmax(0,1fr)]" : "")}>
              {/* image */}
              <div>
                {preview ? (
                  <div className="relative overflow-hidden rounded-[18px] border border-akua-gray-200 bg-akua-page" style={{ aspectRatio: String(meta.ratio) }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: original ? pos : "50% 50%" }} />
                    <button
                      type="button"
                      onClick={() => input.current?.click()}
                      className="absolute right-2.5 bottom-2.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-akua-white/95 px-3.5 text-[13px] font-semibold shadow-sm backdrop-blur hover:bg-akua-white"
                    >
                      <RefreshCw aria-hidden className="size-3.5" /> Remplacer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => input.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      pick(e.dataTransfer.files);
                    }}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-akua-gray-200 p-4 text-center transition-colors hover:border-akua-blue hover:bg-akua-blue-100/30"
                    style={{ aspectRatio: String(meta.ratio) }}
                  >
                    <ImagePlus aria-hidden className="size-7 text-akua-blue" strokeWidth={1.6} />
                    <span className="text-[14px] font-semibold">Choisir une image</span>
                    <span className="text-[12px] text-akua-gray-500">
                      Idéal : {meta.width} × {meta.height} px
                    </span>
                  </button>
                )}
                <input ref={input} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files)} />
                {original && axis && (
                  <div className="mt-3">
                    <label htmlFor="sl-focus" className="mb-1 block text-[12.5px] font-medium text-akua-gray-500">
                      Cadrage : {axis === "x" ? "gauche ↔ droite" : "haut ↕ bas"}
                    </label>
                    <input id="sl-focus" type="range" min={0} max={100} value={focus} onChange={(e) => setFocus(Number(e.target.value))} className="w-full accent-[var(--akua-blue)]" />
                  </div>
                )}
              </div>

              {/* lien et texte */}
              <div className="flex flex-col gap-4">
                <Field label="Lien au clic">
                  <Segmented
                    value={linkKind}
                    onChange={(v) => {
                      setLinkKind(v);
                      setLink("");
                    }}
                    options={[
                      { value: "category", label: "Catégorie" },
                      { value: "product", label: "Produit" },
                      { value: "page", label: "Page" },
                      { value: "url", label: "Adresse" },
                      { value: "none", label: "Aucun" },
                    ]}
                    className="[&_button]:h-9 [&_button]:px-3 [&_button]:text-[13px]"
                  />
                </Field>
                {linkKind === "category" && (
                  <SearchSelect
                    value={link}
                    onChange={setLink}
                    options={[...categories]
                      .sort((a, b) => a.order - b.order)
                      .map((c) => {
                        const Icon = getCategoryIcon(c.icon);
                        return { value: c.slug, label: c.name, icon: <Icon className="size-[18px] shrink-0 text-akua-gray-500" strokeWidth={1.7} /> };
                      })}
                    placeholder="Choisir une catégorie"
                    aria-label="Catégorie"
                  />
                )}
                {linkKind === "product" && (
                  <SearchSelect value={link} onChange={setLink} options={products.map((p) => ({ value: p.slug, label: p.name }))} placeholder="Choisir un produit" searchPlaceholder="Rechercher un produit…" aria-label="Produit" />
                )}
                {linkKind === "page" && <SearchSelect value={link} onChange={setLink} options={PAGES} placeholder="Choisir une page" aria-label="Page" />}
                {linkKind === "url" && <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" inputMode="url" aria-label="Adresse du lien" className={inputCls()} />}

                <Field id="sl-alt" label="Description de l'image" optional hint="Lue par Google et les lecteurs d'écran. Ex. « Nintendo Switch OLED à 250 000 F ».">
                  <input id="sl-alt" value={alt} onChange={(e) => setAlt(e.target.value)} className={inputCls()} />
                </Field>
                <Toggle checked={active} onChange={setActive} label="Affichée sur l'accueil" description="Désactivez-la pour la garder sans l'afficher." icon={active ? Eye : EyeOff} />
              </div>
            </div>
            {error && <p className="mt-4 rounded-2xl bg-akua-red/8 px-4 py-3 text-[13.5px] font-medium text-akua-red">{error}</p>}
          </div>

          <div className="flex flex-col-reverse gap-2.5 border-t border-akua-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button type="button" onClick={() => onOpenChange(false)} className={btn({ variant: "outline", size: "md" })}>
              Annuler
            </button>
            <button type="submit" disabled={busy} className={btn({ variant: "primary", size: "md" })}>
              <Check aria-hidden className="size-4" /> {busy ? "Préparation de l'image…" : initial ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------- emplacement */

function SlotPanel({ slot }: { slot: SlotId }) {
  const { actor } = useAdmin();
  const slides = useAdminHome((s) => s.slides[slot]);
  const move = useAdminHome((s) => s.moveSlide);
  const toggle = useAdminHome((s) => s.toggleSlide);
  const del = useAdminHome((s) => s.deleteSlide);
  const linkLabel = useLinkLabel();
  const meta = SLOTS[slot];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Slide | undefined>();
  const [toDelete, setToDelete] = useState<Slide | null>(null);
  const activeCount = slides.filter((s) => s.active).length;

  return (
    <section className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[16.5px] font-bold">
            {meta.label} <span className="rounded-full bg-akua-page px-2 py-0.5 text-[11.5px] font-semibold text-akua-gray-500">{meta.ratioLabel}</span>
          </h2>
          <p className="mt-0.5 text-[13px] text-akua-gray-500">{meta.hint}</p>
          {activeCount > 1 && <p className="mt-1 text-[12.5px] font-medium text-akua-blue">{activeCount} images actives : elles défilent toutes les 5 secondes.</p>}
          {activeCount === 0 && <p className="mt-1 text-[12.5px] font-medium text-akua-red">Aucune image active : cet emplacement sera masqué sur l&apos;accueil.</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
          className={btn({ variant: "outline", size: "sm" })}
        >
          <Plus aria-hidden className="size-4" /> Ajouter
        </button>
      </div>

      <ul className={cn("mt-5 grid gap-3", slot === "poster" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "sm:grid-cols-2")}>
        {slides.map((s, i) => (
          <li key={s.id} className={cn("group overflow-hidden rounded-[18px] border border-akua-gray-200 bg-akua-white", !s.active && "opacity-55")}>
            <div className="relative bg-akua-page" style={{ aspectRatio: String(meta.ratio) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.alt} className="absolute inset-0 size-full object-cover" />
              <span className="absolute top-2 left-2 rounded-full bg-akua-ink/80 px-2 py-0.5 text-[11px] font-semibold text-akua-white tabular-nums backdrop-blur">{i + 1}</span>
              {!s.active && <span className="absolute top-2 right-2 rounded-full bg-akua-white/95 px-2 py-0.5 text-[11px] font-semibold">Désactivée</span>}
            </div>
            <div className="p-3">
              <p className="flex items-center gap-1.5 truncate text-[12.5px] text-akua-gray-500">
                <Link2 aria-hidden className="size-3.5 shrink-0" /> <span className="truncate">{linkLabel(s)}</span>
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(slot, s.id, -1)} disabled={i === 0} aria-label="Avancer" className="grid size-8 place-items-center rounded-full border border-akua-gray-200 hover:border-akua-ink disabled:opacity-30">
                    <ArrowUp aria-hidden className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => move(slot, s.id, 1)} disabled={i === slides.length - 1} aria-label="Reculer" className="grid size-8 place-items-center rounded-full border border-akua-gray-200 hover:border-akua-ink disabled:opacity-30">
                    <ArrowDown aria-hidden className="size-3.5" />
                  </button>
                </div>
                <div className="flex gap-0.5">
                  <button type="button" onClick={() => toggle(slot, s.id, actor)} aria-label={s.active ? "Désactiver" : "Activer"} title={s.active ? "Désactiver" : "Activer"} className="grid size-8 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-page hover:text-akua-ink">
                    {s.active ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(s);
                      setOpen(true);
                    }}
                    aria-label="Modifier"
                    className="grid size-8 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-page hover:text-akua-ink"
                  >
                    <Pencil aria-hidden className="size-4" />
                  </button>
                  <button type="button" onClick={() => setToDelete(s)} aria-label="Supprimer" className="grid size-8 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-red/5 hover:text-akua-red">
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
            className="flex size-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-akua-gray-200 p-4 text-center transition-colors hover:border-akua-blue hover:bg-akua-blue-100/30"
            style={{ aspectRatio: slot === "poster" ? String(meta.ratio) : undefined }}
          >
            <ImagePlus aria-hidden className="size-6 text-akua-blue" strokeWidth={1.6} />
            <span className="text-[13.5px] font-semibold">Ajouter une image</span>
          </button>
        </li>
      </ul>

      <SlideDialog slot={slot} open={open} onOpenChange={setOpen} initial={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Supprimer cette image ?"
        description="Elle sera retirée de l'accueil. Pour la garder de côté, désactivez-la plutôt."
        onConfirm={() => {
          if (toDelete) del(slot, toDelete.id, actor);
          setToDelete(null);
        }}
      />
    </section>
  );
}

/* --------------------------------------------------------- aperçu de page */

function LayoutPreview() {
  const slides = useAdminHome((s) => s.slides);
  const categories = useAdminCatalog((s) => s.categories);
  const poster = slides.poster.find((s) => s.active);
  const banner = slides.banner.find((s) => s.active);
  const cats = [...categories].sort((a, b) => a.order - b.order).slice(0, 8);
  return (
    <div className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Haut de l&apos;accueil sur ordinateur</p>
        <Link href="/" target="_blank" className="inline-flex items-center gap-1 text-[13px] font-semibold text-akua-blue">
          Voir le site <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_26%] gap-2.5 rounded-[18px] bg-akua-page p-3">
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-8 rounded-[12px] bg-akua-white p-1.5">
            {cats.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <div key={c.id} className="flex flex-col items-center gap-0.5 py-1">
                  <Icon aria-hidden className="size-3.5 text-akua-ink" strokeWidth={1.5} />
                  <span className="max-w-full truncate px-0.5 text-[7px] font-semibold">{c.name}</span>
                </div>
              );
            })}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-[12px] bg-akua-white" style={{ minHeight: 60 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {banner ? <img src={banner.image} alt="" className="absolute inset-0 size-full object-cover" /> : <span className="absolute inset-0 grid place-items-center text-[11px] text-akua-gray-500">Aucune bannière active</span>}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[12px] bg-akua-white" style={{ aspectRatio: "4 / 5" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {poster ? <img src={poster.image} alt="" className="absolute inset-0 size-full object-cover" /> : <span className="absolute inset-0 grid place-items-center p-2 text-center text-[11px] text-akua-gray-500">Aucune affiche active</span>}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- sections */

function SectionRow({ s }: { s: HomeSection }) {
  const { actor, base } = useAdmin();
  const update = useAdminHome((st) => st.updateSection);
  const meta = HOME_SECTION_META[s.id];
  const [edit, setEdit] = useState(false);
  const [eyebrow, setEyebrow] = useState(s.eyebrow ?? "");
  const [title, setTitle] = useState(s.title ?? "");
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-semibold">{meta.label}</p>
          <p className="mt-0.5 text-[12.5px] text-akua-gray-500">{s.title ? `« ${s.title} » · ` : ""}{meta.description}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {meta.editable && (
              <button type="button" onClick={() => setEdit((e) => !e)} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-akua-blue">
                <Pencil aria-hidden className="size-3.5" /> {edit ? "Fermer" : "Modifier les textes"}
              </button>
            )}
            {s.id === "deals" && (
              <Link href={`${base}/offre-speciale`} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-akua-blue">
                Gérer l&apos;offre spéciale <ArrowUpRight aria-hidden className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[12.5px] font-medium text-akua-gray-500">
          {s.visible ? "Affichée" : "Masquée"}
          <input type="checkbox" role="switch" checked={s.visible} onChange={(e) => update(s.id, { visible: e.target.checked }, actor)} className="peer sr-only" />
          <span aria-hidden className={cn("relative h-7 w-12 rounded-full transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-akua-blue/25", s.visible ? "bg-akua-blue" : "bg-akua-gray-200")}>
            <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-akua-white shadow transition-transform", s.visible && "translate-x-5")} />
          </span>
        </label>
      </div>
      {edit && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update(s.id, { eyebrow: eyebrow.trim(), title: title.trim() }, actor);
            setEdit(false);
          }}
          className="mt-3 grid gap-3 rounded-[18px] bg-akua-page p-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end"
        >
          <Field label="Sur-titre">
            <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} className={inputCls()} />
          </Field>
          <Field label="Titre">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls()} />
          </Field>
          <button type="submit" className={btn({ variant: "dark", size: "md", className: "h-12" })}>
            Enregistrer
          </button>
        </form>
      )}
    </li>
  );
}

export function HomeEditor() {
  const hydrated = useHydrated();
  const sections = useAdminHome((s) => s.sections);
  const ordered = useMemo(() => sections, [sections]);
  if (!hydrated) return <div className="h-[60vh] animate-pulse rounded-[24px] bg-akua-white" />;
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title="Accueil et bannières" description="L'affiche, la bannière et les sections de la page d'accueil. Chaque image est recadrée automatiquement au bon format." />
      <DemoNotice>Vos réglages sont gardés dans ce navigateur pour tester le design. Ils s&apos;appliqueront au site dès que la base de données sera branchée.</DemoNotice>
      <LayoutPreview />
      <SlotPanel slot="poster" />
      <SlotPanel slot="banner" />
      <section className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
        <h2 className="text-[16.5px] font-bold">Sections de l&apos;accueil</h2>
        <p className="mt-0.5 text-[13px] text-akua-gray-500">Affichez ou masquez chaque section, et modifiez leurs titres.</p>
        <ul className="mt-5 divide-y divide-akua-gray-200">
          {ordered.map((s) => (
            <SectionRow key={s.id} s={s} />
          ))}
        </ul>
      </section>
    </div>
  );
}

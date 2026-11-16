"use client";

import { categoryImages } from "@/data/category-media";
import { ArrowUpRight, Check, Film, Image as ImageIcon, Link2, Pencil, RefreshCw, RotateCcw, Upload } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { HomeMedia } from "@/components/ui/home-media";
import { SearchSelect } from "@/components/ui/search-select";
import { cropToRatio, overflowAxis, readFile } from "@/lib/admin/image";
import { uploadVideo } from "@/lib/admin/upload-video";
import { isVideoLink, type MediaKind } from "@/lib/home-media";
import { btn } from "@/lib/btn";
import { getCategoryIcon } from "@/lib/icons";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { HERO_FORMAT, HERO_SLOTS, HOME_SECTION_META, type HomeSection, type LinkKind, newSlideId, ORIGINAL_SLIDES, type Slide, SLOTS, type SlotId, useAdminHome } from "@/store/admin-home";
import { useAdmin, useCan } from "../actor-context";
import { ReadOnlyNotice } from "../read-only";
import { Field, inputCls, Segmented } from "../form";
import { PageHeader } from "../ui";

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

/* ------------------------------------------------------------- emplacement */

type Source = "upload" | "link";

/**
 * Ajout ou remplacement d'un visuel (image ou vidéo) de l'accueil : une des 3 bannières.
 * Un emplacement vide n'affiche rien ; l'image importée est recadrée au format de l'emplacement.
 */
function SlotEditor({ slot }: { slot: SlotId }) {
  const { actor, base } = useAdmin();
  const canReplace = useCan()("home", "replace");
  const current = useAdminHome((s) => s.slides[slot]?.[0]);
  const setSlot = useAdminHome((s) => s.setSlot);
  const categories = useAdminCatalog((s) => s.categories);
  const products = useAdminCatalog((s) => s.products);
  const linkLabel = useLinkLabel();
  const meta = SLOTS[slot];
  // les bannières n'ont pas de visuel de départ : l'emplacement est simplement vide
  const original = ORIGINAL_SLIDES[slot][0] as Slide | undefined;
  const empty = !current && !original;
  const isOriginal = original ? current?.image === original.image && (current?.media ?? "image") === "image" : !current;
  const input = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [media, setMedia] = useState<MediaKind>("image");
  const [source, setSource] = useState<Source>("upload");
  const [file, setFile] = useState<{ kind: MediaKind; preview: string; data?: string; file?: File } | null>(null);
  const [axis, setAxis] = useState<"x" | "y" | null>(null);
  const [focus, setFocus] = useState(50);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [linkKind, setLinkKind] = useState<LinkKind>("none");
  const [link, setLink] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function start() {
    setEditing(true);
    setMedia(current?.media ?? "image");
    setSource("upload");
    setFile(null);
    setUrl("");
    setAxis(null);
    setFocus(50);
    setAlt(current?.alt ?? "");
    setLinkKind(current?.linkKind ?? "none");
    setLink(current?.link ?? "");
    setProgress(null);
    setError("");
  }

  async function pick(files: FileList | null) {
    const f = files?.[0];
    if (input.current) input.current.value = "";
    if (!f) return;
    setError("");
    if (media === "image") {
      if (!f.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic|heif|gif)$/i.test(f.name)) return setError("Choisissez une image (JPG, PNG ou WebP).");
      const data = await readFile(f);
      setFile({ kind: "image", preview: data, data });
      setAxis(await overflowAxis(data, meta.ratio));
      setFocus(50);
    } else {
      if (!f.type.startsWith("video/") && !/\.(mp4|mov|m4v|webm)$/i.test(f.name)) return setError("Choisissez une vidéo (MP4 ou MOV).");
      if (f.size > 60 * 1024 * 1024) return setError("Vidéo trop lourde : 60 Mo maximum. Raccourcissez-la ou compressez-la.");
      setFile({ kind: "video", preview: URL.createObjectURL(f), file: f });
    }
  }

  const linkOk = media === "image" ? /^https?:\/\/\S+\.\S+/.test(url.trim()) : isVideoLink(url.trim()) && /^https?:\/\//.test(url.trim());
  const preview = source === "upload" ? file?.preview : linkOk ? url.trim() : undefined;

  async function save() {
    setError("");
    if ((linkKind === "category" || linkKind === "product" || linkKind === "page") && !link) return setError("Choisissez la destination du lien au clic.");
    if (linkKind === "url" && !/^https?:\/\/\S+\.\S+/.test(link.trim())) return setError("Lien au clic : saisissez une adresse complète, commençant par https://");
    let src = current?.image ?? original?.image ?? "";
    const changingMedia = source === "upload" ? !!file : !!url.trim();
    if (source === "link" && url.trim() && !linkOk)
      return setError(media === "image" ? "Saisissez l'adresse complète d'une image, commençant par https://" : "Saisissez un lien YouTube ou l'adresse directe d'un fichier vidéo (.mp4, .webm).");
    if (!changingMedia && (current?.media ?? "image") !== media) return setError(media === "video" ? "Importez une vidéo ou collez son lien." : "Importez une image ou collez son lien.");
    try {
      if (source === "upload" && file?.kind === "image" && file.data) src = await cropToRatio(file.data, meta.ratio, meta.width, focus / 100);
      else if (source === "upload" && file?.kind === "video" && file.file) {
        setProgress(0);
        src = await uploadVideo(base, file.file, setProgress);
      } else if (source === "link" && url.trim()) src = url.trim();
    } catch (e) {
      setProgress(null);
      return setError((e as Error).message || "Envoi impossible. Vérifiez votre connexion et réessayez.");
    }
    if (!src) return setError(media === "video" ? "Importez une vidéo ou collez son lien." : "Importez une image ou collez son lien.");
    setSlot(slot, { id: current?.id ?? newSlideId(), media, image: src, alt: alt.trim(), linkKind, link: linkKind === "url" ? link.trim() : link, active: true }, actor);
    setProgress(null);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  const shown = editing && preview ? { src: preview, media: source === "upload" ? (file?.kind ?? media) : media } : { src: current?.image ?? original?.image ?? "", media: current?.media ?? "image" };
  const pos = axis === "x" ? `${focus}% 50%` : `50% ${focus}%`;
  const MediaIcon = shown.media === "video" ? Film : ImageIcon;

  return (
    <section className="rounded-[12px] border border-akua-gray-200/90 bg-akua-white p-5 shadow-[0_1px_2px_rgb(11_16_32/0.03),0_14px_34px_-28px_rgb(11_16_32/0.22)] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-[17px] font-bold">
            {meta.label} <span className="rounded-full bg-akua-page px-2 py-0.5 text-[11.5px] font-semibold text-akua-gray-500">{meta.ratioLabel}</span>
          </h2>
          <p className="mt-0.5 text-[13px] text-akua-gray-500">{meta.hint}</p>
        </div>
        <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold", saved ? "bg-akua-whatsapp/12 text-[#128c4a]" : "bg-akua-page text-akua-gray-500")}>
          {saved ? <Check aria-hidden className="size-3.5" strokeWidth={2.6} /> : <MediaIcon aria-hidden className="size-3.5" strokeWidth={2} />}
          {saved ? "Enregistré" : empty ? "Emplacement vide" : original ? `${shown.media === "video" ? "Vidéo" : "Image"}${isOriginal ? " d'origine" : ""}` : "En ligne sur l'accueil"}
        </span>
      </div>

      <div className={cn("mt-5 grid gap-5", slot === "poster" ? "md:grid-cols-[260px_minmax(0,1fr)]" : "")}>
        {/* aperçu */}
        <div>
          <div className="relative overflow-hidden rounded-[12px] border border-akua-gray-200 bg-akua-page" style={{ aspectRatio: String(meta.ratio) }}>
            {editing && source === "upload" && file?.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={file.preview} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: pos }} />
            ) : shown.src ? (
              <HomeMedia key={shown.src} src={shown.src} alt="" media={shown.media} fit={slot === "poster" && shown.media === "image" ? "contain" : "cover"} sizes="600px" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-center text-akua-gray-500">
                <span>
                  <ImageIcon aria-hidden className="mx-auto size-7" strokeWidth={1.5} />
                  <span className="mt-1.5 block text-[13px] font-semibold text-akua-ink">Aucun visuel</span>
                  <span className="block text-[12px] tabular-nums">
                    {meta.width} × {meta.height} px · {meta.ratioLabel}
                  </span>
                </span>
              </div>
            )}
            {progress !== null && (
              <div className="absolute inset-0 grid place-items-center bg-akua-ink/55 backdrop-blur-[2px]">
                <div className="w-3/4 text-center text-akua-white">
                  <p className="text-[13.5px] font-semibold">Envoi de la vidéo… {Math.round(progress * 100)} %</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-akua-white/25">
                    <div className="h-full rounded-full bg-akua-white transition-[width]" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          {editing && source === "upload" && file?.kind === "image" && axis && (
            <div className="mt-3">
              <label htmlFor={`fo-${slot}`} className="mb-1 block text-[12.5px] font-medium text-akua-gray-500">
                Cadrage : {axis === "x" ? "gauche ↔ droite" : "haut ↕ bas"}
              </label>
              <input id={`fo-${slot}`} type="range" min={0} max={100} value={focus} onChange={(e) => setFocus(Number(e.target.value))} className="w-full accent-[var(--akua-blue)]" />
            </div>
          )}
          {!editing && (
            <p className="mt-2.5 flex items-center gap-1.5 truncate text-[12.5px] text-akua-gray-500">
              <Link2 aria-hidden className="size-3.5 shrink-0" /> <span className="truncate">Au clic : {current ? linkLabel(current) : "—"}</span>
            </p>
          )}
        </div>

        {/* actions */}
        {!editing ? (
          <div className="flex flex-col justify-center gap-3">
            <p className="text-[14px] text-akua-gray-500">
              {canReplace ? "Remplacez ce visuel par une image ou une vidéo, importée depuis votre appareil ou par un lien. Il s'affiche aussitôt sur l'accueil." : "Le remplacement de ce visuel est réservé au responsable."}
            </p>
            <div className={cn("flex flex-wrap gap-2", !canReplace && "hidden")}>
              <button type="button" onClick={start} className={btn({ variant: "primary", size: "md" })}>
                {empty ? <Upload aria-hidden className="size-4" /> : <RefreshCw aria-hidden className="size-4" />} {empty ? "Ajouter un visuel" : "Remplacer"}
              </button>
              {!isOriginal && (
                <button type="button" onClick={() => setConfirmReset(true)} className={btn({ variant: "outline", size: "md" })}>
                  <RotateCcw aria-hidden className="size-4" /> {original ? "Visuel d'origine" : "Retirer"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-4">
            <Field label="Remplacer par">
              <Segmented
                value={media}
                onChange={(v) => {
                  setMedia(v);
                  setFile(null);
                  setUrl("");
                  setError("");
                }}
                options={[
                  { value: "image", label: "Une image", icon: ImageIcon },
                  { value: "video", label: "Une vidéo", icon: Film },
                ]}
              />
            </Field>
            <Field label="Source">
              <Segmented
                value={source}
                onChange={(v) => {
                  setSource(v);
                  setError("");
                }}
                options={[
                  { value: "upload", label: "Importer", icon: Upload },
                  { value: "link", label: "Lien externe", icon: Link2 },
                ]}
              />
            </Field>

            {source === "upload" ? (
              <div>
                {/* étiquette liée au champ fichier : ouvre la galerie (téléphone) ou les fichiers (ordinateur) */}
                <label
                  htmlFor={`file-${slot}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      input.current?.click();
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    void pick(e.dataTransfer.files);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3.5 rounded-[18px] border-2 border-dashed border-akua-gray-200 px-4 py-4 text-left transition-colors outline-none hover:border-akua-blue hover:bg-akua-blue-100/30 focus-visible:border-akua-blue focus-visible:ring-4 focus-visible:ring-akua-blue/15 active:bg-akua-blue-100/50"
                >
                  <Upload aria-hidden className="size-6 shrink-0 text-akua-blue" strokeWidth={1.6} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold">
                      {file ? (file.file?.name ?? "Image choisie · touchez pour en prendre une autre") : media === "image" ? "Choisir une image" : "Choisir une vidéo"}
                    </span>
                    <span className="block text-[12.5px] text-akua-gray-500 md:hidden">{media === "image" ? "Depuis votre galerie ou l'appareil photo" : "Depuis votre galerie ou l'appareil photo"}</span>
                    <span className="hidden text-[12.5px] text-akua-gray-500 md:block">Depuis vos fichiers, ou glissez-déposez ici</span>
                    <span className="block text-[12px] text-akua-gray-500/80">
                      {media === "image" ? `JPG, PNG, WebP ou HEIC · recadrée automatiquement en ${meta.ratioLabel}` : "MP4 ou MOV · 60 Mo maximum · lue en boucle, sans le son"}
                    </span>
                  </span>
                </label>
                <input id={`file-${slot}`} ref={input} type="file" accept={media === "image" ? "image/*" : "video/*"} className="sr-only" tabIndex={-1} onChange={(e) => void pick(e.target.files)} />
              </div>
            ) : (
              <Field id={`url-${slot}`} label={media === "image" ? "Adresse de l'image" : "Lien de la vidéo"} hint={media === "image" ? "Adresse complète d'une image en ligne (https://…)." : "Lien YouTube, ou adresse directe d'un fichier vidéo (.mp4, .webm)."}>
                <input id={`url-${slot}`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder={media === "image" ? "https://…/image.jpg" : "https://youtube.com/watch?v=…"} inputMode="url" className={inputCls(url && !linkOk ? "x" : undefined)} />
              </Field>
            )}

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
            {linkKind === "product" && <SearchSelect value={link} onChange={setLink} options={products.map((p) => ({ value: p.slug, label: p.name }))} placeholder="Choisir un produit" searchPlaceholder="Rechercher un produit…" aria-label="Produit" />}
            {linkKind === "page" && <SearchSelect value={link} onChange={setLink} options={PAGES} placeholder="Choisir une page" aria-label="Page" />}
            {linkKind === "url" && <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" inputMode="url" aria-label="Adresse du lien" className={inputCls()} />}

            <Field id={`alt-${slot}`} label="Description" optional hint="Lue par Google et les lecteurs d'écran.">
              <input id={`alt-${slot}`} value={alt} onChange={(e) => setAlt(e.target.value)} className={inputCls()} />
            </Field>

            {error && <p className="rounded-[10px] bg-akua-red/8 px-4 py-3 text-[13.5px] font-medium text-akua-red">{error}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" onClick={() => void save()} disabled={progress !== null} className={btn({ variant: "primary", size: "md" })}>
                <Check aria-hidden className="size-4" /> {progress !== null ? "Envoi en cours…" : "Enregistrer"}
              </button>
              <button type="button" onClick={() => setEditing(false)} disabled={progress !== null} className={btn({ variant: "outline", size: "md" })}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={original ? "Remettre le visuel d'origine ?" : `Retirer ${meta.label} ?`}
        description={original ? `${meta.label} reprendra son visuel de départ sur l'accueil.` : "Ce visuel ne sera plus affiché sur l'accueil. S'il ne reste aucune bannière, le site reprend ses bannières automatiques."}
        confirmLabel={original ? "Remettre" : "Retirer"}
        onConfirm={() => {
          setSlot(slot, null, actor);
          setConfirmReset(false);
        }}
      />
    </section>
  );
}


/* --------------------------------------------------------- aperçu de page */

function LayoutPreview() {
  const categories = useAdminCatalog((s) => s.categories);
  // les promos ne sont pas une tuile sur l'accueil
  const cats = [...categories].filter((c) => c.slug !== "promos").sort((a, b) => a.order - b.order).slice(0, 8);
  const custom = useAdminHome((s) => HERO_SLOTS.filter((k) => s.slides[k]?.[0]?.active && s.slides[k]?.[0]?.image).length);
  return (
    <div className="rounded-[12px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Haut de l&apos;accueil sur ordinateur</p>
        <Link href="/" target="_blank" className="inline-flex items-center gap-1 text-[13px] font-semibold text-akua-blue">
          Voir le site <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
      </div>
      <div className="mt-4 rounded-[18px] bg-akua-page p-3">
        {/* même disposition que le site : catégories en tête, puis bannière et affiche */}
        <div className="grid gap-2 rounded-[12px] bg-akua-white p-2" style={{ gridTemplateColumns: `repeat(${Math.max(cats.length, 1)}, minmax(0, 1fr))` }}>
          {cats.map((c) => {
            const img = c.image ?? categoryImages[c.id];
            return (
              <div key={c.id} className="flex min-w-0 flex-col items-center gap-1">
                <span className="relative block aspect-square w-full overflow-hidden rounded-[8px] bg-akua-tile">
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="absolute inset-0 size-full object-contain p-1" />
                  )}
                </span>
                <span className="w-full truncate text-center text-[7.5px] font-extrabold tracking-[0.02em] uppercase">{c.name}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 flex aspect-[16/5] items-center justify-between gap-3 overflow-hidden rounded-[10px] bg-akua-blue-100 px-4 text-akua-ink">
          <span>
            <span className="block text-[8px] font-bold tracking-[0.14em] text-akua-blue uppercase">Bannières de l&apos;accueil</span>
            <span className="block text-[13px] font-extrabold">{custom ? `${custom} visuel${custom > 1 ? "s" : ""} ajouté${custom > 1 ? "s" : ""}` : "Bannières automatiques du site"}</span>
          </span>
          <span className="text-[9px] font-semibold text-akua-gray-500">Défilement toutes les 5 s</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- sections */

function SectionRow({ s }: { s: HomeSection }) {
  const { actor, base } = useAdmin();
  const canEdit = useCan()("home", "sections");
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
            {meta.editable && canEdit && (
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
        <label className={cn("flex shrink-0 items-center gap-2 text-[12.5px] font-medium text-akua-gray-500", canEdit ? "cursor-pointer" : "pointer-events-none opacity-60")}>
          {s.visible ? "Affichée" : "Masquée"}
          <input type="checkbox" role="switch" disabled={!canEdit} checked={s.visible} onChange={(e) => update(s.id, { visible: e.target.checked }, actor)} className="peer sr-only" />
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
  // la FAQ et le bloc « Écrivez-nous » sont sur la page Contact : plus gérés ici
  const ordered = useMemo(() => sections.filter((s) => s.id !== "faq"), [sections]);
  if (!hydrated) return <div className="h-[60vh] animate-pulse rounded-[12px] bg-akua-white" />;
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title="Accueil et bannières" description="Aperçu du haut de l'accueil, bannières (jusqu'à 3) et sections de la page." />
      <ReadOnlyNotice module="home" />
      <LayoutPreview />
      <section className="rounded-[12px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
        <h2 className="text-[16.5px] font-bold">Bannières de l&apos;accueil</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-akua-gray-500">
          Ajoutez jusqu&apos;à 3 bannières : elles défilent toutes les 5 secondes, en glissant de droite à gauche. Tant qu&apos;aucun visuel n&apos;est ajouté, le site affiche ses 3 bannières automatiques (promotion, saison,
          confiance). Dès qu&apos;un visuel est ajouté, les bannières automatiques disparaissent et seuls vos visuels s&apos;affichent.
        </p>
        <dl className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {[
            { t: "Format à créer", d: `${HERO_FORMAT.width} × ${HERO_FORMAT.height} px` },
            { t: "Proportion", d: `${HERO_FORMAT.ratioLabel} (paysage)` },
            { t: "Fichier", d: "JPG, PNG ou WebP" },
          ].map((x) => (
            <div key={x.t} className="rounded-[12px] border border-akua-gray-200 px-4 py-3">
              <dt className="text-[11px] font-bold tracking-[0.1em] text-akua-gray-500 uppercase">{x.t}</dt>
              <dd className="mt-0.5 text-[15px] font-bold tabular-nums">{x.d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[12.5px] leading-snug text-akua-gray-500">
          Conseil pour la création : gardez le texte et les éléments importants au centre de l&apos;affiche. Sur téléphone, la bannière garde exactement la même forme, en plus petit : évitez donc les petits textes.
        </p>
      </section>
      {HERO_SLOTS.map((slot) => (
        <SlotEditor key={slot} slot={slot} />
      ))}
      <section className="rounded-[12px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
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

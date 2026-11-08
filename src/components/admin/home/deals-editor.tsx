"use client";

import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpRight, Check, Clock3, Moon, Play, Plus, RotateCcw, Search, Timer, Trash2, Video, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { parsePromoVideo } from "@/config/promo-video";
import { btn } from "@/lib/btn";
import { discountPercent, formatFCFA } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { dealEnd, type DealsConfig, MAX_DEAL_PRODUCTS, useAdminHome } from "@/store/admin-home";
import type { Product } from "@/types/catalog";
import { useAdmin } from "../actor-context";
import { Field, inputCls, Segmented, Toggle } from "../form";
import { DemoNotice, PageHeader } from "../ui";

const DURATIONS = [
  { h: 24, label: "24 h" },
  { h: 48, label: "48 h" },
  { h: 72, label: "72 h" },
  { h: 168, label: "7 jours" },
];
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const pad = (n: number) => String(n).padStart(2, "0");
const fmtEnd = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/** sous-titre proposé selon la durée */
function suggestedHighlight(d: Pick<DealsConfig, "mode" | "hours">) {
  if (d.mode === "midnight") return "jusqu'à minuit";
  if (d.hours % 24 === 0) return d.hours === 168 ? "pendant 7 jours" : `pendant ${d.hours} h`;
  return `pendant ${d.hours} h`;
}

function Countdown({ d }: { d: DealsConfig }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const end = dealEnd(d, now);
  if (!end) return <p className="text-[34px] leading-none font-extrabold tracking-[-0.04em] text-akua-gray-500 tabular-nums">Terminée</p>;
  const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  const days = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  return (
    <div>
      <p className="text-[40px] leading-none font-extrabold tracking-[-0.04em] tabular-nums md:text-[48px]">
        {days > 0 && <span>{days}j </span>}
        {pad(h)}
        <span className="text-akua-blue">:</span>
        {pad(Math.floor((s % 3600) / 60))}
        <span className="text-akua-blue">:</span>
        {pad(s % 60)}
      </p>
      <p className="mt-2 text-[13px] text-akua-gray-500 first-letter:uppercase">Fin : {fmtEnd.format(end)}</p>
    </div>
  );
}

/* --------------------------------------------------- choix des produits */

function ProductPicker({ open, onOpenChange, selected, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; selected: string[]; onAdd: (ids: string[]) => void }) {
  const products = useAdminCatalog((s) => s.products);
  const [q, setQ] = useState("");
  const [promoOnly, setPromoOnly] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => {
    if (open) {
      setQ("");
      setPicked([]);
    }
  }, [open]);
  const room = MAX_DEAL_PRODUCTS - selected.length;
  const list = useMemo(() => {
    const n = norm(q.trim());
    return products.filter((p) => !selected.includes(p.id) && p.published !== false && (!promoOnly || p.compareAtPrice) && (!n || norm(p.name).includes(n)));
  }, [products, selected, promoOnly, q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
        className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[560px] flex-col gap-0 overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white p-0 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0 sm:max-w-[560px]"
      >
        <div className="border-b border-akua-gray-200 px-5 pt-5 pb-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-[19px] font-extrabold tracking-[-0.02em]">Ajouter des produits</DialogTitle>
              <DialogDescription className="mt-0.5 text-[13px] text-akua-gray-500">
                {room > 0 ? `Encore ${room} place${room > 1 ? "s" : ""} dans l'offre spéciale.` : "L'offre spéciale est complète."}
              </DialogDescription>
            </div>
            <button type="button" onClick={() => onOpenChange(false)} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-akua-page">
              <X aria-hidden className="size-[18px]" />
            </button>
          </div>
          <div className="relative mt-4">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-akua-gray-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit…" autoFocus className="h-11 w-full rounded-xl bg-akua-page pr-3 pl-10 text-[16px] outline-none focus:ring-2 focus:ring-akua-blue/25 sm:text-[14.5px]" />
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13px] font-medium select-none">
            <input type="checkbox" checked={promoOnly} onChange={(e) => setPromoOnly(e.target.checked)} className="size-4 accent-[var(--akua-blue)]" />
            Uniquement les produits avec un prix promotionnel
          </label>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {list.length === 0 && <li className="py-10 text-center text-[13.5px] text-akua-gray-500">Aucun produit ne correspond.</li>}
          {list.map((p) => {
            const on = picked.includes(p.id);
            const full = !on && picked.length >= room;
            const pct = discountPercent(p.price, p.compareAtPrice) ?? 0;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={full}
                  onClick={() => setPicked((x) => (on ? x.filter((i) => i !== p.id) : [...x, p.id]))}
                  className={cn("flex w-full items-center gap-3 rounded-[16px] p-2.5 text-left transition-colors disabled:opacity-40", on ? "bg-akua-blue-100/60" : "hover:bg-akua-page")}
                >
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border", on ? "border-akua-blue bg-akua-blue text-akua-white" : "border-akua-gray-200")}>{on && <Check aria-hidden className="size-3.5" strokeWidth={3} />}</span>
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-akua-tile">
                    {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-contain p-1" unoptimized={p.images[0].startsWith("data:")} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                    <span className="text-[12.5px] text-akua-gray-500 tabular-nums">
                      {formatFCFA(p.price)}
                      {pct > 0 && <span className="ml-1.5 font-semibold text-akua-red">-{pct} %</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-akua-gray-200 px-5 py-4 sm:px-6">
          <span className="text-[13px] text-akua-gray-500">{picked.length} sélectionné{picked.length > 1 ? "s" : ""}</span>
          <button
            type="button"
            disabled={!picked.length}
            onClick={() => {
              onAdd(picked);
              onOpenChange(false);
            }}
            className={btn({ variant: "primary", size: "md" })}
          >
            <Plus aria-hidden className="size-4" /> Ajouter
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------- vidéos */

function VideoCard({ title, value, onChange }: { title: string; value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  function add() {
    const v = draft.trim();
    if (!v) return;
    if (!parsePromoVideo(v)) return setError("Lien non reconnu. Collez un lien de vidéo TikTok (Partager › Copier le lien) ou une adresse .mp4.");
    onChange([...value, v]);
    setDraft("");
    setError("");
  }
  const label = (v: string) => {
    const s = parsePromoVideo(v);
    return s?.kind === "tiktok" ? `TikTok · ${s.id.slice(-6)}` : `Fichier vidéo · ${v.split("/").pop()}`;
  };
  return (
    <div className="flex flex-col rounded-[20px] border border-akua-gray-200 p-4">
      <p className="flex items-center gap-2 text-[14.5px] font-bold">
        <Video aria-hidden className="size-4 text-akua-gray-500" /> {title}
      </p>
      <p className="mt-0.5 text-[12.5px] text-akua-gray-500">{value.length > 1 ? "Les vidéos s'enchaînent dans l'ordre." : "Une vidéo : elle se relit en boucle."}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {value.map((v, i) => {
          const src = parsePromoVideo(v);
          return (
            <li key={v + i} className="flex items-center gap-2 rounded-[14px] bg-akua-page p-2 pl-3">
              <span className="w-4 shrink-0 text-[12px] font-bold text-akua-gray-500 tabular-nums">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{label(v)}</span>
              {src?.kind === "tiktok" && (
                <button type="button" onClick={() => setPreview(src.id)} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-akua-white px-2.5 text-[12px] font-semibold hover:text-akua-blue">
                  <Play aria-hidden className="size-3 fill-current" /> Voir
                </button>
              )}
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Retirer la vidéo" className="grid size-8 shrink-0 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-white hover:text-akua-red">
                <Trash2 aria-hidden className="size-4" />
              </button>
            </li>
          );
        })}
        {value.length === 0 && <li className="rounded-[14px] border border-dashed border-akua-gray-200 px-3 py-4 text-center text-[12.5px] text-akua-gray-500">Aucune vidéo : la carte ne s&apos;affichera pas.</li>}
      </ul>
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => (setDraft(e.target.value), setError(""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="https://www.tiktok.com/@…/video/…"
          inputMode="url"
          aria-label={`Ajouter une vidéo à la ${title.toLowerCase()}`}
          className={cn(inputCls(error), "h-11 text-[14px]")}
        />
        <button type="button" onClick={add} disabled={!draft.trim()} aria-label="Ajouter la vidéo" className="grid size-11 shrink-0 place-items-center rounded-2xl bg-akua-ink text-akua-white disabled:opacity-30">
          <Plus aria-hidden className="size-5" />
        </button>
      </div>
      {error && <p className="mt-2 text-[12.5px] font-medium text-akua-red">{error}</p>}

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent showCloseButton={false} overlayClassName="bg-akua-ink/60 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]" className="w-[min(340px,calc(100%-32px))] max-w-none gap-0 overflow-hidden rounded-[24px] border-0 bg-akua-ink p-0 ring-0 sm:max-w-none">
          <DialogTitle className="sr-only">Aperçu de la vidéo</DialogTitle>
          {preview && <iframe src={`https://www.tiktok.com/player/v1/${preview}?autoplay=1&controls=1&description=0&music_info=0&rel=0`} title="Aperçu TikTok" allow="autoplay; encrypted-media; fullscreen" className="aspect-[9/16] w-full border-0" />}
          <button type="button" onClick={() => setPreview(null)} className="h-12 w-full text-[14px] font-semibold text-akua-white/80 hover:text-akua-white">
            Fermer
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------------------------------------------- page */

export function DealsEditor() {
  const hydrated = useHydrated();
  const { actor, base } = useAdmin();
  const saved = useAdminHome((s) => s.deals);
  const update = useAdminHome((s) => s.updateDeals);
  const products = useAdminCatalog((s) => s.products);
  const [d, setD] = useState<DealsConfig>(saved);
  const [picker, setPicker] = useState(false);
  const [toast, setToast] = useState("");
  const [customHours, setCustomHours] = useState(false);

  useEffect(() => {
    if (hydrated) {
      setD(saved);
      setCustomHours(saved.mode === "duration" && !DURATIONS.some((x) => x.h === saved.hours));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const dirty = JSON.stringify(d) !== JSON.stringify(saved);
  const set = <K extends keyof DealsConfig>(k: K, v: DealsConfig[K]) => setD((x) => ({ ...x, [k]: v }));
  // le sous-titre suit la durée tant qu'il n'a pas été personnalisé
  const setTiming = (patch: Partial<DealsConfig>) =>
    setD((x) => {
      const next = { ...x, ...patch };
      if (x.highlight === suggestedHighlight(x)) next.highlight = suggestedHighlight(next);
      return next;
    });

  const selected = d.productIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);
  const end = dealEnd(d);
  const status = !d.enabled ? { label: "Masquée", tone: "bg-akua-page text-akua-gray-500" } : !selected.length ? { label: "Aucun produit", tone: "bg-akua-red/10 text-akua-red" } : !end ? { label: "Terminée", tone: "bg-akua-page text-akua-gray-500" } : { label: "En cours", tone: "bg-akua-whatsapp/12 text-[#128c4a]" };

  function save() {
    const parts: string[] = [];
    if (d.productIds.join() !== saved.productIds.join()) parts.push(`${d.productIds.length} produit${d.productIds.length > 1 ? "s" : ""}`);
    if (d.mode !== saved.mode || d.hours !== saved.hours) parts.push(d.mode === "midnight" ? "jusqu'à minuit" : `durée ${d.hours} h`);
    if (d.videos.flat().join() !== saved.videos.flat().join()) parts.push("vidéos modifiées");
    if (d.enabled !== saved.enabled) parts.push(d.enabled ? "affichée" : "masquée");
    update(d, actor, parts.join(" · ") || undefined);
    setToast("Offre spéciale enregistrée.");
    window.setTimeout(() => setToast(""), 3000);
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= d.productIds.length) return;
    const ids = [...d.productIds];
    [ids[i], ids[j]] = [ids[j], ids[i]];
    set("productIds", ids);
  };

  if (!hydrated) return <div className="h-[60vh] animate-pulse rounded-[24px] bg-akua-white" />;

  return (
    <div className="flex flex-col gap-5 pb-24 md:gap-6">
      <PageHeader
        title="Offre spéciale"
        description="Les produits en promotion avec compte à rebours et vidéos TikTok, sur la page d'accueil."
        actions={
          <Link href="/#promo" target="_blank" className={btn({ variant: "outline", size: "md" })}>
            Voir sur le site <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        }
      />
      <DemoNotice>Vos réglages sont gardés dans ce navigateur pour tester le design. Ils s&apos;appliqueront au site dès que la base de données sera branchée.</DemoNotice>

      {/* état */}
      <section className="grid gap-4 rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:p-6">
        <div>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold", status.tone)}>
            <span className="size-1.5 rounded-full bg-current" /> {status.label}
          </span>
          <div className="mt-3">{d.enabled && selected.length ? <Countdown d={d} /> : <p className="text-[15px] text-akua-gray-500">{!d.enabled ? "La section est masquée sur l'accueil." : "Ajoutez au moins un produit pour afficher la section."}</p>}</div>
        </div>
        <Toggle checked={d.enabled} onChange={(v) => set("enabled", v)} label="Afficher sur l'accueil" description="Sans produit, la section reste masquée automatiquement." icon={Timer} />
      </section>

      {/* durée */}
      <section className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
        <h2 className="text-[16.5px] font-bold">Durée de l&apos;offre</h2>
        <p className="mt-0.5 text-[13px] text-akua-gray-500">Le compte à rebours affiché aux clients.</p>
        <div className="mt-5 grid gap-5">
          <Segmented
            value={d.mode}
            onChange={(v) => setTiming({ mode: v, startedAt: v === "duration" && d.mode !== "duration" ? new Date().toISOString() : d.startedAt })}
            options={[
              { value: "midnight", label: "Jusqu'à minuit, chaque jour", icon: Moon },
              { value: "duration", label: "Durée choisie", icon: Clock3 },
            ]}
          />
          {d.mode === "duration" && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {DURATIONS.map((x) => (
                  <button
                    key={x.h}
                    type="button"
                    onClick={() => {
                      setCustomHours(false);
                      setTiming({ hours: x.h });
                    }}
                    className={cn(
                      "h-10 rounded-full border px-4 text-[13.5px] font-semibold transition-colors",
                      !customHours && d.hours === x.h ? "border-akua-blue bg-akua-blue-100 text-akua-blue" : "border-akua-gray-200 hover:border-akua-ink",
                    )}
                  >
                    {x.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCustomHours(true)}
                  className={cn("h-10 rounded-full border px-4 text-[13.5px] font-semibold transition-colors", customHours ? "border-akua-blue bg-akua-blue-100 text-akua-blue" : "border-akua-gray-200 hover:border-akua-ink")}
                >
                  Autre
                </button>
                {customHours && (
                  <span className="flex items-center gap-2">
                    <input
                      inputMode="numeric"
                      value={d.hours}
                      onChange={(e) => setTiming({ hours: Math.min(720, Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1)) })}
                      aria-label="Nombre d'heures"
                      className={cn(inputCls(), "h-10 w-20 text-center")}
                    />
                    <span className="text-[13.5px] text-akua-gray-500">heures</span>
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3 rounded-[18px] bg-akua-page p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13.5px]">
                  {end ? (
                    <>
                      Se termine le <span className="font-semibold">{fmtEnd.format(end)}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-akua-red">L&apos;offre est terminée.</span>
                  )}
                </p>
                <button type="button" onClick={() => set("startedAt", new Date().toISOString())} className={btn({ variant: "outline", size: "sm" })}>
                  <RotateCcw aria-hidden className="size-4" /> Relancer à partir de maintenant
                </button>
              </div>
              <Toggle checked={d.repeat} onChange={(v) => set("repeat", v)} label="Relancer automatiquement" description="À la fin, une nouvelle période de la même durée démarre." icon={RotateCcw} />
            </>
          )}
        </div>
      </section>

      {/* textes */}
      <section className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
        <h2 className="text-[16.5px] font-bold">Textes</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Titre">
            <input value={d.title} onChange={(e) => set("title", e.target.value)} className={inputCls()} />
          </Field>
          <Field label="Sous-titre (en bleu)" hint="Proposé automatiquement selon la durée.">
            <input value={d.highlight} onChange={(e) => set("highlight", e.target.value)} className={inputCls()} />
          </Field>
          <Field label="Phrase d'accroche" className="sm:col-span-2">
            <input value={d.text} onChange={(e) => set("text", e.target.value)} className={inputCls()} />
          </Field>
        </div>
        <div className="mt-4 rounded-[18px] bg-akua-page p-5">
          <p className="text-[26px] leading-[1.02] font-extrabold tracking-[-0.04em] md:text-[32px]">
            {d.title}
            <br />
            <span className="text-akua-blue">{d.highlight}</span>
          </p>
          <p className="mt-2 max-w-md text-[13.5px] text-akua-gray-500">{d.text}</p>
        </div>
      </section>

      {/* produits */}
      <section className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[16.5px] font-bold">
              Produits en offre <span className="text-akua-gray-500 tabular-nums">· {selected.length}/{MAX_DEAL_PRODUCTS}</span>
            </h2>
            <p className="mt-0.5 text-[13px] text-akua-gray-500">Chaque carte porte la mention « Exclusif ». Le 4e produit s&apos;affiche sur mobile.</p>
          </div>
          <button type="button" onClick={() => setPicker(true)} disabled={selected.length >= MAX_DEAL_PRODUCTS} className={btn({ variant: "outline", size: "sm" })}>
            <Plus aria-hidden className="size-4" /> Ajouter des produits
          </button>
        </div>
        <ul className="mt-5 flex flex-col gap-2">
          {selected.map((p, i) => {
            const pct = discountPercent(p.price, p.compareAtPrice) ?? 0;
            return (
              <li key={p.id} className="flex items-center gap-3 rounded-[18px] border border-akua-gray-200 p-2.5 pr-3">
                <span className="w-5 shrink-0 text-center text-[12.5px] font-bold text-akua-gray-500 tabular-nums">{i + 1}</span>
                <span className="relative size-14 shrink-0 overflow-hidden rounded-[14px] bg-akua-tile">
                  {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-contain p-1" unoptimized={p.images[0].startsWith("data:")} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                  <span className="flex flex-wrap items-center gap-x-2 text-[12.5px] tabular-nums">
                    <span className="font-bold text-akua-blue">{formatFCFA(p.price)}</span>
                    {pct > 0 ? (
                      <>
                        <span className="text-akua-gray-500 line-through">{formatFCFA(p.compareAtPrice!)}</span>
                        <span className="font-semibold text-akua-red">-{pct} %</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-[#b7791f]">
                        <AlertTriangle aria-hidden className="size-3.5" /> Sans prix barré
                      </span>
                    )}
                  </span>
                </span>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" className="hidden size-8 place-items-center rounded-full border border-akua-gray-200 hover:border-akua-ink disabled:opacity-30 sm:grid">
                    <ArrowUp aria-hidden className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} aria-label="Descendre" className="hidden size-8 place-items-center rounded-full border border-akua-gray-200 hover:border-akua-ink disabled:opacity-30 sm:grid">
                    <ArrowDown aria-hidden className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => set("productIds", d.productIds.filter((x) => x !== p.id))} aria-label={`Retirer ${p.name}`} className="grid size-8 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-red/5 hover:text-akua-red">
                    <X aria-hidden className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
          {selected.length === 0 && (
            <li className="rounded-[18px] border border-dashed border-akua-gray-200 px-4 py-8 text-center text-[13.5px] text-akua-gray-500">
              Aucun produit : la section « Offre spéciale » ne s&apos;affichera pas sur l&apos;accueil.
            </li>
          )}
        </ul>
        <p className="mt-3 text-[12.5px] text-akua-gray-500">
          Le prix promotionnel se règle sur la fiche de chaque produit (
          <Link href={`${base}/produits`} className="font-semibold text-akua-blue">
            Produits
          </Link>
          ).
        </p>
      </section>

      {/* vidéos */}
      <section className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
        <h2 className="text-[16.5px] font-bold">Vidéos TikTok</h2>
        <p className="mt-0.5 text-[13px] text-akua-gray-500">Deux cartes vidéo encadrent les produits. Collez le lien d&apos;une vidéo TikTok publique, ou l&apos;adresse d&apos;un fichier .mp4.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <VideoCard title="Carte de gauche" value={d.videos[0]} onChange={(v) => set("videos", [v, d.videos[1]])} />
          <VideoCard title="Carte de droite" value={d.videos[1]} onChange={(v) => set("videos", [d.videos[0], v])} />
        </div>
      </section>

      {/* barre d'enregistrement */}
      <div className={cn("fixed inset-x-0 bottom-0 z-30 border-t border-akua-gray-200 bg-akua-white/95 backdrop-blur transition-transform duration-300 lg:left-[272px]", dirty ? "translate-y-0" : "translate-y-full")}>
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-8">
          <p className="text-[13.5px] font-medium text-akua-gray-500">Modifications non enregistrées</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setD(saved)} className={btn({ variant: "outline", size: "md" })}>
              Annuler
            </button>
            <button type="button" onClick={save} className={btn({ variant: "primary", size: "md" })}>
              <Check aria-hidden className="size-4" /> Enregistrer
            </button>
          </div>
        </div>
      </div>

      <ProductPicker open={picker} onOpenChange={setPicker} selected={d.productIds} onAdd={(ids) => set("productIds", [...d.productIds, ...ids].slice(0, MAX_DEAL_PRODUCTS))} />

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-akua-ink px-5 py-3 text-[14px] font-semibold text-akua-white shadow-[0_20px_40px_-16px_rgb(7_8_12/0.6)]">
          <Check aria-hidden className="size-[18px] text-akua-whatsapp" /> {toast}
        </div>
      )}
    </div>
  );
}

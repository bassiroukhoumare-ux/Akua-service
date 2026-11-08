"use client";

import { Check, Copy, Megaphone, MoreHorizontal, Pencil, Plus, Power, Shuffle, TicketPercent, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnnouncementView } from "@/components/layout/announcement-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SearchSelect } from "@/components/ui/search-select";
import type { PromoCode } from "@/data/promo-codes";
import { btn } from "@/lib/btn";
import { formatFCFA } from "@/lib/format";
import { computeDiscount } from "@/lib/promo";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { type Announcement, type AnnouncementTheme, newPromoId, promoLabel, promoStatus, type PromoStatus, useAdminPromos } from "@/store/admin-promos";
import { useAdmin } from "../actor-context";
import { Field, inputCls, PriceInput, Segmented, Toggle } from "../form";
import { DemoNotice, PageHeader } from "../ui";

const STATUS: Record<PromoStatus, { label: string; tone: string }> = {
  active: { label: "Actif", tone: "bg-akua-whatsapp/12 text-[#128c4a]" },
  scheduled: { label: "Programmé", tone: "bg-akua-blue-100 text-akua-blue" },
  expired: { label: "Expiré", tone: "bg-akua-page text-akua-gray-500" },
  disabled: { label: "Désactivé", tone: "bg-akua-page text-akua-gray-500" },
};
const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const PAGES = [
  { value: "", label: "Aucun lien" },
  { value: "/boutique", label: "Boutique" },
  { value: "/boutique/promos", label: "Promotions" },
  { value: "/packs", label: "Packs" },
  { value: "/vente-en-gros", label: "Vente en gros" },
];

function validity(p: PromoCode) {
  const s = promoStatus(p);
  if (s === "scheduled" && p.startsAt) return `Commence le ${fmt.format(new Date(p.startsAt))}`;
  if (!p.endsAt) return "Sans date de fin";
  return `${s === "expired" ? "Terminé le" : "Jusqu'au"} ${fmt.format(new Date(p.endsAt))}`;
}

/** datetime-local ↔ ISO */
const toLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

function randomCode() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = new Uint32Array(5);
  crypto.getRandomValues(buf);
  return `AKUA${Array.from(buf, (n) => abc[n % abc.length]).join("")}`;
}

/* -------------------------------------------------------------- dialogue */

type End = "none" | "24" | "48" | "168" | "date";

function CodeDialog({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: PromoCode }) {
  const { actor } = useAdmin();
  const codes = useAdminPromos((s) => s.codes);
  const save = useAdminPromos((s) => s.saveCode);
  const [code, setCode] = useState("");
  const [type, setType] = useState<PromoCode["type"]>("percent");
  const [value, setValue] = useState<number | undefined>();
  const [hasMin, setHasMin] = useState(false);
  const [minTotal, setMinTotal] = useState<number | undefined>();
  const [later, setLater] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [end, setEnd] = useState<End>("none");
  const [endsAt, setEndsAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setCode(initial?.code ?? randomCode());
    setType(initial?.type ?? "percent");
    setValue(initial?.value);
    setHasMin(!!initial?.minTotal);
    setMinTotal(initial?.minTotal);
    setLater(!!initial?.startsAt && new Date(initial.startsAt).getTime() > Date.now());
    setStartsAt(toLocal(initial?.startsAt));
    setEnd(initial?.endsAt ? "date" : "none");
    setEndsAt(toLocal(initial?.endsAt));
    setErrors({});
  }, [open, initial]);

  const draft: PromoCode = { code, type, value: value ?? 0, minTotal: hasMin ? minTotal : undefined, label: "" };
  const example = 100000;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    const c = code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,20}$/.test(c)) er.code = "3 à 20 caractères : lettres, chiffres ou tirets, sans espace.";
    else if (codes.some((x) => x.code === c && x.id !== initial?.id)) er.code = "Ce code existe déjà.";
    if (!value) er.value = "Indiquez la réduction.";
    else if (type === "percent" && (value < 1 || value > 90)) er.value = "Entre 1 et 90 %.";
    if (hasMin && !minTotal) er.minTotal = "Indiquez le montant minimum.";
    if (later && !startsAt) er.startsAt = "Choisissez la date de début.";
    if (end === "date" && !endsAt) er.endsAt = "Choisissez la date de fin.";
    const start = later && startsAt ? new Date(startsAt) : new Date();
    const endDate = end === "none" ? null : end === "date" ? new Date(endsAt) : new Date(start.getTime() + Number(end) * 3600_000);
    if (endDate && endDate.getTime() <= start.getTime()) er.endsAt = "La fin doit être après le début.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const p: PromoCode = {
      id: initial?.id ?? newPromoId(),
      code: c,
      type,
      value: value!,
      minTotal: hasMin ? minTotal : undefined,
      label: promoLabel({ type, value: value!, minTotal: hasMin ? minTotal : undefined }),
      active: initial?.active ?? true,
      startsAt: later ? start.toISOString() : (initial?.startsAt ?? new Date().toISOString()),
      endsAt: endDate?.toISOString(),
      createdBy: initial?.createdBy ?? actor.name,
    };
    save(p, actor);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
        className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[600px] flex-col gap-0 overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white p-0 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0 sm:max-w-[600px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-akua-gray-200 px-5 py-5 sm:px-7">
          <div>
            <DialogTitle className="text-[20px] font-extrabold tracking-[-0.02em]">{initial ? "Modifier le code" : "Nouveau code promo"}</DialogTitle>
            <DialogDescription className="mt-1 text-[13.5px] text-akua-gray-500">Le client le saisit dans son panier : la réduction s&apos;applique au total et figure dans la commande WhatsApp.</DialogDescription>
          </div>
          <button type="button" onClick={() => onOpenChange(false)} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-akua-page">
            <X aria-hidden className="size-[18px]" />
          </button>
        </div>
        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            <Field id="pc-code" label="Code" error={errors.code} hint="Ce que le client tape dans son panier.">
              <div className="flex gap-2">
                <input
                  id="pc-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                  maxLength={20}
                  autoComplete="off"
                  className={cn(inputCls(errors.code), "font-mono text-[17px] font-bold tracking-[0.08em] uppercase")}
                />
                <button type="button" onClick={() => setCode(randomCode())} title="Générer un code" aria-label="Générer un code" className={btn({ variant: "outline", size: "icon", className: "size-12 rounded-2xl" })}>
                  <Shuffle aria-hidden className="size-[18px]" />
                </button>
              </div>
            </Field>

            <Field label="Type de réduction">
              <Segmented
                value={type}
                onChange={(v) => {
                  setType(v);
                  setValue(undefined);
                }}
                options={[
                  { value: "percent", label: "Pourcentage (%)" },
                  { value: "amount", label: "Montant fixe (F)" },
                ]}
              />
            </Field>
            <Field id="pc-value" label={type === "percent" ? "Réduction en %" : "Montant de la réduction"} error={errors.value} className="sm:max-w-[280px]">
              {type === "percent" ? (
                <div className="relative">
                  <input
                    id="pc-value"
                    inputMode="numeric"
                    value={value ?? ""}
                    onChange={(e) => setValue(Number(e.target.value.replace(/\D/g, "").slice(0, 2)) || undefined)}
                    placeholder="20"
                    className={cn(inputCls(errors.value), "pr-10 font-semibold tabular-nums")}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-semibold text-akua-gray-500">%</span>
                </div>
              ) : (
                <PriceInput id="pc-value" value={value} onChange={setValue} error={errors.value} placeholder="5 000" />
              )}
            </Field>

            <div className="grid gap-3">
              <Toggle checked={hasMin} onChange={setHasMin} label="Montant minimum d'achat" description="Le code ne marche qu'à partir d'un certain total." />
              {hasMin && (
                <Field id="pc-min" label="Minimum" error={errors.minTotal} className="sm:max-w-[280px]">
                  <PriceInput id="pc-min" value={minTotal} onChange={setMinTotal} error={errors.minTotal} placeholder="50 000" />
                </Field>
              )}
            </div>

            <div className="grid gap-3">
              <p className="text-[13.5px] font-medium">Validité</p>
              <Toggle checked={later} onChange={setLater} label="Commencer plus tard" description="Par défaut, le code marche dès maintenant." />
              {later && (
                <Field id="pc-start" label="Début" error={errors.startsAt} className="sm:max-w-[280px]">
                  <input id="pc-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputCls(errors.startsAt)} />
                </Field>
              )}
              <Field label="Fin">
                <Segmented
                  value={end}
                  onChange={setEnd}
                  options={[
                    { value: "none", label: "Sans fin" },
                    { value: "24", label: "24 h" },
                    { value: "48", label: "48 h" },
                    { value: "168", label: "7 jours" },
                    { value: "date", label: "Date précise" },
                  ]}
                  className="[&_button]:h-10 [&_button]:px-3.5 [&_button]:text-[13px]"
                />
              </Field>
              {end === "date" && (
                <Field id="pc-end" label="Se termine le" error={errors.endsAt} className="sm:max-w-[280px]">
                  <input id="pc-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputCls(errors.endsAt)} />
                </Field>
              )}
              {errors.endsAt && end !== "date" && <p className="text-[12.5px] font-medium text-akua-red">{errors.endsAt}</p>}
            </div>

            {!!value && (
              <div className="rounded-[18px] bg-akua-page p-4 text-[13.5px]">
                <p className="font-semibold">{promoLabel(draft)}</p>
                <p className="mt-1 text-akua-gray-500">
                  Exemple : sur un panier de {formatFCFA(example)},{" "}
                  {hasMin && minTotal && example < minTotal ? "le code ne s'applique pas encore." : <>le client paie <span className="font-bold text-akua-ink">{formatFCFA(example - computeDiscount(draft, example))}</span> au lieu de {formatFCFA(example)}.</>}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2.5 border-t border-akua-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button type="button" onClick={() => onOpenChange(false)} className={btn({ variant: "outline", size: "md" })}>
              Annuler
            </button>
            <button type="submit" className={btn({ variant: "primary", size: "md" })}>
              <Check aria-hidden className="size-4" /> {initial ? "Enregistrer" : "Créer le code"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------- bannière d'annonce */

const TEMPLATES = ["Utilisez le code {CODE} et profitez de {REMISE}", "{REMISE} avec le code {CODE}, jusqu'à demain seulement", "Code {CODE} : {REMISE} sur toute la boutique", "Livraison au Togo et dans la sous-région, commandez sur WhatsApp"];

function AnnouncementPanel() {
  const { actor } = useAdmin();
  const saved = useAdminPromos((s) => s.announcement);
  const codes = useAdminPromos((s) => s.codes);
  const saveA = useAdminPromos((s) => s.saveAnnouncement);
  const [a, setA] = useState<Announcement>(saved);
  const [ok, setOk] = useState(false);
  const dirty = JSON.stringify(a) !== JSON.stringify(saved);
  const set = <K extends keyof Announcement>(k: K, v: Announcement[K]) => setA((x) => ({ ...x, [k]: v }));
  const code = a.codeId ? (codes.find((c) => c.id === a.codeId) ?? null) : null;
  const codeStatus = code ? promoStatus(code) : null;

  return (
    <section className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-akua-blue-100 text-akua-blue">
            <Megaphone aria-hidden className="size-5" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[16.5px] font-bold">Bannière d&apos;annonce</h2>
            <p className="mt-0.5 text-[13px] text-akua-gray-500">Un bandeau tout en haut du site pour mettre en avant un code promo. Il disparaît seul quand le code expire.</p>
          </div>
        </div>
      </div>

      {/* aperçus */}
      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-[16px] border border-akua-gray-200">
          <p className="bg-akua-page px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Ordinateur</p>
          <AnnouncementView a={a} code={code} preview onClose={() => {}} />
          <div className="h-10 bg-[linear-gradient(var(--akua-white),var(--akua-page))]" />
        </div>
        <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[16px] border border-akua-gray-200">
          <p className="bg-akua-page px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Mobile</p>
          <AnnouncementView a={a} code={code} preview onClose={() => {}} />
          <div className="h-10 bg-[linear-gradient(var(--akua-white),var(--akua-page))]" />
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <Toggle checked={a.enabled} onChange={(v) => set("enabled", v)} label="Afficher la bannière sur le site" icon={Megaphone} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Code mis en avant" hint={codeStatus && codeStatus !== "active" ? `Ce code est ${STATUS[codeStatus].label.toLowerCase()} : la bannière ne s'affichera pas.` : undefined}>
            <SearchSelect
              value={a.codeId ?? "none"}
              onChange={(v) => set("codeId", v === "none" ? null : v)}
              options={[{ value: "none", label: "Aucun (message seul)" }, ...codes.map((c) => ({ value: c.id!, label: c.code, hint: STATUS[promoStatus(c)].label }))]}
              aria-label="Code mis en avant"
            />
          </Field>
          <Field label="Lien au clic sur le message">
            <SearchSelect value={a.link} onChange={(v) => set("link", v)} options={PAGES} aria-label="Lien" />
          </Field>
        </div>
        <Field label="Message" hint="{CODE} et {REMISE} sont remplacés automatiquement par le code et sa réduction.">
          <input value={a.message} onChange={(e) => set("message", e.target.value)} className={inputCls()} />
        </Field>
        <div className="-mt-1 flex flex-wrap gap-1.5">
          {TEMPLATES.map((tpl) => (
            <button key={tpl} type="button" onClick={() => set("message", tpl)} className="h-8 rounded-full border border-dashed border-akua-gray-200 px-3 text-[12.5px] font-medium text-akua-gray-500 hover:border-akua-blue hover:text-akua-blue">
              {tpl.replace("{CODE}", "CODE").replace("{REMISE}", "-20 %")}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Couleur">
            <Segmented<AnnouncementTheme>
              value={a.theme}
              onChange={(v) => set("theme", v)}
              options={[
                { value: "blue", label: "Bleu" },
                { value: "dark", label: "Noir" },
                { value: "gold", label: "Doré" },
              ]}
            />
          </Field>
          <Toggle checked={a.countdown} onChange={(v) => set("countdown", v)} label="Afficher le temps restant" description={code?.endsAt ? "Compte à rebours jusqu'à la fin du code." : "Disponible pour un code avec une date de fin."} />
        </div>
        <div className="flex items-center justify-end gap-3">
          {ok && !dirty && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#128c4a]">
              <Check aria-hidden className="size-4" /> Enregistré
            </span>
          )}
          {dirty && (
            <button type="button" onClick={() => setA(saved)} className={btn({ variant: "outline", size: "md" })}>
              Annuler
            </button>
          )}
          <button
            type="button"
            disabled={!dirty}
            onClick={() => {
              saveA(a, actor);
              setOk(true);
            }}
            className={btn({ variant: "primary", size: "md" })}
          >
            <Check aria-hidden className="size-4" /> Enregistrer la bannière
          </button>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- liste */

function CodeMenu({ c, onEdit, onDelete }: { c: PromoCode; onEdit: () => void; onDelete: () => void }) {
  const { actor } = useAdmin();
  const toggle = useAdminPromos((s) => s.toggleCode);
  const [open, setOpen] = useState(false);
  const item = "flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[14px] font-medium hover:bg-akua-page";
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`Actions pour ${c.code}`} aria-expanded={open} className="grid size-9 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-page hover:text-akua-ink">
        <MoreHorizontal aria-hidden className="size-5" />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Fermer" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute top-full right-0 z-40 mt-1 w-52 rounded-[18px] border border-akua-gray-200 bg-akua-white p-1.5 shadow-[0_24px_60px_-24px_rgb(11_16_32/0.35)]">
            <button role="menuitem" type="button" className={item} onClick={run(onEdit)}>
              <Pencil aria-hidden className="size-4 text-akua-gray-500" /> Modifier
            </button>
            <button role="menuitem" type="button" className={item} onClick={run(() => toggle(c.id!, actor))}>
              <Power aria-hidden className="size-4 text-akua-gray-500" /> {c.active === false ? "Activer" : "Désactiver"}
            </button>
            <div className="my-1 h-px bg-akua-gray-200" />
            <button role="menuitem" type="button" className={cn(item, "text-akua-red hover:bg-akua-red/5")} onClick={run(onDelete)}>
              <Trash2 aria-hidden className="size-4" /> Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CopyChip({ code }: { code: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setOk(true);
          window.setTimeout(() => setOk(false), 1500);
        } catch {}
      }}
      title="Copier le code"
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-dashed border-akua-ink/30 bg-akua-page px-3 font-mono text-[14.5px] font-bold tracking-[0.08em] transition-colors hover:border-akua-blue"
    >
      {code}
      {ok ? <Check aria-hidden className="size-3.5 text-[#128c4a]" strokeWidth={3} /> : <Copy aria-hidden className="size-3.5 text-akua-gray-500" />}
    </button>
  );
}

export function PromosView() {
  const hydrated = useHydrated();
  const { actor } = useAdmin();
  const codes = useAdminPromos((s) => s.codes);
  const del = useAdminPromos((s) => s.deleteCode);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | undefined>();
  const [toDelete, setToDelete] = useState<PromoCode | null>(null);
  const sorted = useMemo(() => {
    const rank: Record<PromoStatus, number> = { active: 0, scheduled: 1, disabled: 2, expired: 3 };
    return [...codes].sort((a, b) => rank[promoStatus(a)] - rank[promoStatus(b)]);
  }, [codes]);

  if (!hydrated) return <div className="h-[60vh] animate-pulse rounded-[24px] bg-akua-white" />;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        title="Codes promo"
        description="Créez des codes de réduction à communiquer à vos clients, et annoncez-les en haut du site."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
            className={btn({ variant: "primary", size: "md" })}
          >
            <Plus aria-hidden className="size-[18px]" /> Créer un code
          </button>
        }
      />
      <DemoNotice>Codes et bannière sont gardés dans ce navigateur : vous pouvez déjà les tester dans le panier du site sur cet appareil. Ils marcheront pour tous vos clients dès que la base de données sera branchée.</DemoNotice>

      <section className="overflow-hidden rounded-[24px] border border-akua-gray-200 bg-akua-white">
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4 md:px-6">
          <h2 className="text-[16.5px] font-bold">
            {codes.length} code{codes.length > 1 ? "s" : ""}
          </h2>
        </div>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center border-t border-akua-gray-200 px-6 py-14 text-center">
            <TicketPercent aria-hidden className="size-10 text-akua-gray-200" strokeWidth={1.3} />
            <p className="mt-3 text-[16px] font-bold">Aucun code promo</p>
            <p className="mt-1 text-[14px] text-akua-gray-500">Créez votre premier code pour l&apos;annoncer à vos clients.</p>
          </div>
        ) : (
          <ul className="divide-y divide-akua-gray-200 border-t border-akua-gray-200">
            {sorted.map((c) => {
              const st = promoStatus(c);
              return (
                <li key={c.id} className={cn("flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:gap-5 md:px-6", (st === "expired" || st === "disabled") && "opacity-60")}>
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
                    <CopyChip code={c.code} />
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-semibold">{c.label || promoLabel(c)}</p>
                      <p className="text-[12.5px] text-akua-gray-500">
                        {validity(c)}
                        {c.createdBy ? ` · créé par ${c.createdBy}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-semibold", STATUS[st].tone)}>{STATUS[st].label}</span>
                    <CodeMenu
                      c={c}
                      onEdit={() => {
                        setEditing(c);
                        setOpen(true);
                      }}
                      onDelete={() => setToDelete(c)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AnnouncementPanel />

      <CodeDialog open={open} onOpenChange={setOpen} initial={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Supprimer le code ${toDelete?.code ?? ""} ?`}
        description="Les clients ne pourront plus l'utiliser. Pour l'arrêter temporairement, désactivez-le plutôt."
        onConfirm={() => {
          if (toDelete?.id) del(toDelete.id, actor);
          setToDelete(null);
        }}
      />
    </div>
  );
}

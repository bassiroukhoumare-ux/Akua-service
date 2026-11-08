"use client";

import { Check, Copy, KeyRound, MoreHorizontal, Pencil, Power, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { ADMIN_GROUPS, ADMIN_MODULES, type AdminModuleId, TEAM_BASE } from "@/config/admin";
import { type MemberStatus, timeAgo } from "@/lib/admin/demo";
import type { PublicMember } from "@/lib/admin/team-store";
import { btn } from "@/lib/btn";
import { cn } from "@/lib/utils";
import { PageHeader, Panel } from "./ui";

type TeamMember = PublicMember & { owner?: boolean };
const OWNER_ROW: TeamMember = { id: "owner", name: "Propriétaire AKUA Service", identifier: "Connexion par mot de passe seul", owner: true, modules: [], status: "active", mustChange: false, createdAt: "" };

// le tableau de bord est ouvert à tous les équipiers ; l'équipe et l'activité restent réservées au propriétaire
const RIGHTS = ADMIN_GROUPS.map((g) => ({ ...g, modules: g.modules.filter((m) => m.id !== "dashboard" && !m.ownerOnly) })).filter((g) => g.modules.length);
const ALL: AdminModuleId[] = RIGHTS.flatMap((g) => g.modules.map((m) => m.id));

const PRESETS: { label: string; modules: AdminModuleId[] }[] = [
  { label: "Catalogue", modules: ["products", "categories"] },
  { label: "Vitrine et promos", modules: ["home", "deals", "promos"] },
  { label: "Service client", modules: ["reviews", "favorites", "carts"] },
  { label: "Accès complet", modules: ALL },
];

const STATUS: Record<MemberStatus, { label: string; tone: string }> = {
  active: { label: "Actif", tone: "bg-akua-whatsapp/12 text-[#128c4a]" },
  pending: { label: "Première connexion en attente", tone: "bg-akua-blue-100 text-akua-blue" },
  disabled: { label: "Désactivé", tone: "bg-akua-page text-akua-gray-500" },
};

const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const API = "/spaceakua/api/equipe";

const moduleLabel = (id: AdminModuleId) => ADMIN_MODULES.find((m) => m.id === id)?.label ?? id;

/* ------------------------------------------------------------ formulaire */

type Draft = { name: string; identifier: string; modules: AdminModuleId[] };
type FormErrors = Partial<Record<"name" | "identifier" | "modules", string>>;

function MemberDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: TeamMember;
  onSave: (d: Draft) => Promise<string | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [d, setD] = useState<Draft>({ name: "", identifier: "", modules: [] });
  const [errors, setErrors] = useState<FormErrors>({});
  useEffect(() => {
    if (open) {
      setD(initial ? { name: initial.name, identifier: initial.identifier, modules: initial.modules } : { name: "", identifier: "", modules: [] });
      setErrors({});
    }
  }, [open, initial]);

  const toggle = (id: AdminModuleId) => {
    setD((x) => ({ ...x, modules: x.modules.includes(id) ? x.modules.filter((m) => m !== id) : [...x.modules, id] }));
    setErrors((e) => ({ ...e, modules: undefined }));
  };
  const same = (a: AdminModuleId[], b: AdminModuleId[]) => a.length === b.length && a.every((m) => b.includes(m));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: FormErrors = {};
    if (d.name.trim().length < 2) er.name = "Indiquez le nom de l'équipier.";
    if (d.identifier.trim().length < 3) er.identifier = "Indiquez un identifiant (numéro WhatsApp conseillé).";
    if (!d.modules.length) er.modules = "Choisissez au moins un module.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    const err = await onSave({ ...d, name: d.name.trim(), identifier: d.identifier.trim() });
    setBusy(false);
    if (err) setErrors({ identifier: err.includes("numéro") ? err : undefined, modules: err.includes("numéro") ? undefined : err });
  }

  const field = (err?: string) =>
    cn(
      "h-12 w-full rounded-2xl border bg-akua-white px-4 text-[16px] outline-none transition-colors placeholder:text-akua-gray-500 focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10 sm:text-[15px]",
      err ? "border-akua-red" : "border-akua-gray-200",
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
        className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[640px] flex-col gap-0 overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white p-0 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0 sm:max-w-[640px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-akua-gray-200 px-5 py-5 sm:px-7">
          <div>
            <DialogTitle className="text-[20px] font-extrabold tracking-[-0.02em]">{initial ? "Modifier l'équipier" : "Ajouter un équipier"}</DialogTitle>
            <DialogDescription className="mt-1 text-[13.5px] text-akua-gray-500">
              {initial ? "Modifiez son nom, son identifiant ou ce qu'il peut gérer." : "Choisissez ce qu'il pourra gérer. Un mot de passe provisoire sera créé à l'étape suivante."}
            </DialogDescription>
          </div>
          <button type="button" onClick={() => onOpenChange(false)} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-akua-page">
            <X aria-hidden className="size-[18px]" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tm-name" className="mb-1.5 block text-[13.5px] font-medium">
                  Nom complet
                </label>
                <input id="tm-name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Ex. Afi Lawson" autoComplete="off" className={field(errors.name)} />
                {errors.name && <p className="mt-1 text-[12.5px] font-medium text-akua-red">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="tm-id" className="mb-1.5 block text-[13.5px] font-medium">
                  Identifiant de connexion
                </label>
                <input id="tm-id" value={d.identifier} onChange={(e) => setD({ ...d, identifier: e.target.value })} placeholder="+228 90 00 00 00" inputMode="tel" autoComplete="off" className={field(errors.identifier)} />
                {errors.identifier ? <p className="mt-1 text-[12.5px] font-medium text-akua-red">{errors.identifier}</p> : <p className="mt-1 text-[12px] text-akua-gray-500">Son numéro WhatsApp, avec l&apos;indicatif. Il s&apos;en servira pour se connecter.</p>}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold">Ce qu&apos;il peut gérer</p>
                <p className="text-[12.5px] text-akua-gray-500">Il ne verra que ces modules. L&apos;équipe et l&apos;activité restent réservées au propriétaire.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setD((x) => ({ ...x, modules: p.modules }));
                      setErrors((e) => ({ ...e, modules: undefined }));
                    }}
                    className={cn(
                      "h-8 rounded-full px-3 text-[12.5px] font-semibold transition-colors",
                      same(d.modules, p.modules) ? "bg-akua-ink text-akua-white" : "bg-akua-page text-akua-ink hover:bg-akua-gray-200/70",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {RIGHTS.map((g) => (
                <fieldset key={g.label}>
                  <legend className="mb-2 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">{g.label}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {g.modules.map((m) => {
                      const on = d.modules.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-[16px] border p-3 transition-colors",
                            on ? "border-akua-blue bg-akua-blue-100/50" : "border-akua-gray-200 hover:border-akua-gray-500/40",
                          )}
                        >
                          <input type="checkbox" checked={on} onChange={() => toggle(m.id)} className="peer sr-only" />
                          <span
                            aria-hidden
                            className={cn(
                              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-akua-blue/20",
                              on ? "border-akua-blue bg-akua-blue text-akua-white" : "border-akua-gray-200 bg-akua-white",
                            )}
                          >
                            {on && <Check className="size-3.5" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-[14px] font-semibold">
                              <m.icon aria-hidden className="size-4 text-akua-gray-500" strokeWidth={1.8} /> {m.label}
                            </span>
                            <span className="mt-0.5 block text-[12.5px] leading-snug text-akua-gray-500">{m.description}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
            {errors.modules && <p className="mt-3 text-[12.5px] font-medium text-akua-red">{errors.modules}</p>}
          </div>

          <div className="flex flex-col-reverse gap-2.5 border-t border-akua-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button type="button" onClick={() => onOpenChange(false)} className={btn({ variant: "outline", size: "md" })}>
              Annuler
            </button>
            <button type="submit" disabled={busy} className={btn({ variant: "primary", size: "md" })}>
              {busy ? "Enregistrement…" : initial ? "Enregistrer les modifications" : "Créer l'accès"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------- identifiants provisoires */

function CredentialsDialog({ member, password, onClose }: { member: TeamMember | null; password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  if (!member) return null;
  const first = member.name.split(" ")[0];
  const url = `${origin}${TEAM_BASE}`;
  const message = [
    `Bonjour ${first},`,
    "",
    "Vous avez désormais accès à l'espace équipe d'AKUA Service.",
    "",
    `Adresse : ${url}`,
    `Numéro de connexion : ${member.identifier}`,
    `Mot de passe provisoire : ${password}`,
    "",
    "À votre première connexion, vous choisirez votre propre mot de passe.",
  ].join("\n");
  const digits = member.identifier.replace(/\D/g, "");
  const wa = digits.length >= 8 ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
        className="w-[calc(100%-24px)] max-w-[460px] gap-0 overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white p-0 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0 sm:max-w-[460px]"
      >
        <div className="px-6 pt-7 pb-6 text-center sm:px-8">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-akua-blue-100">
            <KeyRound aria-hidden className="size-6 text-akua-blue" strokeWidth={1.8} />
          </span>
          <DialogTitle className="mt-4 text-[20px] font-extrabold tracking-[-0.02em]">Accès prêt pour {first}</DialogTitle>
          <DialogDescription className="mt-1.5 text-[13.5px] text-akua-gray-500">
            Envoyez-lui ces informations. Le mot de passe provisoire ne sera plus affiché ensuite.
          </DialogDescription>

          <dl className="mt-5 divide-y divide-akua-gray-200 rounded-[18px] bg-akua-page text-left">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-[12.5px] text-akua-gray-500">Identifiant</dt>
              <dd className="truncate text-[14px] font-semibold">{member.identifier}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-[12.5px] text-akua-gray-500">Mot de passe provisoire</dt>
              <dd className="font-mono text-[16px] font-bold tracking-[0.06em]">{password}</dd>
            </div>
          </dl>

          <div className="mt-5 grid gap-2.5">
            <a href={wa} target="_blank" rel="noopener" className={btn({ variant: "whatsapp", size: "md" })}>
              <WhatsAppIcon size={18} /> Envoyer par WhatsApp
            </a>
            <button type="button" onClick={copy} className={btn({ variant: "outline", size: "md" })}>
              {copied ? <Check aria-hidden className="size-4 text-[#128c4a]" /> : <Copy aria-hidden className="size-4" />} {copied ? "Message copié" : "Copier le message"}
            </button>
          </div>
        </div>
        <button type="button" onClick={onClose} className="h-12 w-full border-t border-akua-gray-200 text-[14px] font-semibold text-akua-gray-500 transition-colors hover:bg-akua-page hover:text-akua-ink">
          Terminé
        </button>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------- menu actions */

function RowMenu({ member, onEdit, onReset, onToggle, onDelete }: { member: TeamMember; onEdit: () => void; onReset: () => void; onToggle: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const item = "flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[14px] font-medium hover:bg-akua-page";
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`Actions pour ${member.name}`} aria-expanded={open} className="grid size-9 place-items-center rounded-full text-akua-gray-500 transition-colors hover:bg-akua-page hover:text-akua-ink">
        <MoreHorizontal aria-hidden className="size-5" />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Fermer" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute top-full right-0 z-40 mt-1 w-60 rounded-[18px] border border-akua-gray-200 bg-akua-white p-1.5 shadow-[0_24px_60px_-24px_rgb(11_16_32/0.35)]">
            <button role="menuitem" type="button" onClick={run(onEdit)} className={item}>
              <Pencil aria-hidden className="size-4 text-akua-gray-500" /> Modifier les droits
            </button>
            <button role="menuitem" type="button" onClick={run(onReset)} className={item}>
              <KeyRound aria-hidden className="size-4 text-akua-gray-500" /> Nouveau mot de passe provisoire
            </button>
            <button role="menuitem" type="button" onClick={run(onToggle)} className={item}>
              <Power aria-hidden className="size-4 text-akua-gray-500" /> {member.status === "disabled" ? "Réactiver l'accès" : "Désactiver l'accès"}
            </button>
            <div className="my-1 h-px bg-akua-gray-200" />
            <button role="menuitem" type="button" onClick={run(onDelete)} className={cn(item, "text-akua-red hover:bg-akua-red/5")}>
              <Trash2 aria-hidden className="size-4" /> Supprimer l&apos;équipier
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Adresse du portail équipe, à donner aux équipiers (elle figure aussi dans le message WhatsApp). */
function PortalLink() {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}${TEAM_BASE}`;
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-akua-gray-200 bg-akua-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-akua-gray-500">Portail de connexion des équipiers</p>
        <p className="truncate text-[15px] font-bold">{url.replace(/^https?:\/\//, "")}</p>
        <p className="mt-0.5 text-[12.5px] text-akua-gray-500">Distinct de votre accès : vos équipiers ne voient jamais l&apos;adresse du propriétaire.</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {}
        }}
        className={btn({ variant: "outline", size: "sm", className: "self-start sm:self-auto" })}
      >
        {copied ? <Check aria-hidden className="size-4 text-[#128c4a]" /> : <Copy aria-hidden className="size-4" />} {copied ? "Copiée" : "Copier l'adresse"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<TeamMember | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [creds, setCreds] = useState<{ member: TeamMember; password: string } | null>(null);
  const [toDelete, setToDelete] = useState<TeamMember | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`${API}`, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return setLoadError("La liste des équipiers n'a pas pu être chargée.");
    setLoadError("");
    setMembers(await res.json());
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const team = useMemo(() => [OWNER_ROW, ...(members ?? [])], [members]);
  const counts = useMemo(() => ({ total: team.length, active: team.filter((m) => m.status === "active").length, pending: team.filter((m) => m.status === "pending").length }), [team]);

  async function call(method: string, body?: object, query = "") {
    const res = await fetch(`${API}${query}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { error?: string; member?: TeamMember; password?: string } | null;
    if (!res?.ok) return { error: data?.error ?? "Action impossible. Vérifiez votre connexion internet." };
    await load();
    return data ?? {};
  }

  async function save(d: Draft): Promise<string | null> {
    const r = editing ? await call("PATCH", { id: editing.id, ...d }) : await call("POST", d);
    if ("error" in r && r.error) return r.error;
    setFormOpen(false);
    if (!editing && r.member && r.password) setCreds({ member: r.member, password: r.password });
    return null;
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        title="Équipe"
        description="Ajoutez des équipiers et choisissez ce que chacun peut gérer. Aucun e-mail : vous leur envoyez vous-même leur accès sur WhatsApp."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className={btn({ variant: "primary", size: "md" })}
          >
            <UserPlus aria-hidden className="size-[18px]" /> Ajouter un équipier
          </button>
        }
      />

      {loadError && (
        <p role="alert" className="rounded-[18px] border border-akua-red/25 bg-akua-red/5 px-4 py-3 text-[13.5px] font-medium text-akua-red">
          {loadError}
        </p>
      )}

      {/* fonctionnement */}
      <ol className="grid gap-3 md:grid-cols-3">
        {[
          { t: "Créez l'accès", d: "Nom, numéro WhatsApp et modules qu'il pourra gérer." },
          { t: "Envoyez-le sur WhatsApp", d: "Un mot de passe provisoire est créé, à lui transmettre en un clic." },
          { t: "Il choisit son mot de passe", d: "À sa première connexion, il remplace le mot de passe provisoire." },
        ].map((s, i) => (
          <li key={s.t} className="flex gap-3.5 rounded-[20px] border border-akua-gray-200 bg-akua-white p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-akua-ink text-[13px] font-bold text-akua-white">{i + 1}</span>
            <div>
              <p className="text-[14.5px] font-bold">{s.t}</p>
              <p className="mt-0.5 text-[13px] text-akua-gray-500">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <PortalLink />

      <Panel
        title={`${counts.total} membre${counts.total > 1 ? "s" : ""}`}
        description={`${counts.active} actif${counts.active > 1 ? "s" : ""}${counts.pending ? ` · ${counts.pending} en attente de première connexion` : ""}`}
        bodyClassName="p-0 pt-4"
      >
        <ul className="divide-y divide-akua-gray-200 border-t border-akua-gray-200">
          {team.map((m) => (
            <li key={m.id} className={cn("flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:gap-5 md:px-6", m.status === "disabled" && "opacity-60")}>
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-[14px] font-bold", m.owner ? "bg-akua-ink text-akua-white" : "bg-akua-blue-100 text-akua-blue")}>{initials(m.name)}</span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                    <span className="truncate">{m.name}</span>
                    {m.owner && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-akua-ink px-2 py-0.5 text-[11px] font-semibold text-akua-white">
                        <ShieldCheck aria-hidden className="size-3" /> Propriétaire
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[13px] text-akua-gray-500 tabular-nums">
                    {m.identifier}
                    {m.lastSeen ? ` · vu ${timeAgo(new Date(m.lastSeen))}` : m.owner ? "" : " · jamais connecté"}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-wrap gap-1.5 md:w-[38%] md:justify-start">
                {m.owner ? (
                  <span className="rounded-full bg-akua-page px-2.5 py-1 text-[12px] font-semibold">Accès complet</span>
                ) : m.modules.length === ALL.length ? (
                  <span className="rounded-full bg-akua-page px-2.5 py-1 text-[12px] font-semibold">Accès complet</span>
                ) : (
                  <>
                    {m.modules.slice(0, 3).map((id) => (
                      <span key={id} className="rounded-full bg-akua-page px-2.5 py-1 text-[12px] font-medium">
                        {moduleLabel(id)}
                      </span>
                    ))}
                    {m.modules.length > 3 && <span className="rounded-full bg-akua-page px-2.5 py-1 text-[12px] font-semibold text-akua-gray-500">+{m.modules.length - 3}</span>}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 md:w-[230px] md:justify-end">
                <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap", STATUS[m.status].tone)}>{STATUS[m.status].label}</span>
                {m.owner ? (
                  <span className="size-9" />
                ) : (
                  <RowMenu
                    member={m}
                    onEdit={() => {
                      setEditing(m);
                      setFormOpen(true);
                    }}
                    onReset={async () => {
                      const r = await call("PATCH", { id: m.id, reset: true });
                      if ("password" in r && r.password) setCreds({ member: m, password: r.password });
                    }}
                    onToggle={() => void call("PATCH", { id: m.id, status: m.status === "disabled" ? "active" : "disabled" })}
                    onDelete={() => setToDelete(m)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <MemberDialog open={formOpen} onOpenChange={setFormOpen} initial={editing} onSave={save} />
      <CredentialsDialog member={creds?.member ?? null} password={creds?.password ?? ""} onClose={() => setCreds(null)} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Supprimer ${toDelete?.name ?? "cet équipier"} ?`}
        description="Il ne pourra plus se connecter à l'espace administrateur. Cette action est définitive."
        onConfirm={async () => {
          if (toDelete) await call("DELETE", undefined, `?id=${encodeURIComponent(toDelete.id)}`);
          setToDelete(null);
        }}
      />
    </div>
  );
}

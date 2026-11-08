"use client";

import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover } from "radix-ui";
import { useEffect, useMemo, useState } from "react";
import type { StatsPeriod } from "@/lib/analytics/aggregate";
import { cn } from "@/lib/utils";

/** Période affichée : un raccourci (jour, semaine…) ou des dates choisies dans le calendrier. */
export type PeriodValue = { kind: "preset"; id: StatsPeriod } | { kind: "range"; from: string; to: string };

export const PRESETS: { id: StatsPeriod; label: string; hint: string; range: string }[] = [
  { id: "jour", label: "Jour", hint: "vs les 24 h précédentes", range: "24 dernières heures" },
  { id: "semaine", label: "Semaine", hint: "vs semaine précédente", range: "7 derniers jours" },
  { id: "mois", label: "Mois", hint: "vs mois précédent", range: "30 derniers jours" },
  { id: "annee", label: "Année", hint: "vs année précédente", range: "12 derniers mois" },
];

/* ------------------------------------------------------------- dates (UTC = Lomé) */

const DAY = 864e5;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const parse = (s: string) => Date.parse(`${s}T00:00:00Z`);
const todayIso = () => iso(Date.now());
const shift = (s: string, days: number) => iso(parse(s) + days * DAY);
const fShort = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric", month: "short" });
const fLong = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
const fMonth = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", month: "long", year: "numeric" });
const WEEK = ["lu", "ma", "me", "je", "ve", "sa", "di"];

const nice = (s: string) => s.replace(/\./g, "");

/** « 9 nov. 2026 » ou « 3 – 9 nov. 2026 » */
export function rangeLabel(from: string, to: string) {
  if (from === to) return nice(fLong.format(parse(from)));
  const a = new Date(parse(from));
  const b = new Date(parse(to));
  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  if (sameYear && a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()} – ${nice(fLong.format(b))}`;
  return `${nice(sameYear ? fShort.format(a) : fLong.format(a))} – ${nice(fLong.format(b))}`;
}

export const rangeDays = (from: string, to: string) => Math.round((parse(to) - parse(from)) / DAY) + 1;

/** Paramètres d'adresse pour l'API des statistiques. */
export const periodQuery = (v: PeriodValue) => (v.kind === "preset" ? `periode=${v.id}` : `du=${v.from}&au=${v.to}`);

/** Libellé de comparaison sous les chiffres clés. */
export const periodHint = (v: PeriodValue) => (v.kind === "preset" ? PRESETS.find((p) => p.id === v.id)!.hint : `vs ${rangeDays(v.from, v.to)} jour${rangeDays(v.from, v.to) > 1 ? "s" : ""} précédent${rangeDays(v.from, v.to) > 1 ? "s" : ""}`);

const QUICK: { label: string; get: () => [string, string] }[] = [
  { label: "Aujourd'hui", get: () => [todayIso(), todayIso()] },
  { label: "Hier", get: () => [shift(todayIso(), -1), shift(todayIso(), -1)] },
  { label: "7 derniers jours", get: () => [shift(todayIso(), -6), todayIso()] },
  { label: "14 derniers jours", get: () => [shift(todayIso(), -13), todayIso()] },
  { label: "30 derniers jours", get: () => [shift(todayIso(), -29), todayIso()] },
  {
    label: "Ce mois-ci",
    get: () => {
      const t = todayIso();
      return [`${t.slice(0, 7)}-01`, t];
    },
  },
  {
    label: "Mois dernier",
    get: () => {
      const first = parse(`${todayIso().slice(0, 7)}-01`);
      const end = iso(first - DAY);
      return [`${end.slice(0, 7)}-01`, end];
    },
  },
  {
    label: "Cette année",
    get: () => {
      const t = todayIso();
      return [`${t.slice(0, 4)}-01-01`, t];
    },
  },
];

/* ---------------------------------------------------------------- calendrier */

function Month({ year, month, from, to, hover, onPick, onHover }: { year: number; month: number; from?: string; to?: string; hover?: string; onPick: (d: string) => void; onHover: (d?: string) => void }) {
  const first = Date.UTC(year, month, 1);
  const lead = (new Date(first).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const today = todayIso();
  // aperçu pendant le choix de la 2e date
  const end = to ?? (from && hover ? hover : undefined);
  const [lo, hi] = from && end ? (from <= end ? [from, end] : [end, from]) : [from, from];

  return (
    <div className="w-full min-w-0">
      <p className="mb-3 text-center text-[14px] font-bold first-letter:uppercase">{fMonth.format(first)}</p>
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold tracking-wide text-akua-gray-500 uppercase">
        {WEEK.map((w) => (
          <span key={w} className="pb-2">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => onHover(undefined)}>
        {Array.from({ length: lead }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = iso(first + i * DAY);
          const future = d > today;
          const edgeLo = d === lo;
          const edgeHi = d === hi;
          const inside = lo && hi && d > lo && d < hi;
          const col = (lead + i) % 7;
          return (
            <div
              key={d}
              className={cn(
                "relative flex h-10 items-center justify-center",
                (inside || (edgeLo && hi && hi !== lo) || (edgeHi && lo !== hi)) && "bg-akua-blue-100",
                edgeLo && hi !== lo && "rounded-l-full",
                edgeHi && lo !== hi && "rounded-r-full",
                inside && col === 0 && "rounded-l-full",
                inside && col === 6 && "rounded-r-full",
              )}
            >
              <button
                type="button"
                disabled={future}
                onClick={() => onPick(d)}
                onMouseEnter={() => onHover(d)}
                aria-label={nice(fLong.format(parse(d)))}
                aria-pressed={!!(edgeLo || edgeHi)}
                className={cn(
                  "relative grid size-10 place-items-center rounded-full text-[13.5px] font-medium tabular-nums transition-colors",
                  future && "cursor-not-allowed text-akua-gray-500/40",
                  !future && !edgeLo && !edgeHi && "hover:bg-akua-page",
                  (edgeLo || edgeHi) && "bg-akua-ink font-bold text-akua-white shadow-[0_8px_18px_-8px_rgb(11_16_32/0.6)]",
                  d === today && !edgeLo && !edgeHi && "font-bold text-akua-blue",
                )}
              >
                {i + 1}
                {d === today && <span aria-hidden className={cn("absolute bottom-1.5 size-1 rounded-full", edgeLo || edgeHi ? "bg-akua-white" : "bg-akua-blue")} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarPanel({ value, onApply, onClose }: { value: PeriodValue; onApply: (from: string, to: string) => void; onClose: () => void }) {
  const init = value.kind === "range" ? value : null;
  const [from, setFrom] = useState<string | undefined>(init?.from);
  const [to, setTo] = useState<string | undefined>(init?.to);
  const [hover, setHover] = useState<string>();
  const base = init?.to ?? todayIso();
  const [cursor, setCursor] = useState(() => ({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 }));
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const up = () => setWide(mq.matches);
    up();
    mq.addEventListener("change", up);
    return () => mq.removeEventListener("change", up);
  }, []);

  // en double affichage, le mois courant est à droite
  const months = wide ? [-1, 0] : [0];
  const go = (n: number) => setCursor((c) => ({ y: c.y + Math.floor((c.m + n) / 12), m: (((c.m + n) % 12) + 12) % 12 }));
  const atEnd = cursor.y > Number(todayIso().slice(0, 4)) || (cursor.y === Number(todayIso().slice(0, 4)) && cursor.m >= Number(todayIso().slice(5, 7)) - 1);

  function pick(d: string) {
    if (!from || to) {
      setFrom(d);
      setTo(undefined);
      return;
    }
    if (d < from) {
      setTo(from);
      setFrom(d);
    } else setTo(d);
  }

  const lo = from && to ? from : from;
  const hi = from && to ? to : from;
  const ready = !!from;
  const summary = from ? (to ? rangeLabel(from, to) : `${rangeLabel(from, from)} · choisissez la date de fin, ou validez ce seul jour`) : "Choisissez une date de début";

  return (
    <div className="flex max-h-[min(640px,calc(100dvh-120px))] flex-col md:flex-row">
      <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto border-b border-akua-gray-200 p-3 md:w-[188px] md:flex-col md:overflow-visible md:border-r md:border-b-0 md:p-3">
        <p className="hidden px-2.5 pt-1 pb-2 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase md:block">Raccourcis</p>
        {QUICK.map((q) => {
          const [a, b] = q.get();
          const on = lo === a && hi === b && !!to;
          return (
            <button
              key={q.label}
              type="button"
              onClick={() => {
                setFrom(a);
                setTo(b);
                setCursor({ y: Number(b.slice(0, 4)), m: Number(b.slice(5, 7)) - 1 });
              }}
              className={cn(
                "h-9 shrink-0 rounded-full px-3.5 text-left text-[13px] font-semibold whitespace-nowrap transition-colors md:rounded-xl md:px-2.5",
                on ? "bg-akua-ink text-akua-white" : "bg-akua-page text-akua-ink hover:bg-akua-gray-200/70 md:bg-transparent md:hover:bg-akua-page",
              )}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-2 md:px-6 md:pt-5">
          <div className="absolute top-3.5 right-3 left-3 flex justify-between md:top-4 md:right-5 md:left-5">
            <button type="button" onClick={() => go(-1)} aria-label="Mois précédent" className="grid size-9 place-items-center rounded-full text-akua-ink transition-colors hover:bg-akua-page">
              <ChevronLeft aria-hidden className="size-[18px]" />
            </button>
            <button type="button" onClick={() => go(1)} disabled={atEnd} aria-label="Mois suivant" className="grid size-9 place-items-center rounded-full text-akua-ink transition-colors hover:bg-akua-page disabled:opacity-30">
              <ChevronRight aria-hidden className="size-[18px]" />
            </button>
          </div>
          <div className={cn("grid gap-8", wide && "grid-cols-2")}>
            {months.map((off) => {
              const m = cursor.m + off;
              const y = cursor.y + Math.floor(m / 12);
              return <Month key={off} year={y} month={((m % 12) + 12) % 12} from={from} to={to} hover={hover} onPick={pick} onHover={setHover} />;
            })}
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-akua-gray-200 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p className="min-w-0 text-[13px] text-akua-gray-500">
            {from && to ? (
              <>
                <span className="font-semibold text-akua-ink">{summary}</span> · {rangeDays(from, to)} jour{rangeDays(from, to) > 1 ? "s" : ""}
              </>
            ) : (
              summary
            )}
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={onClose} className="h-10 flex-1 rounded-full px-4 text-[13.5px] font-semibold text-akua-gray-500 transition-colors hover:bg-akua-page hover:text-akua-ink sm:flex-none">
              Annuler
            </button>
            <button
              type="button"
              disabled={!ready}
              onClick={() => from && onApply(from, to ?? from)}
              className="h-10 flex-1 rounded-full bg-akua-ink px-5 text-[13.5px] font-semibold text-akua-white transition-all hover:bg-akua-blue disabled:opacity-40 sm:flex-none"
            >
              Afficher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Raccourcis Jour / Semaine / Mois / Année + calendrier pour choisir un jour ou une période précise. */
export function PeriodFilter({ value, onChange, className }: { value: PeriodValue; onChange: (v: PeriodValue) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const custom = value.kind === "range";
  const label = useMemo(() => (value.kind === "range" ? rangeLabel(value.from, value.to) : null), [value]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div role="tablist" aria-label="Période" className="flex rounded-full bg-akua-white p-1 shadow-[0_1px_2px_rgb(11_16_32/0.04)] ring-1 ring-akua-gray-200">
        {PRESETS.map((p) => {
          const on = value.kind === "preset" && value.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange({ kind: "preset", id: p.id })}
              className={cn("h-9 rounded-full px-3.5 text-[13.5px] font-semibold transition-all duration-200 sm:px-4", on ? "bg-akua-ink text-akua-white shadow-[0_6px_14px_-6px_rgb(11_16_32/0.55)]" : "text-akua-gray-500 hover:text-akua-ink")}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <Popover.Root open={open} onOpenChange={setOpen}>
        <div className={cn("flex h-11 items-center rounded-full ring-1 transition-colors", custom ? "bg-akua-ink text-akua-white ring-akua-ink" : "bg-akua-white text-akua-ink ring-akua-gray-200 hover:ring-akua-ink/40")}>
          <Popover.Trigger asChild>
            <button type="button" className={cn("flex h-full items-center gap-2 rounded-full text-[13.5px] font-semibold", custom ? "pr-1 pl-4" : "px-4")} aria-label="Choisir des dates dans le calendrier">
              <CalendarDays aria-hidden className="size-[18px]" strokeWidth={1.8} />
              <span className="tabular-nums">{label ?? "Calendrier"}</span>
            </button>
          </Popover.Trigger>
          {custom && (
            <button type="button" onClick={() => onChange({ kind: "preset", id: "semaine" })} aria-label="Effacer les dates" className="mr-1.5 grid size-8 place-items-center rounded-full text-akua-white/70 transition-colors hover:bg-akua-white/15 hover:text-akua-white">
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={10}
            collisionPadding={12}
            className="z-50 w-[calc(100vw-24px)] max-w-[780px] overflow-hidden rounded-[26px] border border-akua-gray-200 bg-akua-white text-akua-ink shadow-[0_40px_90px_-30px_rgb(11_16_32/0.45)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.97] md:w-auto"
          >
            <CalendarPanel
              value={value}
              onClose={() => setOpen(false)}
              onApply={(from, to) => {
                onChange({ kind: "range", from, to });
                setOpen(false);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

/** Bornes (ms) d'une période, pour filtrer des éléments datés (activité, paniers, avis…). */
export function periodBounds(v: PeriodValue, now = Date.now()): { from: number; to: number } {
  if (v.kind === "range") return { from: parse(v.from), to: parse(v.to) + DAY };
  const span = { jour: DAY, semaine: 7 * DAY, mois: 30 * DAY, annee: 365 * DAY }[v.id];
  return { from: now - span, to: now + 60_000 };
}

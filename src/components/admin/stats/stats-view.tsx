"use client";

import { CalendarRange, Check, Copy, Eye, FileText, Globe2, Monitor, MousePointer2, Package, RefreshCw, Repeat, ShieldCheck, ShoppingBag, Smartphone, Tablet, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { DemoNotice, formatNumber, PageHeader, Panel, StatTile } from "@/components/admin/ui";
import { Flag } from "@/components/ui/flag";
import { SITE_URL } from "@/config/site";
import type { SourceId } from "@/lib/analytics/sources";
import { cn } from "@/lib/utils";
import { type PeriodValue, PeriodFilter, PRESETS, periodHint, rangeDays, rangeLabel } from "../period-filter";
import { useStats } from "./use-stats";
import { SourceIcon } from "./source-icon";
import { LivePanel } from "./live-panel";
import { VisitsChart } from "../visits-chart";

const FLAGS = new Set(["TG", "BJ", "GH", "BF", "CI", "NE", "ML"]);
const fRange = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });


/** Ligne : libellé, nombre, part et barre (une seule couleur). */
function Row({ label, value, share, max }: { label: React.ReactNode; value: string; share: number; max: number }) {
  return (
    <li>
      <div className="flex items-center justify-between gap-3 text-[13.5px]">
        <span className="flex min-w-0 items-center gap-2 font-medium">{label}</span>
        <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
          <span className="text-[12.5px] text-akua-gray-500">{value}</span>
          <span className="w-12 text-right font-semibold">{share.toLocaleString("fr-FR")} %</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-akua-page">
        <div className="h-full rounded-full bg-akua-blue transition-[width] duration-500" style={{ width: `${max ? (share / max) * 100 : 0}%` }} />
      </div>
    </li>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[16px] bg-akua-page px-4 py-6 text-center text-[13.5px] text-akua-gray-500">{children}</p>;
}

const TRACKING: { id: SourceId; label: string; where: string }[] = [
  { id: "whatsapp", label: "WhatsApp", where: "Statut, messages et groupes" },
  { id: "tiktok", label: "TikTok", where: "Lien de la bio et des vidéos" },
  { id: "facebook", label: "Facebook", where: "Page et publications" },
  { id: "instagram", label: "Instagram", where: "Lien de la bio et stories" },
];

function TrackingLinks() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
    } catch {
      /* presse-papiers refusé */
    }
  };
  return (
    <Panel title="Liens de suivi" description="WhatsApp et TikTok n'indiquent pas toujours d'où vient le visiteur. Partagez ces liens : chaque visite sera comptée au bon endroit.">
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {TRACKING.map((t) => {
          const url = `${SITE_URL}/?utm_source=${t.id}`;
          const done = copied === t.id;
          return (
            <li key={t.id} className="flex min-w-0 items-center gap-3 rounded-[18px] bg-akua-page p-3 pl-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-akua-white">
                <SourceIcon id={t.id} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold">{t.label}</p>
                <p className="truncate text-[12px] text-akua-gray-500">{t.where}</p>
                <p className="mt-0.5 truncate font-mono text-[11.5px] text-akua-ink/70">{url.replace(/^https?:\/\//, "")}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(t.id, url)}
                aria-label={`Copier le lien ${t.label}`}
                className={cn("grid size-10 shrink-0 place-items-center rounded-full transition-colors", done ? "bg-akua-whatsapp/15 text-[#128c4a]" : "bg-akua-white text-akua-ink hover:bg-akua-blue-100 hover:text-akua-blue")}
              >
                {done ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" strokeWidth={1.8} />}
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[24px] bg-akua-white ring-1 ring-akua-gray-200", className)} />;
}

/** Barres par heure : la plus fréquentée est mise en avant. */
function HoursChart({ hours }: { hours: number[] }) {
  const max = Math.max(1, ...hours);
  const peak = hours.indexOf(Math.max(...hours));
  const total = hours.reduce((a, b) => a + b, 0);
  if (!total) return <Empty>Aucune visite sur cette période.</Empty>;
  return (
    <div>
      <p className="text-[13.5px]">
        Pic d&apos;affluence : <span className="font-bold">{peak}h – {peak + 1}h</span>
      </p>
      <div className="mt-4 flex h-[150px] items-end gap-1" role="img" aria-label={`Pic d'affluence entre ${peak}h et ${peak + 1}h`}>
        {hours.map((v, h) => (
          <div key={h} className="group relative flex h-full min-w-0 flex-1 items-end">
            <div className={cn("w-full rounded-t-[4px] transition-colors", h === peak ? "bg-akua-blue" : "bg-akua-blue/25 group-hover:bg-akua-blue/50")} style={{ height: `${Math.max(3, (v / max) * 100)}%` }} />
            <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-akua-ink px-1.5 py-0.5 text-[11px] whitespace-nowrap text-akua-white group-hover:block">
              {h}h · {formatNumber(v)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-akua-gray-500 tabular-nums">
        {[0, 6, 12, 18, 23].map((h) => (
          <span key={h}>{h}h</span>
        ))}
      </div>
    </div>
  );
}

function Audience({ fresh, returning, depth }: { fresh: number; returning: number; depth: number }) {
  const total = fresh + returning;
  const pf = total ? Math.round((fresh / total) * 100) : 0;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-akua-page" aria-hidden>
        <div className="h-full bg-akua-blue" style={{ width: `${pf}%` }} />
        <div className="h-full bg-akua-ink" style={{ width: `${total ? 100 - pf : 0}%` }} />
      </div>
      <ul className="mt-5 flex flex-col gap-3 text-[13.5px]">
        <li className="flex items-center gap-3">
          <span className="size-2.5 shrink-0 rounded-full bg-akua-blue" />
          <UserPlus aria-hidden className="size-4 shrink-0 text-akua-gray-500" strokeWidth={1.8} />
          <span className="flex-1 font-medium">Nouveaux visiteurs</span>
          <span className="font-semibold tabular-nums">{formatNumber(fresh)}</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="size-2.5 shrink-0 rounded-full bg-akua-ink" />
          <Repeat aria-hidden className="size-4 shrink-0 text-akua-gray-500" strokeWidth={1.8} />
          <span className="flex-1 font-medium">Habitués</span>
          <span className="font-semibold tabular-nums">{formatNumber(returning)}</span>
        </li>
      </ul>
      <p className="mt-5 rounded-[16px] bg-akua-page px-4 py-3 text-[13px] text-akua-gray-500">
        En moyenne, un visiteur consulte <span className="font-bold text-akua-ink">{depth.toLocaleString("fr-FR")} page{depth >= 2 ? "s" : ""}</span> par visite.
      </p>
    </div>
  );
}

export function StatsView() {
  const [period, setPeriod] = useState<PeriodValue>({ kind: "preset", id: "semaine" });
  const [metric, setMetric] = useState<"visitors" | "pageviews">("visitors");
  const { data, fresh, error, loading, reload } = useStats(period);

  const hint = periodHint(period);
  const rangeText = period.kind === "preset" ? PRESETS.find((p) => p.id === period.id)!.range : `${rangeDays(period.from, period.to)} jour${rangeDays(period.from, period.to) > 1 ? "s" : ""} choisi${rangeDays(period.from, period.to) > 1 ? "s" : ""}`;
  const d = data;
  const dl = (n: number | null | undefined) => (n === null || n === undefined ? undefined : n);
  const maxCountry = d ? Math.max(0, ...d.countries.map((c) => c.share)) : 0;
  const maxSource = d ? Math.max(0, ...d.sources.map((s) => s.share)) : 0;
  const maxPage = d ? Math.max(1, ...d.pages.map((p) => p.views)) : 1;
  const unitText = d?.unit === "heure" ? "Heure par heure" : d?.unit === "mois" ? "Mois par mois" : "Jour par jour";

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        title="Statistiques"
        description="Qui visite la boutique, d'où et sur quelles pages. Choisissez la période à afficher."
        actions={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-akua-red/25 bg-akua-red/5 px-4 py-3 text-[13.5px]">
          <p>Les statistiques n&apos;ont pas pu être chargées.</p>
          <button type="button" onClick={() => reload()} className="inline-flex items-center gap-1.5 font-semibold text-akua-blue">
            <RefreshCw aria-hidden className="size-4" /> Réessayer
          </button>
        </div>
      )}

      <LivePanel />

      {d?.demo && (
        <DemoNotice>
          Aucune visite n&apos;a encore été enregistrée : voici un exemple. Le compteur est déjà actif sur le site, les vrais chiffres remplaceront l&apos;exemple automatiquement.
        </DemoNotice>
      )}
      {d && (
        <p className="-mt-1 flex items-center gap-2 text-[13px] text-akua-gray-500">
          <CalendarRange aria-hidden className="size-4" strokeWidth={1.8} />
          Analyse : {rangeText} · {period.kind === "range" ? rangeLabel(period.from, period.to) : `du ${fRange.format(d.from)} au ${fRange.format(d.to - 1)}`}
        </p>
      )}

      {!d ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[132px]" />
            ))}
          </div>
          <Skeleton className="h-[340px]" />
        </>
      ) : (
        <div className={cn("flex flex-col gap-5 transition-opacity duration-300 md:gap-6", (loading || !fresh) && "pointer-events-none opacity-55")}>
          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <StatTile icon={Users} label="Visiteurs" value={formatNumber(d.totals.visitors)} delta={dl(d.delta.visitors)} hint={hint} />
            <StatTile icon={MousePointer2} label="Visites" value={formatNumber(d.totals.sessions)} delta={dl(d.delta.sessions)} hint={hint} />
            <StatTile icon={Eye} label="Pages vues" value={formatNumber(d.totals.pageviews)} delta={dl(d.delta.pageviews)} hint={hint} />
            <StatTile icon={ShoppingBag} label="Taux de commande" value={`${d.conversion.toLocaleString("fr-FR")} %`} hint={`${formatNumber(d.totals.orders)} commande${d.totals.orders > 1 ? "s" : ""} WhatsApp`} />
          </div>

          <Panel
            title={metric === "visitors" ? "Visiteurs" : "Pages vues"}
            description={unitText}
            action={
              <div role="tablist" aria-label="Mesure" className="flex shrink-0 rounded-full bg-akua-page p-1">
                {(
                  [
                    ["visitors", "Visiteurs"],
                    ["pageviews", "Pages vues"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={metric === id}
                    onClick={() => setMetric(id)}
                    className={cn("h-8 rounded-full px-3 text-[12.5px] font-semibold transition-colors", metric === id ? "bg-akua-white text-akua-ink shadow-sm" : "text-akua-gray-500 hover:text-akua-ink")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
            bodyClassName="pt-4 pr-3 pl-1 md:pr-4 md:pl-2"
          >
            <VisitsChart data={d.series.map((s) => ({ label: s.label, full: s.full, visitors: s[metric] }))} unit={metric === "visitors" ? "visiteurs" : "pages vues"} />
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Pays des visiteurs" description="Part des visiteurs par pays">
              {d.countries.length ? (
                <ul className="flex flex-col gap-3.5">
                  {d.countries.slice(0, 8).map((c) => (
                    <Row
                      key={c.code || "inconnu"}
                      share={c.share}
                      max={maxCountry}
                      value={formatNumber(c.visitors)}
                      label={
                        <>
                          {FLAGS.has(c.code) ? <Flag code={c.code} /> : <Globe2 aria-hidden className="size-4 shrink-0 text-akua-gray-500" strokeWidth={1.8} />}
                          <span className="truncate">{c.name}</span>
                        </>
                      }
                    />
                  ))}
                </ul>
              ) : (
                <Empty>Aucune visite sur cette période.</Empty>
              )}
              {d.countries.some((c) => !c.code) && !d.demo && (
                <p className="mt-4 text-[12px] text-akua-gray-500">Le pays est fourni par l&apos;hébergeur : il s&apos;affichera une fois le site en ligne. En test sur votre ordinateur, il reste « non déterminé ».</p>
              )}
            </Panel>

            <Panel title="Provenance" description="Par où les visiteurs arrivent sur le site">
              {d.sources.length ? (
                <ul className="flex flex-col gap-3.5">
                  {d.sources.map((s) => (
                    <Row
                      key={s.id}
                      share={s.share}
                      max={maxSource}
                      value={`${formatNumber(s.sessions)} ${s.sessions > 1 ? "visites" : "visite"}`}
                      label={
                        <>
                          <SourceIcon id={s.id} />
                          <span className="truncate">{s.name}</span>
                        </>
                      }
                    />
                  ))}
                </ul>
              ) : (
                <Empty>Aucune visite sur cette période.</Empty>
              )}
              <p className="mt-4 text-[12px] text-akua-gray-500">« Accès direct » : adresse tapée, favori enregistré, ou application qui ne transmet pas sa provenance.</p>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] [&>*]:min-w-0">
            <Panel title="Heures d'affluence" description="Pages vues selon l'heure de la journée (heure de Lomé)">
              <HoursChart hours={d.hours} />
            </Panel>
            <Panel title="Fidélité" description="Premiers passages et visiteurs qui reviennent">
              <Audience fresh={d.audience.fresh} returning={d.audience.returning} depth={d.totals.depth} />
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] [&>*]:min-w-0">
            <Panel title="Pages les plus vues" description={`Top ${Math.min(8, d.pages.length) || 8} sur la période`} bodyClassName="px-3 pb-3 pt-3 md:px-4">
              {d.pages.length ? (
                <ol className="flex flex-col">
                  {d.pages.map((p, i) => (
                    <li key={p.path}>
                      <a href={p.path} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-[16px] p-2 transition-colors hover:bg-akua-page">
                        <span className="w-4 shrink-0 text-center text-[12.5px] font-bold text-akua-gray-500 tabular-nums">{i + 1}</span>
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-akua-page group-hover:bg-akua-white">
                          {p.kind === "produit" ? <Package aria-hidden className="size-[18px] text-akua-ink" strokeWidth={1.6} /> : <FileText aria-hidden className="size-[18px] text-akua-ink" strokeWidth={1.6} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-semibold">{p.label}</span>
                          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-akua-page group-hover:bg-akua-white">
                            <span className="block h-full rounded-full bg-akua-blue/70" style={{ width: `${(p.views / maxPage) * 100}%` }} />
                          </span>
                        </span>
                        <span className="w-16 shrink-0 text-right text-[13px] font-semibold tabular-nums">{formatNumber(p.views)}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-2">
                  <Empty>Aucune page vue sur cette période.</Empty>
                </div>
              )}
            </Panel>

            <Panel title="Appareils" description="Sur quoi vos visiteurs naviguent">
              <div className="flex h-3 overflow-hidden rounded-full bg-akua-page" aria-hidden>
                {d.devices.map((x, i) => (
                  <div key={x.id} className={cn("h-full", ["bg-akua-blue", "bg-akua-ink", "bg-akua-gray-500"][i])} style={{ width: `${x.share}%` }} />
                ))}
              </div>
              <ul className="mt-5 flex flex-col gap-3">
                {d.devices.map((x, i) => {
                  const Icon = x.id === "mobile" ? Smartphone : x.id === "desktop" ? Monitor : Tablet;
                  return (
                    <li key={x.id} className="flex items-center gap-3 text-[13.5px]">
                      <span className={cn("size-2.5 shrink-0 rounded-full", ["bg-akua-blue", "bg-akua-ink", "bg-akua-gray-500"][i])} />
                      <Icon aria-hidden className="size-4 shrink-0 text-akua-gray-500" strokeWidth={1.8} />
                      <span className="flex-1 font-medium">{x.id === "mobile" ? "Téléphone" : x.id === "desktop" ? "Ordinateur" : "Tablette"}</span>
                      <span className="text-[12.5px] text-akua-gray-500 tabular-nums">{formatNumber(x.visitors)}</span>
                      <span className="w-12 text-right font-semibold tabular-nums">{x.share.toLocaleString("fr-FR")} %</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 flex items-start gap-2 rounded-[16px] bg-akua-page px-3.5 py-3 text-[12.5px] text-akua-gray-500">
                <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
                Les visites sont anonymes : aucun nom, numéro ni adresse n&apos;est enregistré.
              </p>
            </Panel>
          </div>

          <TrackingLinks />
        </div>
      )}
    </div>
  );
}

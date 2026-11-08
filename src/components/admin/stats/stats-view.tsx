"use client";

import { Check, Copy, Eye, FileText, Ghost, Globe, Globe2, Layers, Monitor, MousePointer2, Package, Radio, RefreshCw, Search, ShieldCheck, Smartphone, Tablet, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DemoNotice, formatNumber, PageHeader, Panel, StatTile } from "@/components/admin/ui";
import { FacebookIcon, InstagramIcon, TikTokIcon, XIcon, YouTubeIcon } from "@/components/ui/social-icons";
import { Flag } from "@/components/ui/flag";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { SITE_URL } from "@/config/site";
import type { StatsPeriod, StatsResult } from "@/lib/analytics/aggregate";
import type { SourceId } from "@/lib/analytics/sources";
import { cn } from "@/lib/utils";
import { useAdmin } from "../actor-context";
import { VisitsChart } from "../visits-chart";

const PERIODS: { id: StatsPeriod; label: string; hint: string; range: string }[] = [
  { id: "jour", label: "Jour", hint: "vs les 24 h précédentes", range: "24 dernières heures" },
  { id: "semaine", label: "Semaine", hint: "vs semaine précédente", range: "7 derniers jours" },
  { id: "mois", label: "Mois", hint: "vs mois précédent", range: "30 derniers jours" },
  { id: "annee", label: "Année", hint: "vs année précédente", range: "12 derniers mois" },
];

const FLAGS = new Set(["TG", "BJ", "GH", "BF", "CI", "NE", "ML"]);
const fRange = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });

function SourceIcon({ id }: { id: SourceId }) {
  const c = "size-4 shrink-0";
  switch (id) {
    case "whatsapp":
      return <WhatsAppIcon size={16} variant="color" />;
    case "tiktok":
      return <TikTokIcon className={c} />;
    case "facebook":
      return <FacebookIcon className={cn(c, "text-[#1877f2]")} />;
    case "instagram":
      return <InstagramIcon className={cn(c, "text-[#d62976]")} />;
    case "youtube":
      return <YouTubeIcon className={cn(c, "text-[#ff0000]")} />;
    case "x":
      return <XIcon className={c} />;
    case "snapchat":
      return <Ghost aria-hidden className={cn(c, "text-akua-ink")} strokeWidth={1.8} />;
    case "google":
    case "search":
      return <Search aria-hidden className={cn(c, "text-akua-ink")} strokeWidth={1.9} />;
    case "other":
      return <Globe aria-hidden className={cn(c, "text-akua-gray-500")} strokeWidth={1.8} />;
    default:
      return <MousePointer2 aria-hidden className={cn(c, "text-akua-gray-500")} strokeWidth={1.8} />;
  }
}

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

export function StatsView() {
  const { base } = useAdmin();
  const [period, setPeriod] = useState<StatsPeriod>("semaine");
  const [metric, setMetric] = useState<"visitors" | "pageviews">("visitors");
  const [data, setData] = useState<StatsResult | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (p: StatsPeriod) => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/api/stats?periode=${p}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        setData(await res.json());
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [base],
  );

  useEffect(() => {
    void load(period);
  }, [period, load]);

  // vraies visites : actualisation automatique chaque minute
  useEffect(() => {
    if (!data || data.demo) return;
    const id = setInterval(() => void load(period), 60_000);
    return () => clearInterval(id);
  }, [data, period, load]);

  const meta = PERIODS.find((p) => p.id === period)!;
  const d = data?.period === period ? data : null;
  const dl = (n: number | null | undefined) => (n === null || n === undefined ? undefined : n);
  const maxCountry = d ? Math.max(0, ...d.countries.map((c) => c.share)) : 0;
  const maxSource = d ? Math.max(0, ...d.sources.map((s) => s.share)) : 0;
  const maxPage = d ? Math.max(1, ...d.pages.map((p) => p.views)) : 1;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        title="Statistiques"
        description="Qui visite la boutique, d'où et sur quelles pages. Choisissez la période à afficher."
        actions={
          <div role="tablist" aria-label="Période" className="flex rounded-full bg-akua-white p-1 ring-1 ring-akua-gray-200">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={period === p.id}
                onClick={() => setPeriod(p.id)}
                className={cn("h-9 rounded-full px-3.5 text-[13.5px] font-semibold transition-colors sm:px-4", period === p.id ? "bg-akua-ink text-akua-white" : "text-akua-gray-500 hover:text-akua-ink")}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-akua-red/25 bg-akua-red/5 px-4 py-3 text-[13.5px]">
          <p>Les statistiques n&apos;ont pas pu être chargées.</p>
          <button type="button" onClick={() => load(period)} className="inline-flex items-center gap-1.5 font-semibold text-akua-blue">
            <RefreshCw aria-hidden className="size-4" /> Réessayer
          </button>
        </div>
      )}

      {d?.demo && (
        <DemoNotice>
          Aucune visite n&apos;a encore été enregistrée : voici un exemple. Le compteur est déjà actif sur le site, les vrais chiffres remplaceront l&apos;exemple automatiquement.
        </DemoNotice>
      )}
      {d && !d.demo && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[18px] bg-akua-white px-4 py-3 text-[13.5px] ring-1 ring-akua-gray-200">
          <span className="inline-flex items-center gap-2 font-semibold">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-akua-whatsapp opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-akua-whatsapp" />
            </span>
            Mesure en direct
          </span>
          <span className="inline-flex items-center gap-1.5 text-akua-gray-500">
            <Radio aria-hidden className="size-4" strokeWidth={1.8} />
            <span>
              <span className="font-semibold text-akua-ink tabular-nums">{d.live}</span> {d.live > 1 ? "visiteurs" : "visiteur"} en ce moment
            </span>
          </span>
          <span className="text-akua-gray-500 sm:ml-auto">
            {meta.range} · du {fRange.format(d.from)} au {fRange.format(d.to - 1)}
          </span>
        </div>
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
        <div className={cn("flex flex-col gap-5 transition-opacity md:gap-6", loading && "opacity-60")}>
          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <StatTile icon={Users} label="Visiteurs" value={formatNumber(d.totals.visitors)} delta={dl(d.delta.visitors)} hint={meta.hint} />
            <StatTile icon={MousePointer2} label="Visites" value={formatNumber(d.totals.sessions)} delta={dl(d.delta.sessions)} hint={meta.hint} />
            <StatTile icon={Eye} label="Pages vues" value={formatNumber(d.totals.pageviews)} delta={dl(d.delta.pageviews)} hint={meta.hint} />
            <StatTile icon={Layers} label="Pages par visite" value={d.totals.depth.toLocaleString("fr-FR")} delta={dl(d.delta.depth)} hint={meta.hint} />
          </div>

          <Panel
            title={metric === "visitors" ? "Visiteurs" : "Pages vues"}
            description={period === "jour" ? "Heure par heure, sur les 24 dernières heures" : period === "annee" ? "Mois par mois" : "Jour par jour"}
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

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
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

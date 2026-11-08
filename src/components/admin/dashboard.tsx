"use client";

import { ArrowRight, Eye, Globe2, Heart, MessageCircle, Package, PanelsTopLeft, ShoppingBag, Star, TicketPercent, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Flag } from "@/components/ui/flag";
import { ADMIN_BASE } from "@/config/admin";
import { DEMO_REVIEW_ITEMS, DEMO_SAVED_CARTS, DEMO_TOP_FAVORITES, timeAgo } from "@/lib/admin/demo";
import { formatFCFA } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { useReviews } from "@/store/reviews";
import { useSavedCarts } from "@/store/saved-carts";
import { MemberAvatar } from "./activity-feed";
import { type PeriodValue, PeriodFilter, PRESETS, periodBounds, periodHint, rangeLabel } from "./period-filter";
import { useStats } from "./stats/use-stats";
import { TeamActivityPanel } from "./team-activity-panel";
import { DemoNotice, formatNumber, PageHeader, Panel, StatTile } from "./ui";
import { useActivity } from "./use-activity";
import { useTeamMembers } from "./use-team-members";
import { VisitsChart } from "./visits-chart";

const QUICK = [
  { icon: Package, label: "Ajouter un produit", href: `${ADMIN_BASE}/produits/nouveau` },
  { icon: TicketPercent, label: "Créer un code promo", href: `${ADMIN_BASE}/codes-promo` },
  { icon: PanelsTopLeft, label: "Modifier l'accueil", href: `${ADMIN_BASE}/accueil` },
  { icon: UserPlus, label: "Ajouter un équipier", href: `${ADMIN_BASE}/equipe` },
];

const FLAGS = new Set(["TG", "BJ", "GH", "BF", "CI", "NE", "ML"]);

/** Barres horizontales (part en %) : une seule couleur, valeur écrite à droite. */
function ShareBars({ rows }: { rows: { key: string; label: React.ReactNode; share: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.share));
  if (!rows.length) return <p className="rounded-[16px] bg-akua-page px-4 py-6 text-center text-[13.5px] text-akua-gray-500">Aucune visite sur cette période.</p>;
  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-center justify-between gap-3 text-[13.5px]">
            <span className="flex min-w-0 items-center gap-2 font-medium">{r.label}</span>
            <span className="font-semibold tabular-nums">{r.share.toLocaleString("fr-FR")} %</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-akua-page">
            <div className="h-full rounded-full bg-akua-blue transition-[width] duration-500" style={{ width: `${(r.share / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const SeeAll = ({ href, label = "Tout voir" }: { href: string; label?: string }) => (
  <Link href={href} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-akua-blue transition-colors hover:bg-akua-blue-100">
    {label} <ArrowRight aria-hidden className="size-3.5" />
  </Link>
);

function greeting() {
  const h = new Date().getHours();
  return h < 18 ? "Bonjour" : "Bonsoir";
}

export function Dashboard() {
  const hydrated = useHydrated();
  const [period, setPeriod] = useState<PeriodValue>({ kind: "preset", id: "mois" });
  const [metric, setMetric] = useState<"visitors" | "pageviews" | "orders">("visitors");
  const { data: d, fresh, loading } = useStats(period);
  const activity = useActivity();
  const members = useTeamMembers();
  const realCarts = useSavedCarts((s) => s.carts);
  const realReviews = useReviews((s) => s.reviews);
  const products = useAdminCatalog((s) => s.products);

  const { from, to } = periodBounds(period);
  const inRange = (iso: string | Date) => {
    const t = typeof iso === "string" ? Date.parse(iso) : iso.getTime();
    return t >= from && t < to;
  };
  const hint = periodHint(period);
  const periodText = period.kind === "preset" ? PRESETS.find((p) => p.id === period.id)!.range.toLowerCase() : rangeLabel(period.from, period.to);

  const carts = useMemo(() => [...(hydrated ? realCarts : []), ...DEMO_SAVED_CARTS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [hydrated, realCarts]);
  const reviews = useMemo(() => [...(hydrated ? realReviews : []), ...DEMO_REVIEW_ITEMS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [hydrated, realReviews]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openCarts = useMemo(() => carts.filter((c) => (c.status === "pending" || c.status === "contacted") && inRange(c.savedAt)), [carts, from, to]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const periodActivity = useMemo(() => activity.filter((e) => inRange(e.at)), [activity, from, to]);
  const teamList = useMemo(() => members.map((m) => ({ id: m.id, name: m.name, lastSeen: m.lastSeen })), [members]);

  const dl = (n: number | null | undefined) => (n === null || n === undefined ? undefined : n);
  const unitText = d?.unit === "heure" ? "heure par heure" : d?.unit === "mois" ? "mois par mois" : "jour par jour";
  const metricLabel = { visitors: "Visiteurs", pageviews: "Pages vues", orders: "Commandes" }[metric];

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title={`${greeting()} et bienvenue.`} description="Voici l'activité de votre boutique. Choisissez une période, ou des dates précises dans le calendrier." actions={<PeriodFilter value={period} onChange={setPeriod} />} />

      {d?.demo && <DemoNotice>Aucune visite n&apos;a encore été enregistrée : les visites, pays et provenances affichés sont un exemple. Ils seront remplacés automatiquement par les vrais chiffres.</DemoNotice>}

      <div className={cn("flex flex-col gap-5 transition-opacity duration-300 md:gap-6", (loading || !fresh) && d && "opacity-60")}>
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          <StatTile icon={Users} label="Visiteurs" value={d ? formatNumber(d.totals.visitors) : "–"} delta={dl(d?.delta.visitors)} hint={hint} />
          <StatTile icon={Eye} label="Pages vues" value={d ? formatNumber(d.totals.pageviews) : "–"} delta={dl(d?.delta.pageviews)} hint={hint} />
          <StatTile icon={MessageCircle} label="Commandes WhatsApp" value={d ? formatNumber(d.totals.orders) : "–"} delta={dl(d?.delta.orders)} hint={hint} />
          <StatTile icon={ShoppingBag} label="Paniers à relancer" value={formatNumber(openCarts.length)} hint="enregistrés sur la période" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] [&>*]:min-w-0">
          <Panel
            title={metricLabel}
            description={`Évolution ${unitText}`}
            action={
              <div role="tablist" aria-label="Mesure" className="flex shrink-0 rounded-full bg-akua-page p-1">
                {(
                  [
                    ["visitors", "Visiteurs"],
                    ["pageviews", "Pages"],
                    ["orders", "Commandes"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={metric === id}
                    onClick={() => setMetric(id)}
                    className={cn("h-8 rounded-full px-2.5 text-[12.5px] font-semibold transition-all sm:px-3", metric === id ? "bg-akua-white text-akua-ink shadow-[0_2px_8px_-2px_rgb(11_16_32/0.18)]" : "text-akua-gray-500 hover:text-akua-ink")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
            bodyClassName="pt-4 pr-3 pl-1 md:pr-4 md:pl-2"
          >
            {d ? <VisitsChart data={d.series.map((s) => ({ label: s.label, full: s.full, visitors: s[metric] }))} unit={metricLabel.toLowerCase()} /> : <div className="h-[260px] animate-pulse rounded-[18px] bg-akua-page" />}
          </Panel>
          <Panel title="Pays des visiteurs" description="D'où viennent vos visiteurs" action={<SeeAll href={`${ADMIN_BASE}/statistiques`} label="Détails" />}>
            <ShareBars
              rows={(d?.countries ?? []).slice(0, 6).map((c) => ({
                key: c.code || "x",
                share: c.share,
                label: (
                  <>
                    {FLAGS.has(c.code) ? <Flag code={c.code} /> : <Globe2 aria-hidden className="size-4 text-akua-gray-500" />}
                    <span className="truncate">{c.name}</span>
                  </>
                ),
              }))}
            />
          </Panel>
        </div>
      </div>

      <TeamActivityPanel entries={periodActivity} members={teamList} href={`${ADMIN_BASE}/activite`} periodText={periodText} />

      <div className="grid gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <Panel title="Provenance" description="Comment les visiteurs arrivent sur le site" action={<SeeAll href={`${ADMIN_BASE}/statistiques`} label="Détails" />}>
          <ShareBars rows={(d?.sources ?? []).slice(0, 6).map((s) => ({ key: s.id, share: s.share, label: s.name }))} />
        </Panel>

        <Panel title="Les plus ajoutés aux favoris" action={<SeeAll href={`${ADMIN_BASE}/favoris`} />} bodyClassName="px-3 pb-3 pt-3 md:px-4">
          <ol className="flex flex-col">
            {DEMO_TOP_FAVORITES.map(({ product, count }, i) => {
              const p = products.find((x) => x.id === product.id) ?? product;
              return (
                <li key={p.id}>
                  <Link href={`/produit/${p.slug}`} target="_blank" className="flex items-center gap-3 rounded-[16px] p-2 transition-colors hover:bg-akua-page">
                    <span className="w-4 shrink-0 text-center text-[12.5px] font-bold text-akua-gray-500 tabular-nums">{i + 1}</span>
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-akua-tile">
                      <Image src={p.images[0]} alt="" fill sizes="44px" className="object-contain p-1" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{p.name}</span>
                    <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold tabular-nums">
                      <Heart aria-hidden className="size-3.5 fill-akua-red text-akua-red" /> {count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel title="Actions rapides">
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK.map((q) => (
              <Link key={q.label} href={q.href} className="group flex min-h-[108px] flex-col justify-between rounded-[20px] border border-transparent bg-akua-page p-4 transition-all hover:-translate-y-0.5 hover:border-akua-blue/25 hover:bg-akua-blue-100/70">
                <span className="grid size-10 place-items-center rounded-[12px] bg-akua-white shadow-[0_1px_2px_rgb(11_16_32/0.06)]">
                  <q.icon aria-hidden className="size-5 text-akua-ink transition-colors group-hover:text-akua-blue" strokeWidth={1.6} />
                </span>
                <span className="text-[13.5px] leading-tight font-semibold">{q.label}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <Panel title="Derniers avis" action={<SeeAll href={`${ADMIN_BASE}/avis`} />} bodyClassName="pt-3">
          <ul className="divide-y divide-akua-gray-200">
            {reviews.slice(0, 4).map((r) => {
              const p = products.find((x) => x.id === r.productId);
              const name = `${r.firstName} ${r.lastName}`.trim();
              return (
                <li key={r.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                  <MemberAvatar id={r.id} name={name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-[14px] font-semibold">
                        {name} <span className="font-normal text-akua-gray-500">· {r.country}</span>
                      </p>
                      <span className="flex shrink-0 items-center gap-0.5" aria-label={`${r.rating} sur 5`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} aria-hidden className={cn("size-3.5", i < r.rating ? "fill-akua-gold text-akua-gold" : "fill-akua-gray-200 text-akua-gray-200")} />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13.5px] text-akua-gray-500">{r.comment}</p>
                    <p className="mt-1.5 text-[12px] text-akua-gray-500">
                      {p && (
                        <>
                          Sur <span className="font-semibold text-akua-ink">{p.name}</span> ·{" "}
                        </>
                      )}
                      {timeAgo(new Date(r.createdAt))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Paniers à relancer" description="Clients qui ont enregistré un panier sans envoyer la commande" action={<SeeAll href={`${ADMIN_BASE}/paniers`} />} bodyClassName="pt-3">
          {openCarts.length ? (
            <ul className="divide-y divide-akua-gray-200">
              {openCarts.slice(0, 4).map((c) => {
                const n = c.items.reduce((s, x) => s + x.quantity, 0);
                return (
                  <li key={c.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                    <MemberAvatar id={c.id} name={c.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{c.name}</p>
                      <p className="text-[12.5px] text-akua-gray-500 tabular-nums">
                        {c.phone} · {n} article{n > 1 ? "s" : ""} · {timeAgo(new Date(c.savedAt))}
                      </p>
                    </div>
                    <span className="hidden shrink-0 text-[14px] font-bold tabular-nums sm:block">{formatFCFA(c.subtotal)}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-[16px] bg-akua-page px-4 py-6 text-center text-[13.5px] text-akua-gray-500">Aucun panier à relancer sur cette période.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

"use client";

import { ArrowRight, Eye, Globe2, Heart, MessageCircle, Package, PanelsTopLeft, ShoppingBag, Star, TicketPercent, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Flag } from "@/components/ui/flag";
import { ADMIN_BASE } from "@/config/admin";
import { DEMO_CARTS, DEMO_COUNTRIES, DEMO_KPIS, DEMO_REVIEWS, DEMO_SOURCES, DEMO_TEAM, DEMO_TOP_FAVORITES, demoVisits, type Period, timeAgo } from "@/lib/admin/demo";
import { ActivityFeed } from "./activity-feed";
import { useActivity } from "./use-activity";
import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DemoChip, DemoNotice, formatNumber, PageHeader, Panel, StatTile } from "./ui";
import { VisitsChart } from "./visits-chart";

const PERIODS: { id: Period; label: string; hint: string }[] = [
  { id: "7j", label: "7 jours", hint: "vs 7 jours précédents" },
  { id: "30j", label: "30 jours", hint: "vs 30 jours précédents" },
  { id: "12m", label: "12 mois", hint: "vs 12 mois précédents" },
];

const QUICK = [
  { icon: Package, label: "Ajouter un produit", href: `${ADMIN_BASE}/produits` },
  { icon: TicketPercent, label: "Créer un code promo", href: `${ADMIN_BASE}/codes-promo` },
  { icon: PanelsTopLeft, label: "Modifier l'accueil", href: `${ADMIN_BASE}/accueil` },
  { icon: Users, label: "Ajouter un équipier", href: `${ADMIN_BASE}/equipe` },
];

/** Barres horizontales (part en %) : une seule couleur, valeur écrite à droite. */
function ShareBars({ rows }: { rows: { key: string; label: React.ReactNode; share: number }[] }) {
  const max = Math.max(...rows.map((r) => r.share));
  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-center justify-between gap-3 text-[13.5px]">
            <span className="flex min-w-0 items-center gap-2 font-medium">{r.label}</span>
            <span className="font-semibold tabular-nums">{r.share} %</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-akua-page" title={`${r.share} %`}>
            <div className="h-full rounded-full bg-akua-blue" style={{ width: `${(r.share / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 18 ? "Bonjour" : "Bonsoir";
}

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("30j");
  const activity = useActivity();
  const data = useMemo(() => demoVisits(period), [period]);
  const k = DEMO_KPIS[period];
  const hint = PERIODS.find((p) => p.id === period)!.hint;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        title={`${greeting()} et bienvenue.`}
        description="Voici l'activité de votre boutique. Choisissez une période pour comparer."
        actions={
          <div role="tablist" aria-label="Période" className="flex rounded-full bg-akua-white p-1 ring-1 ring-akua-gray-200">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={period === p.id}
                onClick={() => setPeriod(p.id)}
                className={cn("h-9 rounded-full px-4 text-[13.5px] font-semibold transition-colors", period === p.id ? "bg-akua-ink text-akua-white" : "text-akua-gray-500 hover:text-akua-ink")}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <DemoNotice />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatTile icon={Users} label="Visiteurs" value={formatNumber(k.visitors)} delta={k.delta.visitors} hint={hint} />
        <StatTile icon={Eye} label="Pages vues" value={formatNumber(k.pageviews)} delta={k.delta.pageviews} hint={hint} />
        <StatTile icon={MessageCircle} label="Commandes WhatsApp" value={formatNumber(k.orders)} delta={k.delta.orders} hint={hint} />
        <StatTile icon={ShoppingBag} label="Paniers non finalisés" value={formatNumber(k.carts)} delta={k.delta.carts} hint={hint} invert />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <Panel title="Visiteurs" description="Nombre de visiteurs uniques sur la période" action={<DemoChip />} bodyClassName="pt-4 pr-3 pl-1 md:pr-4 md:pl-2">
          <VisitsChart data={data} />
        </Panel>
        <Panel title="Pays des visiteurs" description="D'où viennent vos visiteurs" action={<DemoChip />}>
          <ShareBars
            rows={DEMO_COUNTRIES.map((c) => ({
              key: c.name,
              share: c.share,
              label: (
                <>
                  {c.code ? <Flag code={c.code} /> : <Globe2 aria-hidden className="size-4 text-akua-gray-500" />}
                  <span className="truncate">{c.name}</span>
                </>
              ),
            }))}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Provenance" description="Comment les visiteurs arrivent sur le site" action={<DemoChip />}>
          <ShareBars rows={DEMO_SOURCES.map((s) => ({ key: s.id, share: s.share, label: s.name }))} />
        </Panel>

        <Panel title="Les plus ajoutés aux favoris" action={<DemoChip />} bodyClassName="px-3 pb-3 pt-3 md:px-4">
          <ol className="flex flex-col">
            {DEMO_TOP_FAVORITES.map(({ product, count }, i) => (
              <li key={product.id}>
                <Link href={`/produit/${product.slug}`} target="_blank" className="flex items-center gap-3 rounded-[16px] p-2 transition-colors hover:bg-akua-page">
                  <span className="w-4 shrink-0 text-center text-[12.5px] font-bold text-akua-gray-500 tabular-nums">{i + 1}</span>
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-akua-tile">
                    <Image src={product.images[0]} alt="" fill sizes="44px" className="object-contain p-1" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{product.name}</span>
                  <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold tabular-nums">
                    <Heart aria-hidden className="size-3.5 fill-akua-red text-akua-red" /> {count}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="Actions rapides">
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className="group flex min-h-[104px] flex-col justify-between rounded-[18px] bg-akua-page p-4 transition-colors hover:bg-akua-blue-100"
              >
                <q.icon aria-hidden className="size-6 text-akua-ink transition-colors group-hover:text-akua-blue" strokeWidth={1.5} />
                <span className="text-[13.5px] leading-tight font-semibold">{q.label}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="Activité de l'équipe"
        description="Les dernières actions de vos équipiers"
        action={
          <Link href={`${ADMIN_BASE}/activite`} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-akua-blue">
            Tout voir <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        }
        bodyClassName="pt-4"
      >
        <ActivityFeed entries={activity.slice(0, 4)} members={DEMO_TEAM} grouped={false} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Derniers avis"
          action={
            <Link href={`${ADMIN_BASE}/avis`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-akua-blue">
              Tout voir <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          }
          bodyClassName="pt-3"
        >
          <ul className="divide-y divide-akua-gray-200">
            {DEMO_REVIEWS.map((r) => (
              <li key={r.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-[14px] font-semibold">
                    {r.name} <span className="font-normal text-akua-gray-500">· {r.country}</span>
                  </p>
                  <span className="flex shrink-0 items-center gap-0.5" aria-label={`${r.rating} sur 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} aria-hidden className={cn("size-3.5", i < r.rating ? "fill-akua-gold text-akua-gold" : "fill-akua-gray-200 text-akua-gray-200")} />
                    ))}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[13.5px] text-akua-gray-500">{r.comment}</p>
                <p className="mt-1.5 text-[12px] text-akua-gray-500">
                  Sur <span className="font-semibold text-akua-ink">{r.product.name}</span> · {timeAgo(r.at)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Paniers à relancer"
          description="Clients qui ont enregistré un panier sans envoyer la commande"
          action={
            <Link href={`${ADMIN_BASE}/paniers`} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-akua-blue">
              Tout voir <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          }
          bodyClassName="pt-3"
        >
          <ul className="divide-y divide-akua-gray-200">
            {DEMO_CARTS.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-akua-page text-[13px] font-bold">
                  {c.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{c.name}</p>
                  <p className="text-[12.5px] text-akua-gray-500 tabular-nums">
                    {c.phone} · {c.items} article{c.items > 1 ? "s" : ""} · {timeAgo(c.at)}
                  </p>
                </div>
                <span className="hidden shrink-0 text-[14px] font-bold tabular-nums sm:block">{formatFCFA(c.total)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

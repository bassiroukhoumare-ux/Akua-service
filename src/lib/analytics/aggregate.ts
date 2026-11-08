// Calcul des statistiques à partir des visites (vraies ou d'exemple : même calcul pour les deux).
// Fuseau : Lomé = UTC+0, toutes les dates sont donc calculées en UTC.
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { Visit } from "./store";
import { type Device, SOURCE_LABEL, type SourceId } from "./sources";

export type StatsPeriod = "jour" | "semaine" | "mois" | "annee";
export const STATS_PERIODS: StatsPeriod[] = ["jour", "semaine", "mois", "annee"];

export interface StatsPoint {
  label: string;
  full: string;
  visitors: number;
  pageviews: number;
}

export interface StatsTotals {
  visitors: number;
  sessions: number;
  pageviews: number;
  /** pages vues par visite */
  depth: number;
}

export interface StatsResult {
  period: StatsPeriod;
  demo: boolean;
  /** visites enregistrées depuis le début (toutes périodes) */
  recorded: number;
  totals: StatsTotals;
  /** évolution en % par rapport à la période précédente (null si rien avant) */
  delta: Record<keyof StatsTotals, number | null>;
  series: StatsPoint[];
  countries: { code: string; name: string; visitors: number; share: number }[];
  sources: { id: SourceId; name: string; sessions: number; share: number }[];
  devices: { id: Device; visitors: number; share: number }[];
  pages: { path: string; label: string; kind: "produit" | "page"; views: number }[];
  /** visiteurs actifs ces 5 dernières minutes */
  live: number;
  from: number;
  to: number;
}

const HOUR = 36e5;
const DAY = 24 * HOUR;
const utc = { timeZone: "UTC" } as const;
const fDay = new Intl.DateTimeFormat("fr-FR", { ...utc, day: "numeric", month: "short" });
const fDayFull = new Intl.DateTimeFormat("fr-FR", { ...utc, weekday: "long", day: "numeric", month: "long" });
const fWeekday = new Intl.DateTimeFormat("fr-FR", { ...utc, weekday: "short" });
const fMonth = new Intl.DateTimeFormat("fr-FR", { ...utc, month: "short" });
const fMonthFull = new Intl.DateTimeFormat("fr-FR", { ...utc, month: "long", year: "numeric" });
const regions = new Intl.DisplayNames(["fr"], { type: "region" });
const clean = (s: string) => s.replace(".", "");

interface Bucket {
  start: number;
  end: number;
  label: string;
  full: string;
}

/** Découpage de la période en tranches (heures, jours ou mois) se terminant maintenant. */
export function buckets(period: StatsPeriod, now: number): Bucket[] {
  const d = new Date(now);
  if (period === "jour") {
    const h0 = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours()) - 23 * HOUR;
    return Array.from({ length: 24 }, (_, i) => {
      const start = h0 + i * HOUR;
      const h = new Date(start).getUTCHours();
      return { start, end: start + HOUR, label: `${h}h`, full: `${h}h – ${h + 1}h` };
    });
  }
  if (period === "annee") {
    return Array.from({ length: 12 }, (_, i) => {
      const start = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 11 + i, 1);
      const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 10 + i, 1);
      return { start, end, label: clean(fMonth.format(start)), full: fMonthFull.format(start) };
    });
  }
  const n = period === "semaine" ? 7 : 30;
  const today = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Array.from({ length: n }, (_, i) => {
    const start = today - (n - 1 - i) * DAY;
    return { start, end: start + DAY, label: clean(n === 7 ? fWeekday.format(start) : fDay.format(start)), full: fDayFull.format(start) };
  });
}

/** Début de la période précédente : pour comparer, on regarde la même durée juste avant. */
export function periodRange(period: StatsPeriod, now: number) {
  const b = buckets(period, now);
  const from = b[0].start;
  const to = b[b.length - 1].end;
  return { from, to, prevFrom: from - (to - from) };
}

function pageLabel(p: string): { label: string; kind: "produit" | "page" } {
  const prod = p.match(/^\/produit\/([^/]+)/);
  if (prod) {
    const found = products.find((x) => x.slug === prod[1]);
    return { label: found?.name ?? prod[1].replace(/-/g, " "), kind: "produit" };
  }
  const cat = p.match(/^\/boutique\/([^/]+)/);
  if (cat) return { label: `Rayon ${categories.find((c) => c.slug === cat[1])?.name ?? cat[1]}`, kind: "page" };
  const named: Record<string, string> = {
    "/": "Accueil",
    "/boutique": "Boutique",
    "/packs": "Packs",
    "/panier": "Panier",
    "/favoris": "Favoris",
    "/contact": "Contact",
    "/livraison": "Livraison",
    "/vente-en-gros": "Vente en gros",
    "/conditions-generales-de-vente": "Conditions de vente",
    "/politique-de-confidentialite": "Confidentialité",
  };
  return { label: named[p] ?? p, kind: "page" };
}

const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : null);
const share = (n: number, total: number) => (total ? Math.round((n / total) * 1000) / 10 : 0);

function totals(list: Visit[]): StatsTotals {
  const visitors = new Set(list.map((v) => v.v)).size;
  const sessions = new Set(list.map((v) => v.s)).size;
  return { visitors, sessions, pageviews: list.length, depth: sessions ? Math.round((list.length / sessions) * 10) / 10 : 0 };
}

export function aggregate(all: Visit[], period: StatsPeriod, now: number, demo: boolean): StatsResult {
  const b = buckets(period, now);
  const { from, to, prevFrom } = periodRange(period, now);
  const cur = all.filter((v) => v.t >= from && v.t < to);
  const prev = all.filter((v) => v.t >= prevFrom && v.t < from);
  const t = totals(cur);
  const p = totals(prev);

  // courbe : visiteurs uniques et pages vues par tranche
  const series: StatsPoint[] = b.map((x) => ({ label: x.label, full: x.full, visitors: 0, pageviews: 0 }));
  const seen = b.map(() => new Set<string>());
  for (const v of cur) {
    let i = b.length - 1;
    while (i > 0 && v.t < b[i].start) i--;
    series[i].pageviews++;
    seen[i].add(v.v);
  }
  seen.forEach((s, i) => (series[i].visitors = s.size));

  // pays (visiteurs uniques), appareils (visiteurs), provenance (visites)
  const byCountry = new Map<string, Set<string>>();
  const byDevice = new Map<Device, Set<string>>();
  const bySource = new Map<SourceId, Set<string>>();
  const byPage = new Map<string, number>();
  for (const v of cur) {
    (byCountry.get(v.c) ?? byCountry.set(v.c, new Set()).get(v.c)!).add(v.v);
    (byDevice.get(v.d) ?? byDevice.set(v.d, new Set()).get(v.d)!).add(v.v);
    (bySource.get(v.src) ?? bySource.set(v.src, new Set()).get(v.src)!).add(v.s);
    byPage.set(v.p, (byPage.get(v.p) ?? 0) + 1);
  }
  const countryTotal = [...byCountry.values()].reduce((a, s) => a + s.size, 0);
  const countries = [...byCountry.entries()]
    .map(([code, s]) => ({ code, name: code ? (regions.of(code) ?? code) : "Pays non déterminé", visitors: s.size, share: share(s.size, countryTotal) }))
    .sort((a, z) => (a.code === "" ? 1 : z.code === "" ? -1 : z.visitors - a.visitors));
  const sourceTotal = [...bySource.values()].reduce((a, s) => a + s.size, 0);
  const sources = [...bySource.entries()].map(([id, s]) => ({ id, name: SOURCE_LABEL[id], sessions: s.size, share: share(s.size, sourceTotal) })).sort((a, z) => z.sessions - a.sessions);
  const deviceTotal = [...byDevice.values()].reduce((a, s) => a + s.size, 0);
  const devices = (["mobile", "desktop", "tablet"] as Device[]).map((id) => ({ id, visitors: byDevice.get(id)?.size ?? 0, share: share(byDevice.get(id)?.size ?? 0, deviceTotal) }));
  const pages = [...byPage.entries()]
    .sort((a, z) => z[1] - a[1])
    .slice(0, 8)
    .map(([path, views]) => ({ path, views, ...pageLabel(path) }));

  return {
    period,
    demo,
    recorded: all.length,
    totals: t,
    delta: { visitors: pct(t.visitors, p.visitors), sessions: pct(t.sessions, p.sessions), pageviews: pct(t.pageviews, p.pageviews), depth: pct(t.depth, p.depth) },
    series,
    countries,
    sources,
    devices,
    pages,
    live: new Set(all.filter((v) => v.t >= now - 5 * 60_000).map((v) => v.v)).size,
    from,
    to,
  };
}

/* ----------------------------------------------------- visites d'exemple */

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}
const pick = <T,>(r: () => number, list: [T, number][]) => {
  let x = r() * list.reduce((a, [, w]) => a + w, 0);
  for (const [v, w] of list) if ((x -= w) < 0) return v;
  return list[list.length - 1][0];
};

/** Deux ans de visites fictives mais réalistes (mêmes chiffres à chaque affichage pour une même journée). */
export function demoVisits(now: number): Visit[] {
  const r = rng(2026);
  const out: Visit[] = [];
  const today = Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate());
  const COUNTRIES: [string, number][] = [["TG", 58], ["BJ", 14], ["CI", 9], ["GH", 7], ["BF", 5], ["NE", 2], ["ML", 1.5], ["FR", 2], ["NG", 1], ["SN", 0.5]];
  const SOURCES: [SourceId, number][] = [["whatsapp", 34], ["tiktok", 27], ["google", 18], ["facebook", 11], ["instagram", 3], ["direct", 6], ["other", 1]];
  const DEVICES: [Device, number][] = [["mobile", 82], ["desktop", 15], ["tablet", 3]];
  const PAGES: [string, number][] = [["/", 30], ["/boutique", 14], ["/packs", 7], ["/panier", 6], ["/contact", 3], ["/vente-en-gros", 2], ...products.slice(0, 10).map((x, i): [string, number] => [`/produit/${x.slug}`, 9 - i * 0.7])];
  // habitués : un tiers des visites vient de visiteurs déjà venus
  const regulars = Array.from({ length: 400 }, (_, i) => `demo${i.toString(36).padStart(4, "0")}`);
  for (let day = 730; day >= 0; day--) {
    const start = today - day * DAY;
    const wd = new Date(start).getUTCDay();
    const growth = 0.45 + 0.55 * ((730 - day) / 730);
    const sessions = Math.round((70 + r() * 40 + (wd === 0 || wd === 6 ? 30 : 0)) * growth);
    for (let i = 0; i < sessions; i++) {
      // pic d'affluence 12h–14h et 19h–22h
      const hour = pick(r, [[8, 2], [9, 3], [10, 4], [11, 5], [12, 7], [13, 7], [14, 5], [15, 4], [16, 4], [17, 5], [18, 6], [19, 8], [20, 9], [21, 8], [22, 5], [23, 2], [7, 1]]);
      const t0 = start + hour * HOUR + Math.floor(r() * HOUR);
      if (t0 > now) continue;
      const v = r() < 0.33 ? regulars[Math.floor(r() * regulars.length)] : `demo${day}x${i}`;
      const s = `demo${day}s${i}`;
      const c = pick(r, COUNTRIES);
      const src = pick(r, SOURCES);
      const d = pick(r, DEVICES);
      const depth = 1 + Math.floor(r() * r() * 7);
      for (let k = 0; k < depth; k++) {
        const t = t0 + k * 45_000;
        if (t <= now) out.push({ t, v, s, p: k === 0 && r() < 0.5 ? "/" : pick(r, PAGES), src, c, d });
      }
    }
  }
  return out;
}

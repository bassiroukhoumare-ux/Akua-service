import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { PortalKind } from "@/config/admin-base";
import { readSession, SESSION } from "@/lib/admin/session";
import { findMember } from "@/lib/admin/team-auth";
import { aggregate, demoVisits, periodRange, STATS_PERIODS, type StatsPeriod, type StatsRange } from "./aggregate";
import { readVisits } from "./store";

// exemple recalculé une fois par heure au plus
let demoCache: { hour: number; list: ReturnType<typeof demoVisits> } | null = null;
function demo(now: number) {
  const hour = Math.floor(now / 36e5);
  if (!demoCache || demoCache.hour !== hour) demoCache = { hour, list: demoVisits(now) };
  return demoCache.list;
}

/** Statistiques d'une période : vraies visites dès qu'il y en a, sinon exemple. */
export async function statsHandler(req: NextRequest, kind: PortalKind) {
  const user = await readSession(kind, (await cookies()).get(SESSION[kind].cookie)?.value);
  const allowed = kind === "owner" ? !!user : !!user && !!(await findMember(user))?.modules.includes("stats");
  if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const q = sp.get("periode");
  const now = Date.now();
  // période choisie dans le calendrier : du=AAAA-MM-JJ&au=AAAA-MM-JJ (jours inclus, heure de Lomé = UTC)
  const day = (s: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? Date.parse(`${s}T00:00:00Z`) : NaN);
  const du = day(sp.get("du"));
  const au = day(sp.get("au"));
  let range: StatsRange | null = null;
  if (!Number.isNaN(du) && !Number.isNaN(au)) {
    const from = Math.min(du, au);
    const to = Math.max(du, au) + 864e5;
    if (to - from > 3 * 366 * 864e5) return NextResponse.json({ error: "Période trop longue (3 ans maximum)." }, { status: 400 });
    range = { from, to };
  }
  const period: StatsPeriod = STATS_PERIODS.includes(q as StatsPeriod) ? (q as StatsPeriod) : "semaine";
  const since = Math.min(periodRange("annee", now).prevFrom, range ? range.from - (range.to - range.from) : Infinity);
  const real = await readVisits(since);
  const sel = range ?? period;
  const result = real.length ? aggregate(real, sel, now, false) : aggregate(demo(now), sel, now, true);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

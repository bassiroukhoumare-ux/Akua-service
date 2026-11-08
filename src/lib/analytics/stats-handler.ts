import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { PortalKind } from "@/config/admin-base";
import { readSession, SESSION } from "@/lib/admin/session";
import { findMember } from "@/lib/admin/team-auth";
import { aggregate, demoVisits, periodRange, STATS_PERIODS, type StatsPeriod } from "./aggregate";
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
  const allowed = kind === "owner" ? !!user : !!user && !!findMember(user)?.modules.includes("stats");
  if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const q = req.nextUrl.searchParams.get("periode");
  const period: StatsPeriod = STATS_PERIODS.includes(q as StatsPeriod) ? (q as StatsPeriod) : "semaine";
  const now = Date.now();
  // on lit large (deux ans) pour savoir si de vraies visites existent et comparer avec l'année précédente
  const real = await readVisits(periodRange("annee", now).prevFrom);
  const result = real.length ? aggregate(real, period, now, false) : aggregate(demo(now), period, now, true);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

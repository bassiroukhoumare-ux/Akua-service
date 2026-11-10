// Pastilles « nouveau » de l'admin : ce qui est arrivé depuis la dernière ouverture de chaque onglet,
// pour chaque personne (propriétaire ou équipier), sur tous ses appareils.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AdminModuleId } from "@/config/admin";
import type { PortalKind } from "@/config/admin-base";
import { can, type Perms } from "@/config/permissions";
import { db } from "@/lib/db";
import { readSession, SESSION } from "./session";
import { findMember } from "./team-auth";

export const NOTIF_MODULES = ["orders", "reviews", "favorites", "carts", "activity"] as const;
export type NotifModule = (typeof NOTIF_MODULES)[number];

async function identity(kind: PortalKind): Promise<{ key: string; perms?: Perms; owner: boolean } | null> {
  const id = await readSession(kind, (await cookies()).get(SESSION[kind].cookie)?.value);
  if (!id) return null;
  if (kind === "owner") return { key: "owner", owner: true };
  const m = await findMember(id);
  return m && !m.mustChange ? { key: m.id, perms: m.perms, owner: false } : null;
}

export async function notificationsGet(kind: PortalKind) {
  const me = await identity(kind);
  if (!me) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const sql = db();
  // jamais ouvert : on compte les 7 derniers jours
  const seenRows = (await sql`select module, seen_at from admin_seen where user_key = ${me.key}`) as { module: string; seen_at: string | Date }[];
  const since = (m: NotifModule) => new Date(seenRows.find((r) => r.module === m)?.seen_at ?? Date.now() - 7 * 864e5).toISOString();
  const allowed = (m: NotifModule) => (m === "activity" ? me.owner : can(me.perms, m as AdminModuleId));
  const out: Partial<Record<NotifModule, number>> = {};
  const one = async (m: NotifModule, q: () => Promise<unknown[]>) => {
    if (!allowed(m)) return;
    const [r] = (await q()) as { n: number }[];
    out[m] = r?.n ?? 0;
  };
  await Promise.all([
    one("orders", () => sql`select count(*)::int as n from orders where created_at > ${since("orders")}`),
    one("reviews", () => sql`select count(*)::int as n from reviews where created_at > ${since("reviews")}`),
    one("favorites", () => sql`select count(*)::int as n from favorites where created_at > ${since("favorites")}`),
    one("carts", () => sql`select count(*)::int as n from saved_carts where updated_at > ${since("carts")} and status in ('pending', 'contacted')`),
    one("activity", () => sql`select count(*)::int as n from app_state, jsonb_array_elements(coalesce(value->'state'->'activity', '[]'::jsonb)) a where key = 'akua-admin-catalog' and (a->>'at')::timestamptz > ${since("activity")}`),
  ]);
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}

/** Onglet ouvert : sa pastille repart de zéro. */
export async function notificationsSeen(kind: PortalKind, req: Request) {
  const me = await identity(kind);
  if (!me) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { module } = (await req.json().catch(() => ({}))) as { module?: string };
  if (!NOTIF_MODULES.includes(module as NotifModule)) return NextResponse.json({ error: "Inconnu" }, { status: 400 });
  await db()`insert into admin_seen (user_key, module, seen_at) values (${me.key}, ${module}, now())
    on conflict (user_key, module) do update set seen_at = now()`;
  return NextResponse.json({ ok: true });
}

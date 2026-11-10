import { NextResponse } from "next/server";
import { portalUser } from "@/lib/admin/portal-user";
import { db } from "@/lib/db";
import { PUSH_KINDS, pushToOwner, vapidPublicKey } from "@/lib/push";

// Activation des notifications push sur un appareil du propriétaire.
export const dynamic = "force-dynamic";
const deny = () => NextResponse.json({ error: "Accès refusé" }, { status: 403 });
const cleanPrefs = (p: unknown) => Object.fromEntries(PUSH_KINDS.map((k) => [k, (p as Record<string, unknown> | undefined)?.[k] !== false]));

/** Clé publique + réglages de cet appareil (s'il est déjà inscrit). */
export async function GET(req: Request) {
  if (!(await portalUser("owner"))) return deny();
  const endpoint = new URL(req.url).searchParams.get("endpoint");
  const rows = endpoint ? ((await db()`select prefs from push_subscriptions where endpoint = ${endpoint}`) as { prefs: Record<string, boolean> }[]) : [];
  const [{ n }] = (await db()`select count(*)::int as n from push_subscriptions where user_key = 'owner'`) as { n: number }[];
  return NextResponse.json({ publicKey: vapidPublicKey(), subscribed: !!rows[0], prefs: rows[0]?.prefs ?? cleanPrefs({}), devices: n }, { headers: { "Cache-Control": "no-store" } });
}

/** Inscription de l'appareil (ou mise à jour de ses réglages), ou envoi d'un test. */
export async function POST(req: Request) {
  if (!(await portalUser("owner"))) return deny();
  const b = (await req.json().catch(() => ({}))) as { subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }; prefs?: unknown; test?: boolean; endpoint?: string };
  if (b.test) {
    const sent = await pushToOwner("test", { title: "Notifications activées", body: "Vous serez prévenu ici des nouvelles commandes, des avis et des paniers à relancer.", url: "/spaceakua", tag: "test" }, b.endpoint);
    return NextResponse.json({ sent });
  }
  const s = b.subscription;
  if (!s?.endpoint || !/^https:\/\//.test(s.endpoint) || !s.keys?.p256dh || !s.keys?.auth) return NextResponse.json({ error: "Abonnement invalide" }, { status: 400 });
  const prefs = cleanPrefs(b.prefs);
  await db()`insert into push_subscriptions (endpoint, user_key, keys, prefs, user_agent) values (${s.endpoint}, 'owner', ${JSON.stringify(s.keys)}, ${JSON.stringify(prefs)}, ${req.headers.get("user-agent")?.slice(0, 200) ?? null})
    on conflict (endpoint) do update set keys = excluded.keys, prefs = excluded.prefs, user_key = 'owner'`;
  return NextResponse.json({ ok: true, prefs });
}

/** Désactivation sur cet appareil. */
export async function DELETE(req: Request) {
  if (!(await portalUser("owner"))) return deny();
  const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (endpoint) await db()`delete from push_subscriptions where endpoint = ${endpoint}`;
  return NextResponse.json({ ok: true });
}

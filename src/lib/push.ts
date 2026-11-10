// Notifications push envoyées au téléphone (ou à l'ordinateur) du propriétaire.
// Chaque appareil activé est enregistré dans la base (table push_subscriptions).
import webpush from "web-push";
import { db } from "@/lib/db";

export type PushKind = "orders" | "reviews" | "carts" | "favorites" | "test";
export const PUSH_KINDS: Exclude<PushKind, "test">[] = ["orders", "reviews", "carts", "favorites"];

export interface PushPayload {
  title: string;
  body: string;
  /** page ouverte au toucher */
  url: string;
  /** regroupe les notifications du même type */
  tag?: string;
}

let ready = false;
function setup() {
  if (ready) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "https://akua-service.vercel.app", pub, priv);
  ready = true;
  return true;
}

export const vapidPublicKey = () => process.env.VAPID_PUBLIC_KEY ?? "";

type Row = { endpoint: string; keys: { p256dh: string; auth: string }; prefs: Partial<Record<PushKind, boolean>> };

/** Envoie une notification à tous les appareils du propriétaire qui l'ont acceptée. Renvoie le nombre d'envois réussis. */
export async function pushToOwner(kind: PushKind, payload: PushPayload, onlyEndpoint?: string): Promise<number> {
  if (!setup()) return 0;
  const rows = (onlyEndpoint
    ? await db()`select endpoint, keys, prefs from push_subscriptions where user_key = 'owner' and endpoint = ${onlyEndpoint}`
    : await db()`select endpoint, keys, prefs from push_subscriptions where user_key = 'owner'`) as Row[];
  let ok = 0;
  await Promise.all(
    rows
      .filter((r) => kind === "test" || r.prefs?.[kind] !== false)
      .map(async (r) => {
        try {
          await webpush.sendNotification({ endpoint: r.endpoint, keys: r.keys }, JSON.stringify(payload), { TTL: 60 * 60 * 24, urgency: kind === "orders" ? "high" : "normal" });
          ok++;
          await db()`update push_subscriptions set last_ok = now() where endpoint = ${r.endpoint}`;
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          // appareil désinscrit ou notifications retirées : on l'oublie
          if (code === 404 || code === 410) await db()`delete from push_subscriptions where endpoint = ${r.endpoint}`;
        }
      }),
  );
  return ok;
}

/** Coupe un texte proprement : « … » à la fin. */
export const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s);

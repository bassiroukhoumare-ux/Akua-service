// Sessions des deux portails : jeton signé (HMAC SHA-256) dans un cookie httpOnly.
// Propriétaire et équipiers ont chacun leur cookie, limité à l'adresse de leur portail :
// une session équipier n'ouvre jamais le portail du propriétaire, et inversement.
// Fonctionne côté serveur et dans le middleware (Web Crypto).
import { ADMIN_BASE, type PortalKind, TEAM_BASE } from "@/config/admin-base";

export const SESSION_DAYS = 7;
export const SESSION: Record<PortalKind, { cookie: string; path: string }> = {
  owner: { cookie: "akua_admin", path: ADMIN_BASE },
  team: { cookie: "akua_equipe", path: TEAM_BASE },
};
/** Identifiant interne du compte propriétaire (aucun identifiant à saisir : mot de passe seul). */
export const OWNER_ID = "proprietaire";

const enc = new TextEncoder();

async function key() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET manquant");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

async function sign(payload: string) {
  return b64url(await crypto.subtle.sign("HMAC", await key(), enc.encode(payload)));
}

/** comparaison à temps constant */
export function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSession(kind: PortalKind, user: string) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  const payload = `${kind}.${encodeURIComponent(user)}.${exp}`;
  return `${payload}.${await sign(payload)}`;
}

/** Renvoie l'identifiant si le jeton est valide, non expiré et émis pour ce portail. */
export async function readSession(kind: PortalKind, token?: string | null): Promise<string | null> {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const payload = token.slice(0, i);
  const [k, user, exp] = payload.split(".");
  if (k !== kind || !user || !exp || Number(exp) < Date.now()) return null;
  try {
    return same(token.slice(i + 1), await sign(payload)) ? decodeURIComponent(user) : null;
  } catch {
    return null;
  }
}

/** Propriétaire : vérifie uniquement le mot de passe. */
export function checkOwnerPassword(password: string) {
  const pw = process.env.ADMIN_PASSWORD ?? "";
  return !!pw && same(password, pw);
}

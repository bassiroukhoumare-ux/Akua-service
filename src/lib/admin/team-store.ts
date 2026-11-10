// Registre des équipiers, dans la base de données Neon (table team_members). Les mots de passe ne sont jamais stockés en clair (scrypt + sel).
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { AdminModuleId } from "@/config/admin";
import { type Perms, permsFromModules } from "@/config/permissions";
import { db } from "@/lib/db";
import type { MemberStatus } from "./demo";

export interface StoredMember {
  id: string;
  name: string;
  /** numéro WhatsApp (ou identifiant libre) */
  identifier: string;
  modules: AdminModuleId[];
  /** droits détaillés par module (voir, ajouter, modifier, supprimer…) */
  perms: Perms;
  status: MemberStatus;
  /** sel:empreinte */
  secret?: string;
  /** mot de passe provisoire à remplacer à la première connexion */
  mustChange: boolean;
  createdAt: string;
  lastSeen?: string;
  passwordChangedAt?: string;
}

/** Ce que voit le navigateur : jamais l'empreinte du mot de passe. */
export type PublicMember = Omit<StoredMember, "secret">;
export function toPublic(m: StoredMember): PublicMember {
  const out: Partial<StoredMember> = { ...m };
  delete out.secret;
  return out as PublicMember;
}

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 32).toString("hex")}`;
}

export function verifyPassword(pw: string, secret?: string) {
  if (!secret) return false;
  const [salt, hash] = secret.split(":");
  if (!salt || !hash) return false;
  const a = scryptSync(pw, salt, 32);
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

type Row = { id: string; name: string; identifier: string; modules: AdminModuleId[]; perms: Perms | null; status: MemberStatus; secret: string | null; must_change: boolean; created_at: string | Date; last_seen: string | Date | null; password_changed_at: string | Date | null };
const iso = (d: string | Date | null) => (d ? new Date(d).toISOString() : undefined);
const fromRow = (r: Row): StoredMember => ({ id: r.id, name: r.name, identifier: r.identifier, modules: r.modules, perms: r.perms ?? permsFromModules(r.modules), status: r.status, secret: r.secret ?? undefined, mustChange: r.must_change, createdAt: iso(r.created_at)!, lastSeen: iso(r.last_seen), passwordChangedAt: iso(r.password_changed_at) });

export async function readTeam(): Promise<StoredMember[]> {
  const rows = (await db()`select * from team_members order by created_at`) as Row[];
  return rows.map(fromRow);
}

async function upsert(m: StoredMember) {
  await db()`insert into team_members (id, name, identifier, modules, perms, status, secret, must_change, created_at, last_seen, password_changed_at)
    values (${m.id}, ${m.name}, ${m.identifier}, ${JSON.stringify(m.modules)}, ${JSON.stringify(m.perms)}, ${m.status}, ${m.secret ?? null}, ${m.mustChange}, ${m.createdAt}, ${m.lastSeen ?? null}, ${m.passwordChangedAt ?? null})
    on conflict (id) do update set name = excluded.name, identifier = excluded.identifier, modules = excluded.modules, perms = excluded.perms, status = excluded.status,
      secret = excluded.secret, must_change = excluded.must_change, last_seen = excluded.last_seen, password_changed_at = excluded.password_changed_at`;
}

let queue: Promise<unknown> = Promise.resolve();

/** Modification de l'équipe : on lit, on applique, puis on enregistre ce qui a changé (une seule à la fois). */
export function updateTeam<T>(fn: (list: StoredMember[]) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const list = await readTeam();
    const before = new Map(list.map((m) => [m.id, JSON.stringify(m)]));
    const out = await fn(list);
    const ids = new Set(list.map((m) => m.id));
    for (const id of before.keys()) if (!ids.has(id)) await db()`delete from team_members where id = ${id}`;
    for (const m of list) if (before.get(m.id) !== JSON.stringify(m)) await upsert(m);
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const digits = (s: string) => s.replace(/\D/g, "");

/** Deux identifiants désignent-ils la même personne ? (numéro : 8 derniers chiffres ; sinon texte exact) */
export function sameIdentifier(a: string, b: string) {
  const da = digits(a);
  const db = digits(b);
  if (da.length >= 8 && db.length >= 8) return da.slice(-8) === db.slice(-8);
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** mot de passe provisoire lisible (sans caractères ambigus) */
export function tempPassword() {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const buf = randomBytes(10);
  const s = Array.from(buf, (n) => abc[n % abc.length]).join("");
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}

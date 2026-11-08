// Registre des équipiers (côté serveur). En attendant la base de données, il est gardé dans
// .data/equipe.json (ignoré par Git). Les mots de passe ne sont jamais stockés en clair (scrypt + sel).
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { AdminModuleId } from "@/config/admin";
import type { MemberStatus } from "./demo";

export interface StoredMember {
  id: string;
  name: string;
  /** numéro WhatsApp (ou identifiant libre) */
  identifier: string;
  modules: AdminModuleId[];
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

const FILE = path.join(process.cwd(), ".data", "equipe.json");

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

/** Premier lancement : un équipier de démonstration (mot de passe défini dans .env.local). */
function seed(): StoredMember[] {
  const pw = process.env.TEAM_DEMO_PASSWORD;
  if (!pw) return [];
  return [
    {
      id: "m1",
      name: "Afi Lawson",
      identifier: "+228 91 23 45 67",
      modules: ["products", "categories", "deals"],
      status: "active",
      secret: hashPassword(pw),
      mustChange: false,
      createdAt: new Date(Date.now() - 30 * 864e5).toISOString(),
    },
  ];
}

let queue: Promise<unknown> = Promise.resolve();

export async function readTeam(): Promise<StoredMember[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as StoredMember[];
  } catch {
    const list = seed();
    // en ligne sans base de données, l'écriture est impossible : on garde la liste en mémoire
    await writeTeam(list).catch(() => undefined);
    return list;
  }
}

async function writeTeam(list: StoredMember[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

/** Modification atomique (une seule écriture à la fois). */
export function updateTeam<T>(fn: (list: StoredMember[]) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const list = await readTeam();
    const out = await fn(list);
    await writeTeam(list);
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

// Registre des visites, dans la base de données Neon (table visits).
import { db } from "@/lib/db";
import type { Device, SourceId } from "./sources";

export interface Visit {
  /** horodatage (ms) */
  t: number;
  /** visiteur anonyme (identifiant aléatoire, aucune donnée personnelle) */
  v: string;
  /** session de visite (30 min d'inactivité max) */
  s: string;
  /** page vue */
  p: string;
  src: SourceId;
  /** code pays ISO (vide si inconnu) */
  c: string;
  d: Device;
  /** événement (absent = page vue) : commande envoyée sur WhatsApp */
  e?: "order";
}

export async function appendVisit(v: Visit) {
  await db()`insert into visits (t, v, s, p, src, c, d, e) values (${new Date(v.t).toISOString()}, ${v.v}, ${v.s}, ${v.p}, ${v.src}, ${v.c}, ${v.d}, ${v.e ?? null})`;
}

export async function readVisits(since: number): Promise<Visit[]> {
  try {
    const rows = (await db()`select t, v, s, p, src, c, d, e from visits where t >= ${new Date(since).toISOString()}`) as (Omit<Visit, "t" | "e"> & { t: string | Date; e: "order" | null })[];
    return rows.map((r) => ({ ...r, t: new Date(r.t).getTime(), e: r.e ?? undefined }));
  } catch {
    return [];
  }
}

/** Au moins une vraie visite enregistrée ? (requête légère) */
export async function hasVisits(): Promise<boolean> {
  try {
    return ((await db()`select 1 from visits limit 1`) as unknown[]).length > 0;
  } catch {
    return false;
  }
}

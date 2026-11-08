// Registre des visites. En attendant la base de données, chaque visite est ajoutée à un fichier
// (.data/visites.jsonl, ignoré par Git). Une fois la base branchée, seules ces deux fonctions changeront.
import { promises as fs } from "node:fs";
import path from "node:path";
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
}

const FILE = path.join(process.cwd(), ".data", "visites.jsonl");

export async function appendVisit(v: Visit) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(v) + "\n", "utf8");
}

export async function readVisits(since: number): Promise<Visit[]> {
  let raw = "";
  try {
    raw = await fs.readFile(FILE, "utf8");
  } catch {
    return [];
  }
  const out: Visit[] = [];
  for (const line of raw.split("\n")) {
    if (!line) continue;
    try {
      const v = JSON.parse(line) as Visit;
      if (v.t >= since) out.push(v);
    } catch {
      /* ligne abîmée : ignorée */
    }
  }
  return out;
}

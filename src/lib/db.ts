// Connexion à la base de données Neon (Postgres), côté serveur uniquement.
// L'adresse est dans .env.local (DATABASE_URL), jamais dans le code.
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL manquant (.env.local)");
    client = neon(url);
  }
  return client;
}

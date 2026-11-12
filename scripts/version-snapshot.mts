// Points de retour du site : copie des contenus (catalogue, accueil, promos, réglages) sous un nom de version.
//
//   npx tsx --env-file=.env.local scripts/version-snapshot.mts sauver version-2     → copie l'état en ligne dans « <clé>-version-2 »
//   npx tsx --env-file=.env.local scripts/version-snapshot.mts restaurer version-2  → remet le site en ligne sur cette version
//                                                                                    (l'état actuel est d'abord gardé dans « <clé>-avant-restauration »)
// Les commandes, avis, paniers, favoris et l'équipe ne sont pas concernés (tables séparées).
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);
const KEYS = ["akua-admin-catalog", "akua-admin-home", "akua-admin-promos", "akua-admin-settings"];
const [mode, name] = process.argv.slice(2);
if (!name || !/^[a-z0-9-]+$/.test(name) || (mode !== "sauver" && mode !== "restaurer")) {
  console.log("Usage : version-snapshot.mts sauver|restaurer <nom-de-version>");
  process.exit(1);
}

const read = async (key: string) => ((await sql`select value from app_state where key = ${key}`) as { value: unknown }[])[0]?.value ?? null;
const write = (key: string, value: unknown, by: string) =>
  sql`insert into app_state (key, value, updated_at, updated_by) values (${key}, ${JSON.stringify(value)}, now(), ${by})
      on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by`;

for (const key of KEYS) {
  if (mode === "sauver") {
    const v = await read(key);
    if (!v) continue;
    await write(`${key}-${name}`, v, `Point de retour ${name}`);
    console.log("sauvé :", `${key}-${name}`);
  } else {
    const v = await read(`${key}-${name}`);
    if (!v) {
      console.log("absent :", `${key}-${name}`);
      continue;
    }
    const now = await read(key);
    if (now) await write(`${key}-avant-restauration`, now, "Sauvegarde avant restauration");
    await write(key, v, `Restauration ${name}`);
    console.log("restauré :", key);
  }
}

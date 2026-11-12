// Nouvelle organisation du catalogue (5 univers + sous-rayons + produits de démonstration).
//
//   npx tsx --env-file=.env.local scripts/catalog-v2.mts apercu    → prépare la copie d'aperçu (clés « -v2 »)
//   npx tsx --env-file=.env.local scripts/catalog-v2.mts publier   → applique l'aperçu au site en ligne
//
// Rien n'est supprimé : les produits existants sont reclassés, les nouveaux sont ajoutés.
import { neon } from "@neondatabase/serverless";
import { categories as seedCategories } from "../src/data/categories";
import { techProducts } from "../src/data/products-tech";

const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);
const SUFFIX = "-v2";
const KEYS = ["akua-admin-catalog", "akua-admin-home", "akua-admin-promos", "akua-admin-settings"];
const mode = process.argv[2];

// ancienne catégorie → [nouvelle catégorie, sous-rayon]
const MOVE: Record<string, [string, string]> = {
  "cat-consoles": ["cat-consoles", "consoles"],
  "cat-packs": ["cat-consoles", "packs"],
  "cat-jeux": ["cat-consoles", "jeux"],
  "cat-manettes": ["cat-consoles", "manettes"],
  "cat-simulation": ["cat-consoles", "simulation"],
  "cat-informatique": ["cat-informatique", "stockage"],
  "cat-surveillance": ["cat-electronique", "securite"],
};
const OLD_SLUGS: Record<string, string> = { consoles: "consoles-jeux-video", packs: "consoles-jeux-video", jeux: "consoles-jeux-video", manettes: "consoles-jeux-video", simulation: "consoles-jeux-video", informatique: "ordinateurs-informatique", surveillance: "electronique-equipements" };

type Row = { key: string; value: { state: Record<string, any>; version: number } };
const read = async (key: string) => ((await sql`select key, value from app_state where key = ${key}`) as Row[])[0]?.value ?? null;
const write = (key: string, value: unknown, by: string) =>
  sql`insert into app_state (key, value, updated_at, updated_by) values (${key}, ${JSON.stringify(value)}, now(), ${by})
      on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by`;

function migrateCatalog(v: Row["value"]) {
  const s = v.state;
  const newIds = new Set(seedCategories.map((c) => c.id));
  let moved = 0;
  s.products = (s.products ?? []).map((p: any) => {
    if (p.group || !MOVE[p.categoryId]) return p;
    const [categoryId, group] = MOVE[p.categoryId];
    moved++;
    return { ...p, categoryId, group };
  });
  // catégories ajoutées à la main dans l'admin : conservées à la suite
  const custom = (s.categories ?? []).filter((c: any) => !newIds.has(c.id) && !MOVE[c.id]);
  s.categories = [...seedCategories, ...custom.map((c: any, i: number) => ({ ...c, order: seedCategories.length + 1 + i }))];
  const have = new Set(s.products.map((p: any) => p.id));
  const added = techProducts.filter((p) => !have.has(p.id));
  s.products = [...s.products, ...added];
  console.log(`  catalogue : ${moved} produits reclassés, ${added.length} produits de démonstration ajoutés, ${s.products.length} au total, ${s.categories.length} catégories`);
  return v;
}

function migrateHome(v: Row["value"]) {
  for (const slot of Object.values(v.state.slides ?? {}) as any[][]) for (const sl of slot) if (sl.linkKind === "category" && OLD_SLUGS[sl.link]) sl.link = OLD_SLUGS[sl.link];
  for (const sec of v.state.sections ?? []) {
    if (sec.id === "packs" && sec.eyebrow === "Consoles complètes") sec.eyebrow = "Gaming";
  }
  return v;
}

function migrateSettings(v: Row["value"]) {
  const st = v.state.settings;
  if (st && /référence High-Tech/i.test(st.tagline ?? "")) st.tagline = "La technologie à votre service";
  return v;
}

if (mode === "apercu") {
  for (const key of KEYS) {
    let v = await read(key);
    if (!v) {
      // jamais enregistré depuis l'admin : pour le catalogue, on part des données d'origine du site
      if (key !== "akua-admin-catalog") continue;
      const { products } = await import("../src/data/products");
      v = { state: { products: products.filter((p) => !p.id.startsWith("p-") || true), categories: [], activity: [] }, version: 1 };
    }
    if (key === "akua-admin-catalog") v = migrateCatalog(v);
    if (key === "akua-admin-home") v = migrateHome(v);
    if (key === "akua-admin-settings") v = migrateSettings(v);
    await write(key + SUFFIX, v, "Nouvelle organisation (aperçu)");
    console.log("aperçu prêt :", key + SUFFIX);
  }
} else if (mode === "publier") {
  for (const key of KEYS) {
    const v = await read(key + SUFFIX);
    if (!v) continue;
    const before = await read(key);
    if (before) await write(`${key}-avant-v2`, before, "Sauvegarde avant publication");
    await write(key, v, "Nouvelle organisation");
    console.log("publié :", key, before ? "(ancienne version gardée dans " + key + "-avant-v2)" : "");
  }
} else {
  console.log("Usage : catalog-v2.mts apercu | publier");
}

// Contenus gérés depuis l'espace admin (catalogue, accueil, promos, paramètres), lus dans Neon.
// Tant qu'un contenu n'a jamais été enregistré depuis l'admin, le site garde ses données d'origine.
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const CONTENT_KEYS = ["akua-admin-catalog", "akua-admin-home", "akua-admin-promos", "akua-admin-settings"] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];
export const isContentKey = (k: string): k is ContentKey => (CONTENT_KEYS as readonly string[]).includes(k);
export const CONTENT_TAG = "contenu";

// Aperçu local : avec CONTENT_PREVIEW_SUFFIX (dans .env.local), les contenus sont lus et écrits dans une
// copie séparée (« clé-suffixe »). Le site en ligne, sans ce réglage, n'est pas touché tant qu'on ne publie pas.
const SUFFIX = process.env.CONTENT_PREVIEW_SUFFIX ?? "";
const dbKey = (key: ContentKey) => `${key}${SUFFIX}`;

/** Valeur enregistrée par l'admin : { state, version } (format du magasin zustand). */
export type Stored<T> = { state: T; version: number };

export async function readStateRaw<T>(key: ContentKey): Promise<Stored<T> | null> {
  try {
    const rows = (await db()`select value from app_state where key = ${dbKey(key)}`) as { value: Stored<T> }[];
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function writeState(key: ContentKey, value: unknown, by: string) {
  await db()`insert into app_state (key, value, updated_at, updated_by) values (${dbKey(key)}, ${JSON.stringify(value)}, now(), ${by})
    on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by`;
}

/** Lecture mise en cache pour le site public (rafraîchie dès qu'un contenu est enregistré). */
export const readState = unstable_cache(async (key: ContentKey) => readStateRaw<unknown>(key), ["app-state", SUFFIX], { tags: [CONTENT_TAG], revalidate: 600 }) as <T>(key: ContentKey) => Promise<Stored<T> | null>;

/** Ce que le public peut voir : jamais le journal de l'équipe ni les produits masqués. */
export function publicView(key: ContentKey, v: Stored<Record<string, unknown>> | null) {
  if (!v) return null;
  if (key !== "akua-admin-catalog") return v;
  const { activity: _a, ...state } = v.state;
  void _a;
  const products = (state.products as { published?: boolean }[] | undefined)?.filter((p) => p.published !== false);
  return { ...v, state: { ...state, products, activity: [] } };
}

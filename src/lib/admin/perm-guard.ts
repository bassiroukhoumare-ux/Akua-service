// Contrôle côté serveur des droits d'un équipier : on compare le contenu avant / après
// l'enregistrement et on refuse tout changement qu'il n'a pas le droit de faire,
// même si quelqu'un contourne l'écran de l'admin.
import type { AdminModuleId } from "@/config/admin";
import { can, PERMISSIONS, type Perms } from "@/config/permissions";
import type { ContentKey } from "@/lib/content";

type Obj = Record<string, unknown>;
type WithId = { id: string } & Obj;

const j = (v: unknown) => JSON.stringify(v ?? null);
const byId = (list: unknown) => new Map(((Array.isArray(list) ? list : []) as WithId[]).map((x) => [x.id, x]));
const label = (m: AdminModuleId, a: string) => PERMISSIONS[m]?.find((p) => p.id === a)?.label.toLowerCase() ?? a;

/** Ajouts, suppressions et modifications entre deux listes d'éléments identifiés. */
function diffList(before: unknown, after: unknown, ignore: string[] = []) {
  const a = byId(before);
  const b = byId(after);
  const clean = (x: Obj) => j(Object.fromEntries(Object.entries(x).filter(([k]) => !ignore.includes(k))));
  const added = [...b.keys()].filter((k) => !a.has(k));
  const removed = [...a.keys()].filter((k) => !b.has(k));
  const changed = [...b.keys()].filter((k) => a.has(k) && clean(a.get(k)!) !== clean(b.get(k)!));
  return { added, removed, changed, a, b };
}

/** Renvoie le droit manquant (message) ou null si le changement est permis. */
export function checkChange(key: ContentKey, before: { state?: Obj } | null, after: { state?: Obj }, perms: Perms | undefined): string | null {
  if (!perms) return null; // propriétaire
  const s0 = (before?.state ?? {}) as Obj;
  const s1 = (after.state ?? {}) as Obj;
  const need: [AdminModuleId, string][] = [];

  if (key === "akua-admin-catalog") {
    // journal : ajout uniquement, jamais d'effacement
    const before = byId(s0.activity);
    const after = byId(s1.activity);
    if ([...before.keys()].some((k) => !after.has(k))) return "Le journal d'activité ne peut pas être effacé.";

    const cats = diffList(s0.categories, s1.categories);
    if (cats.added.length) need.push(["categories", "create"]);
    if (cats.removed.length) need.push(["categories", "delete"]);
    if (cats.changed.length) need.push(["categories", "edit"]);

    const prods = diffList(s0.products, s1.products, ["updatedAt", "updatedBy"]);
    if (prods.added.length) need.push(["products", "create"]);
    if (prods.removed.length) need.push(["products", "delete"]);
    // produits déplacés automatiquement vers une autre catégorie lors de la suppression d'une catégorie
    const moved = prods.changed.filter((id) => {
      const x = prods.a.get(id)!;
      const y = prods.b.get(id)!;
      return cats.removed.includes(String(x.categoryId)) && j({ ...x, categoryId: null, updatedAt: null, updatedBy: null }) === j({ ...y, categoryId: null, updatedAt: null, updatedBy: null });
    });
    if (prods.changed.length > moved.length) need.push(["products", "edit"]);
  }

  if (key === "akua-admin-home") {
    if (j(s0.slides) !== j(s1.slides)) need.push(["home", "replace"]);
    if (j(s0.sections) !== j(s1.sections)) need.push(["home", "sections"]);
    const d0 = (s0.deals ?? {}) as Obj;
    const d1 = (s1.deals ?? {}) as Obj;
    if (j(d0.productIds) !== j(d1.productIds)) need.push(["deals", "products"]);
    if (j(d0.videos) !== j(d1.videos)) need.push(["deals", "videos"]);
    const rest = (d: Obj) => j({ ...d, productIds: null, videos: null });
    if (rest(d0) !== rest(d1)) need.push(["deals", "timing"]);
  }

  if (key === "akua-admin-promos") {
    const codes = diffList(s0.codes, s1.codes);
    if (codes.added.length) need.push(["promos", "create"]);
    if (codes.removed.length) need.push(["promos", "delete"]);
    for (const id of codes.changed) {
      const x = codes.a.get(id)!;
      const y = codes.b.get(id)!;
      need.push(j({ ...x, active: null }) === j({ ...y, active: null }) ? ["promos", "toggle"] : ["promos", "edit"]);
    }
    // la bannière liée à un code supprimé se désactive d'elle-même : couvert par le droit de suppression
    const a0 = { ...((s0.announcement ?? {}) as Obj) };
    const a1 = { ...((s1.announcement ?? {}) as Obj) };
    const autoOff = codes.removed.includes(String(a0.codeId)) && a1.codeId === null && j({ ...a0, codeId: null, enabled: false }) === j(a1);
    if (j(a0) !== j(a1) && !autoOff) need.push(["promos", "announcement"]);
  }

  if (key === "akua-admin-settings" && j(s0.settings) !== j(s1.settings)) need.push(["settings", "edit"]);

  const missing = need.find(([m, a]) => !can(perms, m, a));
  return missing ? `Action non autorisée : ${label(missing[0], missing[1])}. Demandez ce droit au responsable.` : null;
}

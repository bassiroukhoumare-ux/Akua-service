// Droits détaillés des équipiers : pour chaque module, ce qu'ils peuvent faire.
// « view » (voir) est le droit de base : sans lui, le module est invisible pour l'équipier.
import type { AdminModuleId } from "./admin";

export interface PermDef {
  id: string;
  label: string;
}

export const PERMISSIONS: Partial<Record<AdminModuleId, PermDef[]>> = {
  stats: [{ id: "view", label: "Voir les statistiques" }],
  products: [
    { id: "view", label: "Voir les produits et packs" },
    { id: "create", label: "Ajouter des produits et packs" },
    { id: "edit", label: "Modifier (prix, stock, photos…) et masquer" },
    { id: "delete", label: "Supprimer" },
  ],
  categories: [
    { id: "view", label: "Voir les catégories" },
    { id: "create", label: "Ajouter une catégorie" },
    { id: "edit", label: "Modifier et réordonner" },
    { id: "delete", label: "Supprimer" },
  ],
  home: [
    { id: "view", label: "Voir l'accueil et les bannières" },
    { id: "replace", label: "Remplacer l'affiche et la bannière" },
    { id: "sections", label: "Afficher, masquer et renommer les sections" },
  ],
  deals: [
    { id: "view", label: "Voir l'offre spéciale" },
    { id: "products", label: "Choisir les produits en promotion" },
    { id: "videos", label: "Ajouter ou changer les vidéos TikTok" },
    { id: "timing", label: "Modifier la durée, les textes et l'activation" },
  ],
  promos: [
    { id: "view", label: "Voir les codes et leurs utilisations" },
    { id: "create", label: "Créer un code" },
    { id: "edit", label: "Modifier un code" },
    { id: "toggle", label: "Activer ou désactiver un code" },
    { id: "delete", label: "Supprimer un code" },
    { id: "announcement", label: "Gérer la bannière d'annonce" },
  ],
  orders: [
    { id: "view", label: "Voir les commandes et les clients" },
    { id: "manage", label: "Marquer vendue, non vendue ou en attente" },
    { id: "delete", label: "Supprimer une commande" },
  ],
  reviews: [
    { id: "view", label: "Voir les avis" },
    { id: "moderate", label: "Masquer ou rendre visible" },
    { id: "delete", label: "Supprimer" },
  ],
  favorites: [{ id: "view", label: "Voir les favoris" }],
  carts: [
    { id: "view", label: "Voir les paniers" },
    { id: "manage", label: "Relancer et changer le statut" },
    { id: "delete", label: "Supprimer" },
  ],
  settings: [
    { id: "view", label: "Voir les paramètres" },
    { id: "edit", label: "Modifier les paramètres" },
  ],
};

/** Droits d'un équipier : module → actions permises. */
export type Perms = Partial<Record<AdminModuleId, string[]>>;

export const allActions = (m: AdminModuleId) => (PERMISSIONS[m] ?? []).map((p) => p.id);

/** Équipiers créés avant les droits détaillés : accès complet aux modules attribués. */
export function permsFromModules(modules: AdminModuleId[]): Perms {
  return Object.fromEntries(modules.filter((m) => PERMISSIONS[m]).map((m) => [m, allActions(m)]));
}

/** Nettoie des droits reçus : actions connues seulement, « voir » ajouté dès qu'une autre action est donnée. */
export function cleanPerms(raw: unknown): Perms {
  const out: Perms = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [m, list] of Object.entries(raw as Record<string, unknown>)) {
    const defs = PERMISSIONS[m as AdminModuleId];
    if (!defs || !Array.isArray(list)) continue;
    const ok = defs.map((d) => d.id).filter((id) => list.includes(id));
    if (!ok.length) continue;
    out[m as AdminModuleId] = ok.includes("view") ? ok : ["view", ...ok];
  }
  return out;
}

export const modulesOf = (p: Perms) => Object.keys(p) as AdminModuleId[];

/** Le propriétaire (perms absent) peut tout faire. */
export const can = (perms: Perms | undefined, m: AdminModuleId, action = "view") => !perms || !!perms[m]?.includes(action);

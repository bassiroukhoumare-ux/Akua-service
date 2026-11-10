import {
  BarChart3,
  Heart,
  History,
  LayoutDashboard,
  LayoutGrid,
  type LucideIcon,
  MessageSquareText,
  Package,
  PanelsTopLeft,
  Receipt,
  Settings,
  ShoppingBag,
  TicketPercent,
  Timer,
  Users,
} from "lucide-react";

import { ADMIN_BASE, TEAM_BASE } from "./admin-base";

export { ADMIN_BASE, TEAM_BASE };

/** Modules de l'espace administrateur. Chaque module est aussi un droit attribuable aux équipiers. */
export type AdminModuleId =
  | "dashboard"
  | "stats"
  | "products"
  | "categories"
  | "home"
  | "deals"
  | "promos"
  | "orders"
  | "reviews"
  | "favorites"
  | "carts"
  | "team"
  | "activity"
  | "settings";

export interface AdminModule {
  id: AdminModuleId;
  label: string;
  /** description courte (droits des équipiers, pages à venir) */
  description: string;
  /** adresse dans le portail du propriétaire */
  href: string;
  /** fin d'adresse, commune aux deux portails ("" pour le tableau de bord) */
  slug: string;
  icon: LucideIcon;
  /** réservé au propriétaire : jamais attribuable à un équipier */
  ownerOnly?: boolean;
  /** étape de livraison : la page est encore en préparation tant que l'étape n'est pas réalisée */
  step: number;
}

export interface AdminGroup {
  label: string;
  modules: AdminModule[];
}

export const ADMIN_GROUPS: AdminGroup[] = [
  {
    label: "Pilotage",
    modules: [
      { id: "dashboard", label: "Tableau de bord", description: "Vue d'ensemble de l'activité", href: ADMIN_BASE, slug: "", icon: LayoutDashboard, step: 1 },
      { id: "stats", label: "Statistiques", description: "Visites, pays et provenance des visiteurs", href: `${ADMIN_BASE}/statistiques`, slug: "statistiques", icon: BarChart3, step: 7 },
    ],
  },
  {
    label: "Catalogue",
    modules: [
      { id: "products", label: "Produits", description: "Ajouter, modifier et supprimer les produits et les packs", href: `${ADMIN_BASE}/produits`, slug: "produits", icon: Package, step: 2 },
      { id: "categories", label: "Catégories", description: "Rayons de la boutique et leurs icônes", href: `${ADMIN_BASE}/categories`, slug: "categories", icon: LayoutGrid, step: 2 },
    ],
  },
  {
    label: "Vitrine",
    modules: [
      { id: "home", label: "Accueil et bannières", description: "Affiche, bannières et sections de l'accueil", href: `${ADMIN_BASE}/accueil`, slug: "accueil", icon: PanelsTopLeft, step: 3 },
      { id: "deals", label: "Offre spéciale", description: "Produits en promo, durée et vidéos TikTok", href: `${ADMIN_BASE}/offre-speciale`, slug: "offre-speciale", icon: Timer, step: 3 },
      { id: "promos", label: "Codes promo", description: "Codes de réduction et bannière d'annonce", href: `${ADMIN_BASE}/codes-promo`, slug: "codes-promo", icon: TicketPercent, step: 4 },
    ],
  },
  {
    label: "Clients",
    modules: [
      { id: "orders", label: "Commandes", description: "Commandes reçues depuis le site, à marquer vendues ou non", href: `${ADMIN_BASE}/commandes`, slug: "commandes", icon: Receipt, step: 1 },
      { id: "reviews", label: "Avis", description: "Avis laissés sur les produits", href: `${ADMIN_BASE}/avis`, slug: "avis", icon: MessageSquareText, step: 5 },
      { id: "favorites", label: "Favoris", description: "Produits ajoutés aux favoris", href: `${ADMIN_BASE}/favoris`, slug: "favoris", icon: Heart, step: 5 },
      { id: "carts", label: "Paniers", description: "Paniers enregistrés et non finalisés", href: `${ADMIN_BASE}/paniers`, slug: "paniers", icon: ShoppingBag, step: 5 },
    ],
  },
  {
    label: "Boutique",
    modules: [
      { id: "team", label: "Équipe", description: "Équipiers et droits d'accès", href: `${ADMIN_BASE}/equipe`, slug: "equipe", icon: Users, step: 1, ownerOnly: true },
      { id: "activity", label: "Activité de l'équipe", description: "Qui a fait quoi, et quand", href: `${ADMIN_BASE}/activite`, slug: "activite", icon: History, step: 1, ownerOnly: true },
      { id: "settings", label: "Paramètres", description: "Horaires, localisation, contact et réseaux sociaux", href: `${ADMIN_BASE}/parametres`, slug: "parametres", icon: Settings, step: 6 },
    ],
  },
];

export const ADMIN_MODULES = ADMIN_GROUPS.flatMap((g) => g.modules);
/** étape en cours de réalisation */
export const ADMIN_CURRENT_STEP = 7;

export const findModule = (href: string) => ADMIN_MODULES.find((m) => m.href === href);

/** adresse d'un module dans un portail donné */
export const moduleHref = (base: string, m: AdminModule) => (m.slug ? `${base}/${m.slug}` : base);
/** modules qu'un équipier peut se voir attribuer */
export const ASSIGNABLE_MODULES = ADMIN_MODULES.filter((m) => m.id !== "dashboard" && !m.ownerOnly);

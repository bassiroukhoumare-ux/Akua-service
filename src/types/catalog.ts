// Structure identique aux futures tables Supabase.

export type Platform =
  | "ps5"
  | "ps4"
  | "ps3"
  | "switch2"
  | "switch"
  | "xbox-series"
  | "xbox-360"
  | "pc"
  | "android"
  | "ios";

/** État : neuf, venant (occasion importée) ou reconditionné. La valeur « occasion » s'affiche « Venant ». */
export type Condition = "neuf" | "occasion" | "reconditionne";
/** Conditionnement : dans son carton d'origine ou sans carton. */
export type Packaging = "carton" | "sans-carton";
export type StockStatus = "en_stock" | "stock_faible" | "rupture" | "sur_commande";

export type ProductBadgeType =
  | "neuf-scelle"
  | "garantie"
  | "promo"
  | "nouveau"
  | "best-seller"
  | "premium";

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string; // nom d'icône lucide (voir src/lib/icons.ts)
  description?: string;
  order: number;
  /** nom court pour les petits espaces (onglets, barre mobile) */
  shortName?: string;
  /** photo représentative de la catégorie (accueil, menus) */
  image?: string;
  /** sous-rayons : « Souris », « Claviers »… */
  groups?: CategoryGroup[];
}

export interface CategoryGroup {
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  /** sous-rayon dans la catégorie (slug d'un CategoryGroup) */
  group?: string;
  platforms: Platform[];
  /** plateformes hors liste, saisies librement (« Autre ») */
  otherPlatforms?: string[];
  condition: Condition;
  price: number; // en FCFA, entier
  compareAtPrice?: number; // prix barré
  stockStatus: StockStatus;
  stockLeft?: number;
  soldCount?: number;
  soldTarget?: number; // pour la barre « Déjà vendus »
  rating?: number;
  reviewsCount?: number;
  images: string[]; // chemins dans /public/products/
  badges: ProductBadgeType[];
  shortDescription: string;
  description: string;
  compatibility?: string[];
  includes?: string[];
  isFeatured?: boolean;
  isPack?: boolean;
  isDealOfDay?: boolean;
  packaging?: Packaging;
  /** garantie proposée (par défaut : oui) */
  warranty?: boolean;
  /** durée ou précision de la garantie : « 3 mois », « 1 an »… */
  warrantyLabel?: string;
  /** proposé en vente en gros (revendeurs, salles de jeux) */
  wholesale?: boolean;
  /** visible sur le site (par défaut : oui) */
  published?: boolean;
  /** équipier qui a créé / modifié en dernier le produit (espace administrateur) */
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
  createdAt: string;
}

export type BannerTheme = "blue" | "dark" | "light";

export interface Banner {
  id: string;
  placement: "hero" | "promo-trio" | "asymmetric" | "final";
  theme: BannerTheme;
  eyebrow: string;
  title: string;
  subtitle?: string;
  priceLabel?: string;
  ctaLabel: string;
  href: string;
  productId?: string; // visuel produit associé
  categoryId?: string; // icône de repli pour le visuel
  order: number;
}

/** Avis client. Plus tard : table Supabase `reviews` (modération depuis le back-office). */
export interface Review {
  id: string;
  productId: string;
  firstName: string;
  lastName: string;
  country: string;
  email: string; // jamais affiché publiquement
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
  status: "publie" | "masque";
}

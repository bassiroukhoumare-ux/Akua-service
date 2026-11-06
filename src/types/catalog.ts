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

export type Condition = "neuf" | "occasion";
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
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  platforms: Platform[];
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

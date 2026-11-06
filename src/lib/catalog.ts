// Couche d'accès aux données.
// Aujourd'hui : données locales. Demain : requêtes Supabase, mêmes signatures.

import { banners } from "@/data/banners";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { Banner, Category, Condition, Platform, Product } from "@/types/catalog";

export type SortKey = "pertinence" | "prix-asc" | "prix-desc" | "nouveautes";

export interface ProductQuery {
  categorySlug?: string;
  platforms?: Platform[];
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
  sort?: SortKey;
}

const PROMO_SLUG = "promos";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export async function getCategories(): Promise<Category[]> {
  return [...categories].sort((a, b) => a.order - b.order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return categories.find((c) => c.id === id) ?? null;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  let list = [...products];

  if (query.categorySlug) {
    if (query.categorySlug === PROMO_SLUG) {
      list = list.filter((p) => p.badges.includes("promo") || p.compareAtPrice);
    } else {
      const cat = categories.find((c) => c.slug === query.categorySlug);
      list = cat ? list.filter((p) => p.categoryId === cat.id) : [];
    }
  }
  if (query.platforms?.length) {
    list = list.filter((p) => p.platforms.some((pl) => query.platforms!.includes(pl)));
  }
  if (query.condition) list = list.filter((p) => p.condition === query.condition);
  if (query.minPrice != null) list = list.filter((p) => p.price >= query.minPrice!);
  if (query.maxPrice != null) list = list.filter((p) => p.price <= query.maxPrice!);
  if (query.inStockOnly) list = list.filter((p) => p.stockStatus !== "rupture");
  if (query.search) {
    const q = normalize(query.search.trim());
    list = list.filter((p) =>
      normalize(`${p.name} ${p.shortDescription} ${p.platforms.join(" ")}`).includes(q),
    );
  }

  switch (query.sort) {
    case "prix-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "prix-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "nouveautes":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    default:
      list.sort(
        (a, b) =>
          Number(!!b.isFeatured) - Number(!!a.isFeatured) ||
          (b.soldCount ?? 0) - (a.soldCount ?? 0),
      );
  }
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  return products.find((p) => p.id === id) ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return products.filter((p) => ids.includes(p.id));
}

export async function getDealsOfTheDay(): Promise<Product[]> {
  return products.filter((p) => p.isDealOfDay);
}

export async function getPacks(): Promise<Product[]> {
  return products.filter((p) => p.isPack).sort((a, b) => a.price - b.price);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return products.filter((p) => p.isFeatured);
}

export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  return products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, limit);
}

export async function getBanners(placement: Banner["placement"]): Promise<Banner[]> {
  return banners.filter((b) => b.placement === placement).sort((a, b) => a.order - b.order);
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  ps5: "PS5",
  ps4: "PS4",
  ps3: "PS3",
  switch2: "Switch 2",
  switch: "Switch",
  "xbox-series": "Xbox Series",
  "xbox-360": "Xbox 360",
  pc: "PC",
  android: "Android",
  ios: "iOS",
};

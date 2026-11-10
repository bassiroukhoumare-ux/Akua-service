"use client";

// Catalogue de l'espace administrateur (étape design).
// En attendant la base de données, les modifications sont gardées dans ce navigateur
// (base de données Neon) : le site public les affiche.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { serverStorage } from "@/lib/server-storage";
import type { AdminModuleId } from "@/config/admin";
import { categories as seedCategories } from "@/data/categories";
import { products as seedProducts } from "@/data/products";
import type { ActivityAction } from "@/lib/admin/demo";
import type { Category, Product } from "@/types/catalog";

/** Auteur d'une modification : le propriétaire ou un équipier. */
export interface Actor {
  id: string;
  name: string;
  kind: "owner" | "team";
}

export interface StoredActivity {
  id: string;
  memberId: string;
  memberName: string;
  action: ActivityAction;
  module: AdminModuleId;
  target: string;
  /** élément concerné (produit, catégorie…), pour y accéder depuis le journal */
  targetId?: string;
  detail?: string;
  at: string;
}

interface AdminCatalog {
  products: Product[];
  categories: Category[];
  activity: StoredActivity[];
  saveProduct: (p: Product, actor: Actor, detail?: string) => void;
  deleteProduct: (id: string, actor: Actor) => void;
  togglePublished: (id: string, actor: Actor) => void;
  saveCategory: (c: Category, actor: Actor) => void;
  deleteCategory: (id: string, moveTo: string | null, actor: Actor) => void;
  moveCategory: (id: string, dir: -1 | 1) => void;
  reset: () => void;
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** seules les actions des équipiers sont journalisées (le propriétaire voit tout) */
function log(actor: Actor, action: ActivityAction, module: AdminModuleId, target: string, detail?: string, targetId?: string): StoredActivity[] {
  if (actor.kind !== "team") return [];
  return [{ id: uid(), memberId: actor.id, memberName: actor.name, action, module, target, targetId, detail, at: new Date().toISOString() }];
}

const initial = () => ({ products: seedProducts, categories: seedCategories, activity: [] as StoredActivity[] });

export const useAdminCatalog = create<AdminCatalog>()(
  persist(
    (set, get) => ({
      ...initial(),
      saveProduct: (p, actor, detail) => {
        const exists = get().products.some((x) => x.id === p.id);
        const now = new Date().toISOString();
        const product: Product = exists
          ? { ...p, updatedBy: actor.name, updatedAt: now }
          : { ...p, createdBy: actor.name, createdAt: now.slice(0, 10), updatedAt: now };
        set((s) => ({
          products: exists ? s.products.map((x) => (x.id === p.id ? product : x)) : [product, ...s.products],
          activity: [...log(actor, exists ? "update" : "create", "products", p.name, detail, p.id), ...s.activity],
        }));
      },
      deleteProduct: (id, actor) => {
        const p = get().products.find((x) => x.id === id);
        set((s) => ({ products: s.products.filter((x) => x.id !== id), activity: [...log(actor, "delete", "products", p?.name ?? "Produit", undefined, id), ...s.activity] }));
      },
      togglePublished: (id, actor) => {
        const p = get().products.find((x) => x.id === id);
        if (!p) return;
        const published = p.published === false;
        set((s) => ({
          products: s.products.map((x) => (x.id === id ? { ...x, published, updatedBy: actor.name, updatedAt: new Date().toISOString() } : x)),
          activity: [...log(actor, "update", "products", p.name, published ? "rendu visible sur le site" : "masqué du site", p.id), ...s.activity],
        }));
      },
      saveCategory: (c, actor) => {
        const exists = get().categories.some((x) => x.id === c.id);
        set((s) => ({
          categories: exists ? s.categories.map((x) => (x.id === c.id ? c : x)) : [...s.categories, { ...c, order: s.categories.length + 1 }],
          activity: [...log(actor, exists ? "update" : "create", "categories", c.name, undefined, c.id), ...s.activity],
        }));
      },
      deleteCategory: (id, moveTo, actor) => {
        const c = get().categories.find((x) => x.id === id);
        set((s) => ({
          categories: s.categories.filter((x) => x.id !== id).map((x, i) => ({ ...x, order: i + 1 })),
          products: moveTo ? s.products.map((p) => (p.categoryId === id ? { ...p, categoryId: moveTo } : p)) : s.products,
          activity: [...log(actor, "delete", "categories", c?.name ?? "Catégorie", undefined, id), ...s.activity],
        }));
      },
      moveCategory: (id, dir) => {
        const list = [...get().categories].sort((a, b) => a.order - b.order);
        const i = list.findIndex((c) => c.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        set({ categories: list.map((c, k) => ({ ...c, order: k + 1 })) });
      },
      reset: () => set(initial()),
    }),
    { name: "akua-admin-catalog", version: 1, storage: serverStorage },
  ),
);

export const newProductId = () => `p-${uid()}`;
export const newCategoryId = () => `cat-${uid()}`;

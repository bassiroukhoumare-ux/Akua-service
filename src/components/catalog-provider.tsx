"use client";

import { createContext, useContext } from "react";
import { categories as baseCategories } from "@/data/categories";
import { products as baseProducts } from "@/data/products";
import type { Category, Product } from "@/types/catalog";

type Catalog = { products: Product[]; categories: Category[] };

// Catalogue publié (lu dans la base par le serveur) partagé avec les composants du navigateur :
// menu, recherche, cartes produits… Par défaut : données d'origine.
const Ctx = createContext<Catalog>({ products: baseProducts, categories: baseCategories });

export function CatalogProvider({ value, children }: { value: Catalog; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCatalog = () => useContext(Ctx);

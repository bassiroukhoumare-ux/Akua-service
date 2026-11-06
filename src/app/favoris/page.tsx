import type { Metadata } from "next";
import { FavoritesView } from "@/components/shop/favorites-view";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Mes favoris", robots: { index: false } };

export default async function FavoritesPage() {
  return <FavoritesView products={await getProducts()} />;
}

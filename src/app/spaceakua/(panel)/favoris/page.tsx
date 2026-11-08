import type { Metadata } from "next";
import { FavoritesView } from "@/components/admin/clients/favorites-view";

export const metadata: Metadata = { title: "Favoris" };

export default function Page() {
  return (
    <>
      <FavoritesView />
    </>
  );
}

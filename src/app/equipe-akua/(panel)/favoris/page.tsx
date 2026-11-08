import type { Metadata } from "next";
import { FavoritesView } from "@/components/admin/clients/favorites-view";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Favoris" };

export default function Page() {
  return (
    <TeamGate module="favorites">
      <FavoritesView />
    </TeamGate>
  );
}

import type { Metadata } from "next";
import { CartsView } from "@/components/admin/clients/carts-view";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Paniers" };

export default function Page() {
  return (
    <TeamGate module="carts">
      <CartsView />
    </TeamGate>
  );
}

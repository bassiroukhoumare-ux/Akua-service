import type { Metadata } from "next";
import { PromosView } from "@/components/admin/promos/promos-view";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Codes promo" };

export default function PromosPage() {
  return (
    <TeamGate module="promos">
      <PromosView />
    </TeamGate>
  );
}

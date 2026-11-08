import type { Metadata } from "next";
import { StatsView } from "@/components/admin/stats/stats-view";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Statistiques" };

export default function StatsPage() {
  return (
    <TeamGate module="stats">
      <StatsView />
    </TeamGate>
  );
}

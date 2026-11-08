import type { Metadata } from "next";
import { StatsView } from "@/components/admin/stats/stats-view";

export const metadata: Metadata = { title: "Statistiques" };

export default function StatsPage() {
  return <StatsView />;
}

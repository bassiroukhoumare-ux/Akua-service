import type { Metadata } from "next";
import { TeamView } from "@/components/admin/team-view";

export const metadata: Metadata = { title: "Équipe" };

export default function TeamPage() {
  return <TeamView />;
}

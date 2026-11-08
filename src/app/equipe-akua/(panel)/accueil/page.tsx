import type { Metadata } from "next";
import { HomeEditor } from "@/components/admin/home/home-editor";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Accueil et bannières" };

export default function HomeAdminPage() {
  return (
    <TeamGate module="home">
      <HomeEditor />
    </TeamGate>
  );
}

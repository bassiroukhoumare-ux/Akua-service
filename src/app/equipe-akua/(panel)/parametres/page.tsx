import type { Metadata } from "next";
import { SettingsView } from "@/components/admin/settings/settings-view";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return (
    <TeamGate module="settings">
      <SettingsView />
    </TeamGate>
  );
}

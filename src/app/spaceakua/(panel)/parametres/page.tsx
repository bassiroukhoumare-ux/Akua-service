import type { Metadata } from "next";
import { SettingsView } from "@/components/admin/settings/settings-view";

export const metadata: Metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return (
    <>
      <SettingsView />
    </>
  );
}

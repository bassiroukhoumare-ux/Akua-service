import type { Metadata } from "next";
import { DealsEditor } from "@/components/admin/home/deals-editor";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Offre spéciale" };

export default function DealsAdminPage() {
  return (
    <TeamGate module="deals">
      <DealsEditor />
    </TeamGate>
  );
}

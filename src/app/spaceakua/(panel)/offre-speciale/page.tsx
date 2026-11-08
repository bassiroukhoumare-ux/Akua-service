import type { Metadata } from "next";
import { DealsEditor } from "@/components/admin/home/deals-editor";

export const metadata: Metadata = { title: "Offre spéciale" };

export default function DealsAdminPage() {
  return (
    <>
      <DealsEditor />
    </>
  );
}

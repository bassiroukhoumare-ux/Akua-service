import type { Metadata } from "next";
import { PromosView } from "@/components/admin/promos/promos-view";

export const metadata: Metadata = { title: "Codes promo" };

export default function PromosPage() {
  return (
    <>
      <PromosView />
    </>
  );
}

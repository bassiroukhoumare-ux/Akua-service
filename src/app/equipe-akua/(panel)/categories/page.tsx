import type { Metadata } from "next";
import { CategoriesView } from "@/components/admin/catalog/categories-view";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Catégories" };

export default function CategoriesPage() {
  return (
    <TeamGate module="categories">
      <CategoriesView />
    </TeamGate>
  );
}

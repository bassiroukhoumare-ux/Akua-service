import type { Metadata } from "next";
import { CategoriesView } from "@/components/admin/catalog/categories-view";

export const metadata: Metadata = { title: "Catégories" };

export default function CategoriesPage() {
  return (
    <>
      <CategoriesView />
    </>
  );
}

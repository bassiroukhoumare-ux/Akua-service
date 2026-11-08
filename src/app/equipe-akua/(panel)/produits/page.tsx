import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsList } from "@/components/admin/catalog/products-list";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Produits" };

export default function ProductsPage() {
  return (
    <TeamGate module="products">
      <Suspense>
        <ProductsList />
      </Suspense>
    </TeamGate>
  );
}

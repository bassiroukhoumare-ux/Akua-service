import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsList } from "@/components/admin/catalog/products-list";

export const metadata: Metadata = { title: "Produits" };

export default function ProductsPage() {
  return (
    <>
      <Suspense>
        <ProductsList />
      </Suspense>
    </>
  );
}

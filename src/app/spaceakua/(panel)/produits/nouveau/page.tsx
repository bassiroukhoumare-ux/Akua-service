import type { Metadata } from "next";
import { ProductEditor } from "@/components/admin/catalog/product-editor";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return (
    <>
      <ProductEditor key={type ?? "simple"} pack={type === "pack"} />
    </>
  );
}

import type { Metadata } from "next";
import { ProductEditor } from "@/components/admin/catalog/product-editor";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return (
    <TeamGate module="products">
      <ProductEditor key={type ?? "simple"} pack={type === "pack"} />
    </TeamGate>
  );
}

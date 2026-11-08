import type { Metadata } from "next";
import { ProductEditor } from "@/components/admin/catalog/product-editor";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Modifier le produit" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <TeamGate module="products">
      <ProductEditor key={id} productId={id} />
    </TeamGate>
  );
}

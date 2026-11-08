import type { Metadata } from "next";
import { ProductEditor } from "@/components/admin/catalog/product-editor";

export const metadata: Metadata = { title: "Modifier le produit" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <ProductEditor key={id} productId={id} />
    </>
  );
}

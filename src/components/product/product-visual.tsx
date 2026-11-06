import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import { ProductImagePlaceholder } from "./product-image-placeholder";

// Photos studio détourées (fond transparent) : affichées en entier avec une ombre.
// Les autres (photos de la boutique, mises en scène) remplissent le cadre.
const CUTOUTS = new Set([
  "ps4-pro", "ps4-ds4", "ds4", "dualsense", "ps5-dualsense", "ps3-slim", "ds3", "xbox-360-s",
  "xbox-360-wired", "xbox-360-white", "switch-pro", "switch-2", "switch-2-dock", "switch-1", "wd-drives",
]);

export function isCutout(src: string): boolean {
  return CUTOUTS.has(src.split("/").pop()!.replace(/\.\w+$/, ""));
}

interface ProductVisualProps {
  product: Pick<Product, "name" | "categoryId" | "images">;
  src?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** marge intérieure appliquée aux photos détourées */
  inset?: string;
}

/** Image produit dans un parent `relative` dimensionné. */
export function ProductVisual({ product, src, className, sizes = "(min-width:1024px) 20vw, 50vw", priority, inset = "p-[12%]" }: ProductVisualProps) {
  const s = src ?? product.images[0];
  if (!s) return <ProductImagePlaceholder name={product.name} categoryId={product.categoryId} className={className} />;
  const cut = isCutout(s);
  return (
    <Image
      src={s}
      alt={product.name}
      fill
      sizes={sizes}
      priority={priority}
      className={cn(
        cut ? cn("object-contain drop-shadow-[0_18px_22px_rgb(11_16_32/0.22)]", inset) : "object-cover",
        className,
      )}
    />
  );
}

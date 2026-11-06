import { discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";

/** Badge principal d'une carte : -x % (rouge), Nouveau (bleu), Premium (noir). */
export function ProductBadge({ product, className }: { product: Product; className?: string }) {
  const pct = discountPercent(product.price, product.compareAtPrice);
  let label: string | null = null;
  let tone = "bg-akua-red";
  if (pct) label = `-${pct}%`;
  else if (product.badges.includes("nouveau")) {
    label = "Nouveau";
    tone = "bg-akua-blue";
  } else if (product.badges.includes("premium")) {
    label = "Premium";
    tone = "bg-akua-black";
  } else if (product.badges.includes("best-seller")) {
    label = "Top vente";
    tone = "bg-akua-black";
  }
  if (!label) return null;
  return (
    <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-[10.5px] font-extrabold text-akua-white", tone, className)}>
      {label}
    </span>
  );
}

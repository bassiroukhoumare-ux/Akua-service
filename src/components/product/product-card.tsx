import Link from "next/link";
import { categories } from "@/data/categories";
import { discountPercent, formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import { AddToCartButton } from "./add-to-cart-button";
import { FavoriteButton } from "./favorite-button";
import { ProductVisual } from "./product-visual";
import { ProductRating } from "./rating-stars";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function StockText({ product, className }: { product: Product; className?: string }) {
  const s = product.stockStatus;
  if (s === "stock_faible") return <p className={cn("text-[12.5px] font-semibold text-akua-red", className)}>Plus que {product.stockLeft} en stock</p>;
  if (s === "sur_commande") return <p className={cn("text-[12.5px] font-semibold text-akua-gray-500", className)}>Sur commande</p>;
  if (s === "rupture") return <p className={cn("text-[12.5px] font-semibold text-akua-gray-500", className)}>Rupture de stock</p>;
  return (
    <p className={cn("flex items-center gap-1.5 text-[12.5px] font-semibold text-akua-ink", className)}>
      <span className="size-2 rounded-full bg-akua-whatsapp" /> En stock
    </p>
  );
}

export function CardBadges({ product, className }: { product: Product; className?: string }) {
  const pct = discountPercent(product.price, product.compareAtPrice);
  let b: { label: string; tone: string } | null = null;
  if (pct) b = { label: `-${pct} %`, tone: "bg-akua-red text-akua-white" };
  else if (product.badges.includes("nouveau")) b = { label: "Nouveau", tone: "bg-akua-blue text-akua-white" };
  else if (product.badges.includes("premium")) b = { label: "Premium", tone: "bg-akua-ink text-akua-white" };
  else if (product.badges.includes("best-seller")) b = { label: "Top vente", tone: "bg-akua-white text-akua-ink ring-1 ring-akua-gray-200" };
  if (!b) return null;
  return <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-bold", b.tone, className)}>{b.label}</span>;
}

/**
 * Carte produit : liseré dégradé bleu au survol, visuel sur tuile douce,
 * nom, plateformes, note, prix mis en avant et ajout rapide.
 */
export function ProductCard({ product, className, priority, sizes = "(min-width:1024px) 23vw, (min-width:768px) 31vw, 48vw" }: ProductCardProps) {
  const href = `/produit/${product.slug}`;
  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <article
      className={cn(
        "group relative h-full rounded-[24px] bg-akua-gray-200/70 p-px transition-all duration-500 ease-akua",
        "hover:-translate-y-1 hover:bg-[linear-gradient(150deg,var(--akua-blue),var(--akua-gray-200)_38%,var(--akua-gray-200)_62%,var(--akua-blue))] hover:shadow-[0_24px_50px_-28px_rgb(31_91_255/0.55)]",
        className,
      )}
    >
      <div className="flex h-full flex-col rounded-[23px] bg-akua-white p-2 md:p-2.5">
        <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_50%_38%,var(--akua-white)_0%,var(--akua-tile)_70%)]">
          <Link href={href} aria-label={product.name} className="absolute inset-0 transition-transform duration-700 ease-akua group-hover:scale-[1.06]">
            <ProductVisual product={product} sizes={sizes} priority={priority} inset="p-[12%]" />
          </Link>
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-akua-white/90 px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.08em] text-akua-ink uppercase backdrop-blur">
            {category?.name}
          </span>
          <FavoriteButton productId={product.id} className="absolute top-2 right-2 size-8 rounded-full md:size-9" />
          <CardBadges product={product} className="pointer-events-none absolute bottom-2.5 left-2.5" />
          {product.stockStatus === "stock_faible" && (
            <span className="pointer-events-none absolute right-2.5 bottom-2.5 hidden rounded-full bg-akua-white/95 px-2.5 py-1 text-[11px] font-semibold text-akua-red sm:inline">Plus que {product.stockLeft}</span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-1.5 pt-3 pb-1 md:px-2">
          <h3 className="line-clamp-2 min-h-[2.6em] text-[14px] leading-[1.3] font-semibold tracking-[-0.01em] text-akua-ink md:text-[15.5px]">
            <Link href={href} className="hover:text-akua-blue">
              {product.name}
            </Link>
          </h3>
          <ProductRating productId={product.id} className="mt-1.5 text-[12px]" size="size-3.5" />

          <div className="mt-auto pt-2.5">
            {product.compareAtPrice ? (
              <p className="text-[12.5px] text-akua-gray-500 line-through tabular-nums md:text-[13px]">{formatFCFA(product.compareAtPrice)}</p>
            ) : (
              <p className="text-[12.5px] text-akua-gray-500 md:text-[13px]">{product.stockStatus === "sur_commande" ? "Sur commande" : "\u00a0"}</p>
            )}
            <p className={cn("text-[19px] leading-tight font-extrabold tracking-[-0.02em] tabular-nums md:text-[23px]", product.compareAtPrice ? "text-akua-blue" : "text-akua-ink")}>{formatFCFA(product.price)}</p>
            <AddToCartButton product={product} variant="full" label="Ajouter au panier" className="mt-3 h-10 gap-1.5 px-2 text-[12.5px] md:h-11 md:text-[13.5px]" />
          </div>
        </div>
      </div>
    </article>
  );
}

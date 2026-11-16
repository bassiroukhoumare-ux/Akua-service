"use client";

import { useMoney } from "@/components/currency";
import { PackageCheck, PackageMinus, PackageSearch, PackageX } from "lucide-react";
import Link from "next/link";
import { shelfLabel, useCatalog } from "@/components/catalog-provider";
import { discountPercent } from "@/lib/format";
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

/** État du stock : icône fine et sobre (noir), en rouge seulement quand il en reste peu. */
export function StockText({ product, className }: { product: Product; className?: string }) {
  const s = product.stockStatus;
  const base = "flex items-center gap-1.5 text-[12.5px] font-semibold";
  const icon = "size-[15px] shrink-0";
  if (s === "stock_faible")
    return (
      <p className={cn(base, "text-akua-red", className)}>
        <PackageMinus aria-hidden className={icon} strokeWidth={1.9} /> Plus que {product.stockLeft} en stock
      </p>
    );
  if (s === "sur_commande")
    return (
      <p className={cn(base, "text-akua-gray-500", className)}>
        <PackageSearch aria-hidden className={icon} strokeWidth={1.9} /> Sur commande
      </p>
    );
  if (s === "rupture")
    return (
      <p className={cn(base, "text-akua-gray-500", className)}>
        <PackageX aria-hidden className={icon} strokeWidth={1.9} /> Rupture de stock
      </p>
    );
  return (
    <p className={cn(base, "text-akua-ink", className)}>
      <PackageCheck aria-hidden className={icon} strokeWidth={1.9} /> En stock
    </p>
  );
}

export function CardBadges({ product, className }: { product: Product; className?: string }) {
  const pct = discountPercent(product.price, product.compareAtPrice);
  let b: { label: string; tone: string } | null = null;
  if (pct) b = { label: `-${pct} %`, tone: "bg-akua-red text-akua-white" };
  else if (product.badges.includes("nouveau")) b = { label: "Nouveau", tone: "bg-akua-blue text-akua-white" };
  else if (product.badges.includes("best-seller")) b = { label: "Top vente", tone: "bg-akua-white text-akua-ink ring-1 ring-akua-gray-200" };
  if (!b) return null;
  return <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-bold", b.tone, className)}>{b.label}</span>;
}

/**
 * Carte produit : cadre blanc et fin contour, visuel sur tuile douce, remise et favori sur la photo,
 * puis rayon, nom, note (ou stock), prix et ajout au panier sur une même ligne.
 */
export function ProductCard({ product, className, priority, sizes = "(min-width:1024px) 23vw, (min-width:768px) 31vw, 48vw" }: ProductCardProps) {
  const { categories } = useCatalog();
  const money = useMoney();
  const href = `/produit/${product.slug}`;
  const promo = !!product.compareAtPrice;

  return (
    <article
      className={cn(
        "glow-card group @container flex h-full flex-col overflow-hidden rounded-[12px] border border-akua-gray-200 bg-akua-white",
        className,
      )}
    >
      {/* visuel */}
      <div className="relative aspect-square overflow-hidden border-b border-akua-gray-200 bg-akua-tile">
        <Link href={href} aria-label={product.name} className="absolute inset-0 transition-transform duration-700 ease-akua group-hover:scale-[1.07]">
          <ProductVisual product={product} sizes={sizes} priority={priority} inset="p-[11%]" />
        </Link>
        <CardBadges product={product} className="pointer-events-none absolute top-2.5 left-2.5" />
        <FavoriteButton productId={product.id} className="absolute top-2 right-2 size-8 rounded-full" />
      </div>

      {/* informations */}
      <div className="flex flex-1 flex-col p-3 @min-[250px]:p-4">
        <p className="truncate text-[10px] font-semibold tracking-[0.1em] text-akua-gray-500 uppercase @min-[250px]:text-[10.5px]">{shelfLabel(product, categories)}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.6em] text-[13.5px] leading-[1.3] font-semibold text-akua-ink @min-[250px]:text-[15px]">
          <Link href={href} className="transition-colors hover:text-akua-blue">
            {product.name}
          </Link>
        </h3>
        <div className="mt-1.5 flex h-5 items-center">
          <ProductRating productId={product.id} className="text-[12px]" size="size-3.5" fallback={<StockText product={product} className="text-[12px]" />} />
        </div>

        <div className="mt-auto pt-3">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-num text-[17px] leading-tight font-extrabold tracking-[-0.03em] text-akua-blue tabular-nums @min-[250px]:text-[20px]">{money(product.price)}</span>
            {promo && <span className="text-[11.5px] leading-tight text-akua-gray-500 line-through tabular-nums @min-[250px]:text-[12.5px]">{money(product.compareAtPrice!)}</span>}
          </p>
          <AddToCartButton product={product} variant="block" label="Ajouter au panier" className="mt-3" />
        </div>
      </div>
    </article>
  );
}

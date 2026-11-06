"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { useHydrated } from "@/lib/use-hydrated";
import { useFavorites } from "@/store/favorites";
import type { Product } from "@/types/catalog";

export function FavoritesView({ products }: { products: Product[] }) {
  const hydrated = useHydrated();
  const ids = useFavorites((s) => s.ids);
  const list = hydrated ? products.filter((p) => ids.includes(p.id)) : [];

  return (
    <div className="container-akua pt-4 pb-16 md:pt-8">
      <h1 className="font-display text-[34px] font-semibold md:text-[48px]">Mes favoris</h1>
      {list.length ? (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-[28px] bg-akua-tile px-6 py-20 text-center">
          <Heart aria-hidden className="size-14 text-akua-red" strokeWidth={1.2} />
          <p className="mt-5 font-display text-[22px] font-semibold">Aucun favori pour l&apos;instant</p>
          <p className="mt-2 max-w-sm text-[14px] text-akua-gray-500">Touchez le cœur sur un produit pour le retrouver ici.</p>
          <Link href="/boutique" className="btn-shine mt-6 inline-flex h-12 items-center rounded-full bg-akua-ink px-6 font-semibold text-akua-white">
            Parcourir la boutique
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMoney } from "@/components/currency";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { Product } from "@/types/catalog";
import { AddToCartButton, BuyNowButton } from "./add-to-cart-button";
import { FavoriteButton } from "./favorite-button";
import { CardBadges } from "./product-card";
import { ProductVisual } from "./product-visual";

export function ProductGallery({ product }: { product: Product }) {
  const [i, setI] = useState(0);
  const images = product.images;

  return (
    <div className="lg:sticky lg:top-[144px]">
      <div className="group relative aspect-square overflow-hidden rounded-[32px] bg-akua-tile">
        <motion.div key={i} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 transition-transform duration-700 ease-akua md:group-hover:scale-[1.08]">
          <ProductVisual product={product} src={images[i]} sizes="(min-width:1024px) 50vw, 100vw" priority inset="p-[11%]" />
        </motion.div>
        <CardBadges product={product} className="pointer-events-none absolute top-5 left-5" />
        <FavoriteButton productId={product.id} className="absolute top-5 right-5 size-11 rounded-full" />
        {images.length > 1 && (
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
            {images.map((img, idx) => (
              <span key={img} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-5 bg-akua-ink" : "w-1.5 bg-akua-ink/25")} />
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3" role="radiogroup" aria-label="Photos du produit">
          {images.map((img, idx) => (
            <button
              key={img}
              type="button"
              role="radio"
              aria-checked={i === idx}
              aria-label={`Photo ${idx + 1}`}
              onClick={() => setI(idx)}
              className={cn("relative aspect-square overflow-hidden rounded-2xl bg-akua-tile ring-2 transition-all", i === idx ? "ring-akua-ink" : "ring-transparent hover:ring-akua-gray-200")}
            >
              <ProductVisual product={product} src={img} sizes="120px" inset="p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PurchaseBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const money = useMoney();
  const wa = buildWhatsAppLink([{ name: product.name, price: product.price, quantity: qty }]);

  return (
    <>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="flex h-[52px] items-center rounded-full border border-akua-gray-200">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuer la quantité" className="grid size-[52px] place-items-center rounded-full hover:bg-akua-tile">
            <Minus aria-hidden className="size-4" />
          </button>
          <span className="w-8 text-center text-[16px] font-semibold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Augmenter la quantité" className="grid size-[52px] place-items-center rounded-full hover:bg-akua-tile">
            <Plus aria-hidden className="size-4" />
          </button>
        </div>
        <AddToCartButton product={product} quantity={qty} label="Ajouter au panier" className="h-[52px] flex-1 px-6 text-[15px]" />
      </div>
      <BuyNowButton product={product} quantity={qty} label="Commander maintenant" className="mt-3 h-[56px] w-full text-[15.5px]" />
      <a href={wa} target="_blank" rel="noopener" className="mt-3 flex h-11 items-center justify-center gap-2 text-[14px] font-semibold text-akua-ink transition-colors hover:text-akua-blue">
        <WhatsAppIcon size={20} variant="color" /> Une question ? Écrivez-nous sur WhatsApp
      </a>

      {/* Barre d'achat fixe mobile */}
      <div className="fixed inset-x-2.5 bottom-[calc(74px+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 rounded-[22px] border border-akua-gray-200 bg-akua-white/95 shadow-[0_18px_40px_-18px_rgb(11_16_32/0.35)] px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="min-w-0">
          <p className="price text-[20px] leading-tight">{money(product.price * qty)}</p>
          {product.compareAtPrice && <p className="text-[12px] text-akua-gray-500 line-through decoration-akua-red/70">{money(product.compareAtPrice * qty)}</p>}
        </div>
        <AddToCartButton product={product} quantity={qty} variant="icon" className="ml-auto size-12" />
        <BuyNowButton product={product} quantity={qty} className="h-12 flex-1" />
      </div>
    </>
  );
}

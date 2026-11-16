"use client";

import { Check, Plus, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btn } from "@/lib/btn";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import type { Product } from "@/types/catalog";

type CartProduct = Pick<Product, "id" | "slug" | "name" | "price" | "categoryId" | "images">;

export function useAddToCart() {
  const add = useCart((s) => s.add);
  const notify = useUI((s) => s.notifyAdded);
  return (product: CartProduct, quantity = 1) => {
    add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, categoryId: product.categoryId, image: product.images[0] }, quantity);
    notify({ name: product.name, price: product.price, image: product.images[0], quantity });
  };
}

interface AddToCartButtonProps {
  product: CartProduct;
  variant?: "icon" | "outline" | "full" | "compact" | "block";
  quantity?: number;
  className?: string;
  label?: string;
}

/** Ajoute au panier et affiche la confirmation. */
export function AddToCartButton({ product, variant = "outline", quantity = 1, className, label = "Ajouter" }: AddToCartButtonProps) {
  const addToCart = useAddToCart();
  const [done, setDone] = useState(false);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity);
    setDone(true);
    window.setTimeout(() => setDone(false), 1500);
  }

  // carte produit : pastille ronde sur les cartes étroites, « Ajouter » avec l'icône quand la carte est assez large
  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Ajouter ${product.name} au panier`}
        className={cn(
          "glow-ink relative inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-0 text-[13px] font-semibold text-akua-white transition-[background-color,box-shadow,transform] duration-300 active:scale-95 @min-[250px]:px-4",
          done ? "bg-akua-blue" : "bg-akua-ink hover:bg-akua-blue",
          className,
        )}
      >
        {done ? <Check aria-hidden className="size-[18px]" strokeWidth={2.5} /> : <ShoppingBag aria-hidden className="size-[17px]" strokeWidth={2} />}
        <span className="hidden @min-[250px]:inline">{done ? "Ajouté" : label}</span>
      </button>
    );
  }

  // carte produit : bouton sur toute la largeur, contour bleu qui se remplit au survol
  if (variant === "block") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Ajouter ${product.name} au panier`}
        className={cn(
          "glow-blue flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border text-[13px] font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-300 active:scale-[0.98]",
          done ? "border-akua-blue bg-akua-blue text-akua-white" : "border-akua-ink bg-akua-white text-akua-ink hover:border-akua-blue hover:bg-akua-blue hover:text-akua-white",
          className,
        )}
      >
        {done ? <Check aria-hidden className="size-4 shrink-0" strokeWidth={2.5} /> : <ShoppingBag aria-hidden className="size-4 shrink-0" strokeWidth={2} />}
        <span className="truncate">{done ? "Ajouté" : label}</span>
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button type="button" onClick={onClick} aria-label={`Ajouter ${product.name} au panier`} className={btn({ variant: done ? "primary" : "dark", size: "icon", className })}>
        {done ? <Check aria-hidden className="size-[18px]" strokeWidth={2.5} /> : <Plus aria-hidden className="size-5" strokeWidth={2.25} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={btn({ variant: variant === "outline" ? "outline" : "primary", size: "md", className: cn(variant === "full" && "w-full", done && variant === "outline" && "border-akua-blue text-akua-blue", className) })}
    >
      {done ? <Check aria-hidden className="size-4" strokeWidth={2.5} /> : <ShoppingBag aria-hidden className="size-4" strokeWidth={2} />}
      <span className="relative z-[2]">{done ? "Ajouté" : label}</span>
    </button>
  );
}

/** « Commander » : ajoute au panier puis ouvre la page de commande. */
export function BuyNowButton({ product, quantity = 1, className, label = "Commander" }: { product: CartProduct; quantity?: number; className?: string; label?: string }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, categoryId: product.categoryId, image: product.images[0] }, quantity);
        router.push("/panier");
      }}
      className={btn({ variant: "dark", size: "md", className })}
    >
      <span className="relative z-[2]">{label}</span>
    </button>
  );
}

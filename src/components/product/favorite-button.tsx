"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/store/favorites";

export function FavoriteButton({ productId, className }: { productId: string; className?: string }) {
  const hydrated = useHydrated();
  const active = useFavorites((s) => s.ids.includes(productId)) && hydrated;
  const toggle = useFavorites((s) => s.toggle);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={active}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        "grid size-8 place-items-center rounded-[10px] bg-akua-white shadow-[0_2px_8px_-2px_rgb(11_16_32/0.15)] transition-colors",
        className,
      )}
    >
      <motion.span key={String(active)} initial={{ scale: active ? 0.6 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
        <Heart
          aria-hidden
          strokeWidth={2}
          className={cn("size-4", active ? "fill-akua-red text-akua-red" : "text-akua-gray-500")}
        />
      </motion.span>
    </motion.button>
  );
}

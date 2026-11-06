"use client";

import { Star } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { summarize, useReviews } from "@/store/reviews";

/** Étoiles (remplissage partiel) pour une note sur 5. */
export function Stars({ value, size = "size-3.5", className }: { value: number; size?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={cn("relative", size)}>
            <Star className={cn("absolute inset-0 fill-akua-gray-200 text-akua-gray-200", size)} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("fill-akua-yellow text-akua-yellow", size)} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Note d'un produit calculée à partir des avis publiés. */
export function ProductRating({ productId, className, size = "size-3.5" }: { productId: string; className?: string; size?: string }) {
  const hydrated = useHydrated();
  const reviews = useReviews((s) => s.reviews);
  const { average, count } = summarize(hydrated ? reviews : [], productId);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12.5px] text-akua-gray-500", className)} aria-label={count ? `Note ${average.toFixed(1)} sur 5, ${count} avis` : "Aucun avis pour le moment"}>
      <Stars value={average} size={size} />
      {count ? (
        <>
          <span className="font-semibold text-akua-ink">{average.toFixed(1)}</span>
          <span>({count} avis)</span>
        </>
      ) : (
        <span>0 avis</span>
      )}
    </span>
  );
}

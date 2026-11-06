"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  className?: string;
  tone?: "light" | "dark";
}

export function CarouselArrows({ onPrev, onNext, canPrev = true, canNext = true, className, tone = "light" }: CarouselArrowsProps) {
  const base =
    "grid size-8 place-items-center rounded-full border transition-colors disabled:opacity-35 " +
    (tone === "light"
      ? "border-akua-gray-200 bg-akua-white text-akua-ink hover:border-akua-blue hover:bg-akua-blue hover:text-akua-white"
      : "border-akua-line-dark bg-akua-surface-dark text-akua-white hover:border-akua-blue hover:bg-akua-blue");
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button type="button" onClick={onPrev} disabled={!canPrev} aria-label="Précédent" className={base}>
        <ChevronLeft aria-hidden className="size-4" />
      </button>
      <button type="button" onClick={onNext} disabled={!canNext} aria-label="Suivant" className={base}>
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </div>
  );
}

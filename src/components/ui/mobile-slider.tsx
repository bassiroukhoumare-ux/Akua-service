"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileSliderProps {
  children: ReactNode;
  /** largeur d'une diapositive sur mobile (classe Tailwind) */
  slideClass?: string;
  /** grille affichée à partir de md (pas de défilement sur ordinateur) */
  gridClass: string;
  label: string;
  speed?: number;
}

/**
 * Mobile : défilement continu de droite à gauche, sans fin, qui s'arrête quand on touche
 * et reprend ensuite, avec boutons précédent / suivant. Ordinateur : grille classique.
 */
export function MobileSlider({ children, slideClass = "w-[44%]", gridClass, label, speed = 0.6 }: MobileSliderProps) {
  const items = Children.toArray(children);
  const [ref, api] = useEmblaCarousel({ loop: true, align: "start", dragFree: true }, [
    AutoScroll({ speed, startDelay: 600, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true }),
  ]);

  const step = (dir: -1 | 1) => {
    if (!api) return;
    const auto = api.plugins().autoScroll;
    auto?.stop();
    if (dir === 1) api.scrollNext();
    else api.scrollPrev();
    window.setTimeout(() => auto?.play(), 1800);
  };

  const arrow = "grid size-10 place-items-center rounded-full border border-akua-gray-200 bg-akua-white text-akua-ink shadow-[0_6px_16px_-8px_rgb(11_16_32/0.3)] active:scale-95";

  return (
    <>
      <div className="md:hidden">
        <div ref={ref} className="overflow-hidden" aria-roledescription="carrousel" aria-label={label}>
          <div className="flex touch-pan-y gap-3 px-4">
            {items.map((child, i) => (
              <div key={i} className={cn("min-w-0 shrink-0", slideClass)}>
                {child}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="Précédent" className={arrow}>
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Suivant" className={arrow}>
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
      <div className={cn("hidden md:grid", gridClass)}>{items}</div>
    </>
  );
}

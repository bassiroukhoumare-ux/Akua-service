"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import type { Platform, Product } from "@/types/catalog";

interface ProductCarouselProps {
  eyebrow: string;
  title: string;
  products: Product[];
  /** filtres par plateforme (null = tout) */
  filters?: { id: string; label: string; platforms: Platform[] | null }[];
  /** défilement automatique (droite → gauche) sur mobile */
  autoplay?: boolean;
}

/** Carrousel « Explorez nos recommandations » (réf.), filtres optionnels. */
export function ProductCarousel({ eyebrow, title, products, filters, autoplay }: ProductCarouselProps) {
  const [ref, api] = useEmblaCarousel(
    autoplay ? { align: "start", loop: true } : { align: "start", containScroll: "trimSnaps", dragFree: true },
    autoplay ? [Autoplay({ delay: 2800, stopOnInteraction: false, stopOnMouseEnter: true, active: false, breakpoints: { "(max-width: 767px)": { active: true } } })] : [],
  );
  const [can, setCan] = useState({ prev: false, next: true });
  const [f, setF] = useState(filters?.[0]?.id);
  const list = useMemo(() => {
    const flt = filters?.find((x) => x.id === f);
    return flt?.platforms ? products.filter((p) => p.platforms.some((pl) => flt.platforms!.includes(pl))) : products;
  }, [products, filters, f]);

  useEffect(() => {
    if (!api) return;
    const on = () => setCan({ prev: api.canScrollPrev(), next: api.canScrollNext() });
    api.reInit();
    api.scrollTo(0, true);
    on();
    api.on("select", on).on("reInit", on).on("scroll", on);
    return () => {
      api.off("select", on).off("reInit", on).off("scroll", on);
    };
  }, [api, list]);

  const arrow = "grid size-11 place-items-center rounded-full border border-akua-gray-200 text-akua-ink transition-colors duration-200 hover:border-akua-ink disabled:opacity-35 disabled:hover:border-akua-gray-200";

  return (
    <section aria-label={title} className="pt-10 md:pt-14">
      <Reveal className="container-akua flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold tracking-[-0.01em] md:text-[24px]">{title}</h2>
          <p className="text-[13.5px] text-akua-gray-500">{eyebrow}</p>
        </div>
        <div className="flex items-center gap-3">
          {filters && (
            <div role="tablist" className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {filters.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="tab"
                  aria-selected={f === x.id}
                  onClick={() => setF(x.id)}
                  className={cn("h-10 shrink-0 rounded-full px-4 text-[13.5px] font-medium transition-colors", f === x.id ? "bg-akua-ink text-akua-white" : "border border-akua-gray-200 hover:border-akua-ink")}
                >
                  {x.label}
                </button>
              ))}
            </div>
          )}
          <div className="hidden gap-2 md:flex">
            <button type="button" onClick={() => api?.scrollPrev()} disabled={!can.prev} aria-label="Précédent" className={arrow}>
              <ArrowLeft aria-hidden className="size-[18px]" />
            </button>
            <button type="button" onClick={() => api?.scrollNext()} disabled={!can.next} aria-label="Suivant" className={arrow}>
              <ArrowRight aria-hidden className="size-[18px]" />
            </button>
          </div>
        </div>
      </Reveal>
      <div ref={ref} className="mt-4 overflow-hidden">
        <div className="flex gap-2.5 px-4 md:gap-3.5 md:px-[max(24px,calc((100vw-1320px)/2+32px))]">
          {list.map((p) => (
            <div key={p.id} className="w-[47%] shrink-0 sm:w-[31%] lg:w-[23.5%] xl:w-[302px]">
              <ProductCard product={p} sizes="300px" />
            </div>
          ))}
          <div aria-hidden className="w-1 shrink-0" />
        </div>
      </div>
    </section>
  );
}

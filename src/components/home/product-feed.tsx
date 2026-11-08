"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/reveal";
import { btn } from "@/lib/btn";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import { SectionHeading } from "./section-heading";

const TABS = [
  { id: "all", label: "Tout" },
  { id: "cat-consoles", label: "Consoles" },
  { id: "cat-manettes", label: "Manettes" },
  { id: "cat-jeux", label: "Jeux" },
  { id: "cat-packs", label: "Packs" },
  { id: "promo", label: "Promos" },
];

/** Catalogue : onglets segmentés, grille 4 colonnes (desktop) / 2 (mobile). */
export function ProductFeed({ products, initial = 8 }: { products: Product[]; initial?: number }) {
  const [tab, setTab] = useState("all");
  const [n, setN] = useState(initial);
  const list = useMemo(() => {
    if (tab === "all") return products;
    if (tab === "promo") return products.filter((p) => p.compareAtPrice);
    return products.filter((p) => p.categoryId === tab);
  }, [products, tab]);

  return (
    <section aria-labelledby="catalogue" className="container-akua pt-14 md:pt-20">
      <Reveal>
        <SectionHeading index="02" eyebrow="Catalogue" centerMobile title={<span id="catalogue">Nos produits disponibles.</span>}>
          <div role="tablist" aria-label="Filtrer le catalogue" className="no-scrollbar -mx-4 flex w-[calc(100%+32px)] overflow-x-auto px-4 md:mx-0 md:w-auto md:px-0">
            <div className="mx-auto flex shrink-0 rounded-full bg-akua-page p-1 md:mx-0">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => {
                    setTab(t.id);
                    setN(initial);
                  }}
                  className={cn("relative h-9 rounded-full px-3 text-[13px] font-semibold whitespace-nowrap transition-colors min-[400px]:px-3.5 md:px-4 md:text-[13.5px]", tab === t.id ? "text-akua-white" : "text-akua-gray-500 hover:text-akua-ink")}
                >
                  {tab === t.id && <motion.span layoutId="feed-tab" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-akua-ink" />}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </SectionHeading>
      </Reveal>
      <div className="mt-7 grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {list.slice(0, n).map((p, i) => (
          <motion.div key={`${tab}-${p.id}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: (i % 8) * 0.035, ease: [0.22, 1, 0.36, 1] }}>
            <ProductCard product={p} priority={i < 4} />
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {n < list.length && (
          <button type="button" onClick={() => setN((v) => v + 8)} className={btn({ variant: "outline", size: "lg" })}>
            Afficher plus <ChevronDown aria-hidden className="size-4" />
          </button>
        )}
        <Link href="/boutique" className={btn({ variant: "dark", size: "lg" })}>
          Toute la boutique <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </section>
  );
}

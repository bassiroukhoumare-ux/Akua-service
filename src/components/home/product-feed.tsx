"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/reveal";
import { btn } from "@/lib/btn";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";
import { SectionHeading } from "./section-heading";

/** Mélange les catégories à tour de rôle : l'onglet « Tout » montre chaque univers dès la première ligne. */
function interleave(products: Product[], order: string[]) {
  const buckets = order.map((id) => products.filter((p) => p.categoryId === id));
  const rest = products.filter((p) => !order.includes(p.categoryId));
  const out: Product[] = [];
  for (let i = 0; buckets.some((b) => i < b.length); i++) for (const b of buckets) if (b[i]) out.push(b[i]);
  return [...out, ...rest];
}

/** Catalogue : onglets segmentés, 16 produits (4 lignes sur ordinateur), puis « Afficher plus » et lien vers la boutique. */
export function ProductFeed({ products, initial = 16, eyebrow = "Catalogue", title = "Nos produits disponibles." }: { products: Product[]; initial?: number; eyebrow?: string; title?: string }) {
  const [tab, setTab] = useState("all");
  const [n, setN] = useState(initial);
  const { categories } = useCatalog();
  const TABS = useMemo(() => [{ id: "all", label: "Tout" }, ...categories.filter((c) => c.slug !== "promos").map((c) => ({ id: c.id, label: c.shortName ?? c.name })), { id: "promo", label: "Promos" }], [categories]);
  const list = useMemo(() => {
    if (tab === "all") return interleave(products, categories.map((c) => c.id));
    if (tab === "promo") return products.filter((p) => p.compareAtPrice);
    return products.filter((p) => p.categoryId === tab);
  }, [products, tab, categories]);
  const shown = Math.min(n, list.length);
  // le bouton mène à la boutique entière, ou à la catégorie de l'onglet choisi
  const current = categories.find((c) => c.id === tab);
  const shopHref = tab === "promo" ? "/boutique/promos" : current ? `/boutique/${current.slug}` : "/boutique";
  const shopLabel = current ? `Tout voir : ${current.shortName ?? current.name}` : tab === "promo" ? "Toutes les promos" : "Toute la boutique";

  return (
    <section aria-labelledby="catalogue" className="container-akua pt-14 md:pt-20">
      <Reveal>
        <SectionHeading index="01" eyebrow={eyebrow} centerMobile title={<span id="catalogue">{title}</span>}>
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
      <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-5 md:mt-12">
        <div className="w-full text-center" aria-live="polite">
          <p className="text-[13.5px] text-akua-gray-500">
            <span className="font-bold text-akua-ink tabular-nums">{shown}</span> produit{shown > 1 ? "s" : ""} sur <span className="font-bold text-akua-ink tabular-nums">{list.length}</span>
          </p>
          <div className="mx-auto mt-2.5 h-1 w-48 overflow-hidden rounded-full bg-akua-gray-200">
            <motion.div className="h-full rounded-full bg-akua-blue" initial={false} animate={{ width: `${list.length ? (shown / list.length) * 100 : 0}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        </div>
        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:justify-center">
          {shown < list.length && (
            <button type="button" onClick={() => setN((v) => v + 8)} className={btn({ variant: "outline", size: "lg", className: "w-full sm:w-auto" })}>
              Afficher plus <ChevronDown aria-hidden className="size-4" />
            </button>
          )}
          <Link href={shopHref} className={btn({ variant: "dark", size: "lg", className: "w-full sm:w-auto" })}>
            {shopLabel} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { formatFCFA } from "@/lib/format";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";

const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const POPULAR = ["Manette PS4", "FC 27", "PS4 Slim", "Switch 2", "DualSense", "Volant"];

/** Recherche minimaliste : ligne de saisie, suggestions en texte, catégories en icônes, résultats épurés. */
export function SearchDialog() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const router = useRouter();

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return products.filter((p) => p.isFeatured).slice(0, 5);
    return products.filter((p) => norm(`${p.name} ${p.shortDescription} ${p.platforms.join(" ")}`).includes(n)).slice(0, 8);
  }, [q]);

  const close = () => {
    setOpen(false);
    setQ("");
  };
  const submit = () => {
    close();
    router.push(q.trim() ? `/boutique?q=${encodeURIComponent(q.trim())}` : "/boutique");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "top-0 left-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-akua-white p-0",
          "data-[state=open]:animate-[akua-search-in_0.28s_cubic-bezier(0.22,1,0.36,1)]",
          "sm:top-[72px] sm:left-1/2 sm:h-auto sm:max-h-[80vh] sm:w-[calc(100%-32px)] sm:max-w-[640px] sm:-translate-x-1/2 sm:rounded-[24px] sm:border sm:border-akua-gray-200 sm:shadow-[0_40px_80px_-40px_rgb(11_16_32/0.4)]",
        )}
      >
        <DialogTitle className="sr-only">Rechercher un produit</DialogTitle>

        {/* ligne de saisie */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-3 border-b border-akua-gray-200 px-4 sm:px-6"
        >
          <Search aria-hidden className="size-5 shrink-0 text-akua-blue" strokeWidth={1.8} />
          <label htmlFor="global-search" className="sr-only">
            Rechercher
          </label>
          <input
            id="global-search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Console, manette, jeu…"
            enterKeyHint="search"
            className="h-16 min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-akua-gray-500"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Effacer" className="text-akua-gray-500 hover:text-akua-ink">
              <X aria-hidden className="size-[18px]" strokeWidth={1.8} />
            </button>
          )}
          <button type="button" onClick={close} className="shrink-0 text-[14px] font-semibold text-akua-ink hover:text-akua-blue">
            Annuler
          </button>
        </form>

        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 sm:px-6">
          {!q && (
            <>
              <p className="text-[11.5px] font-semibold tracking-[0.14em] text-akua-gray-500 uppercase">Recherches populaires</p>
              <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
                {POPULAR.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => setQ(s)} className="group inline-flex items-center gap-1 text-[15px] font-medium text-akua-ink hover:text-akua-blue">
                      {s}
                      <ArrowUpRight aria-hidden className="size-3.5 text-akua-gray-500 group-hover:text-akua-blue" />
                    </button>
                  </li>
                ))}
              </ul>

              <p className="mt-7 text-[11.5px] font-semibold tracking-[0.14em] text-akua-gray-500 uppercase">Catégories</p>
              <ul className="mt-2 grid grid-cols-4 gap-y-1">
                {categories.map((c) => {
                  const Icon = getCategoryIcon(c.icon);
                  return (
                    <li key={c.id}>
                      <Link href={`/boutique/${c.slug}`} onClick={close} className="group flex flex-col items-center gap-1.5 py-3 text-center">
                        <Icon aria-hidden className="size-6 text-akua-ink transition-colors group-hover:text-akua-blue" strokeWidth={1.4} />
                        <span className="text-[11.5px] font-semibold whitespace-nowrap group-hover:text-akua-blue">{c.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <p className={cn("text-[11.5px] font-semibold tracking-[0.14em] text-akua-gray-500 uppercase", !q && "mt-6")}>
            {q ? `${results.length} résultat${results.length > 1 ? "s" : ""}` : "Produits populaires"}
          </p>
          <ul className="mt-1 divide-y divide-akua-gray-200">
            {results.map((p) => (
              <li key={p.id}>
                <Link href={`/produit/${p.slug}`} onClick={close} className="group flex items-center gap-3.5 py-3">
                  <span className="relative size-12 shrink-0">
                    <Image src={p.images[0]} alt="" fill sizes="48px" className={p.images[0].includes("/fb-") || p.categoryId === "cat-simulation" ? "rounded-lg object-cover" : "object-contain"} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold group-hover:text-akua-blue">{p.name}</span>
                    <span className="block text-[12.5px] text-akua-gray-500">{categories.find((c) => c.id === p.categoryId)?.name}</span>
                  </span>
                  <span className={cn("shrink-0 text-[14.5px] font-extrabold tabular-nums", p.compareAtPrice ? "text-akua-blue" : "text-akua-ink")}>{formatFCFA(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>

          {q && results.length === 0 && (
            <div className="py-12 text-center">
              <Search aria-hidden className="mx-auto size-10 text-akua-gray-200" strokeWidth={1.3} />
              <p className="mt-3 text-[16px] font-bold">Aucun produit trouvé</p>
              <p className="mt-1 text-[14px] text-akua-gray-500">Essayez un autre mot-clé.</p>
            </div>
          )}
          {q && results.length > 0 && (
            <button type="button" onClick={submit} className="group mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-akua-blue">
              Voir tous les résultats pour « {q} » <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

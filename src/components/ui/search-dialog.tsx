"use client";

import { ArrowRight, ArrowUpRight, CornerDownLeft, Search, X } from "lucide-react";
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

/**
 * iOS n'ouvre le clavier que si un champ reçoit le focus pendant le toucher lui-même.
 * On donne donc le focus à un champ invisible au moment du clic ; la recherche le transfère
 * ensuite à son vrai champ et le clavier reste ouvert.
 */
export function primeKeyboard() {
  if (typeof document === "undefined") return;
  const el = document.createElement("input");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = "position:fixed;top:0;left:0;opacity:0;height:0;font-size:16px;pointer-events:none";
  document.body.appendChild(el);
  el.focus();
  window.setTimeout(() => el.remove(), 1000);
}

const label = "text-[11px] font-bold tracking-[0.14em] text-akua-gray-500 uppercase";

/**
 * Recherche en panneau flottant : la page reste visible derrière, floutée.
 * Mobile : panneau compact en haut de l'écran. Ordinateur : panneau centré sous l'en-tête.
 */
export function SearchDialog() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const router = useRouter();

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return [];
    return products.filter((p) => norm(`${p.name} ${p.shortDescription} ${p.platforms.join(" ")}`).includes(n));
  }, [q]);
  const shown = results.slice(0, 6);

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
        aria-describedby={undefined}
        overlayClassName="bg-akua-ink/30 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px] duration-200"
        className={cn(
          // mobile : panneau flottant en haut, la page reste visible en dessous
          "top-3 left-3 flex max-h-[min(72dvh,620px)] w-[calc(100%-24px)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-[26px] border border-akua-white/60 bg-akua-white p-0 text-akua-ink shadow-[0_30px_80px_-24px_rgb(11_16_32/0.45),0_2px_8px_rgb(11_16_32/0.06)] ring-0",
          "data-[state=open]:animate-[akua-search-in_0.32s_cubic-bezier(0.22,1,0.36,1)]",
          "sm:top-[76px] sm:left-1/2 sm:max-h-[min(78vh,680px)] sm:w-[calc(100%-32px)] sm:max-w-[660px] sm:-translate-x-1/2",
        )}
      >
        <DialogTitle className="sr-only">Rechercher un produit</DialogTitle>

        {/* ligne de saisie */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-2 p-2 sm:p-2.5"
        >
          <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-[18px] bg-akua-page px-3.5 ring-akua-blue/30 transition-shadow focus-within:bg-akua-white focus-within:ring-2 sm:h-14 sm:px-4">
            <Search aria-hidden className="size-[19px] shrink-0 text-akua-blue" strokeWidth={2} />
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
              type="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-full min-w-0 flex-1 bg-transparent text-[16px] font-medium outline-none placeholder:font-normal placeholder:text-akua-gray-500 sm:text-[17px] [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Effacer la recherche" className="grid size-6 shrink-0 place-items-center rounded-full bg-akua-gray-500/15 text-akua-ink transition-colors hover:bg-akua-gray-500/25">
                <X aria-hidden className="size-3.5" strokeWidth={2.4} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer la recherche"
            className="grid size-12 shrink-0 place-items-center rounded-[18px] text-akua-ink transition-colors hover:bg-akua-page sm:size-14"
          >
            <X aria-hidden className="size-5" strokeWidth={1.8} />
          </button>
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-akua-gray-200 px-4 pt-4 pb-5 sm:px-5 sm:pt-5">
          {!q && (
            <>
              <p className={label}>Recherches populaires</p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {POPULAR.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => setQ(s)}
                      className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-akua-gray-200 px-3.5 text-[13.5px] font-medium transition-colors hover:border-akua-blue hover:text-akua-blue"
                    >
                      {s}
                      <ArrowUpRight aria-hidden className="size-3.5 text-akua-gray-500 transition-colors group-hover:text-akua-blue" />
                    </button>
                  </li>
                ))}
              </ul>

              <p className={cn(label, "mt-6")}>Parcourir les rayons</p>
              <ul className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
                {categories.map((c) => {
                  const Icon = getCategoryIcon(c.icon);
                  return (
                    <li key={c.id} className="shrink-0">
                      <Link
                        href={`/boutique/${c.slug}`}
                        onClick={close}
                        className="group flex h-[76px] w-[84px] flex-col items-center justify-center gap-1.5 rounded-[18px] bg-akua-page text-center transition-colors hover:bg-akua-blue-100 sm:w-auto"
                      >
                        <Icon aria-hidden className="size-6 text-akua-ink transition-colors group-hover:text-akua-blue" strokeWidth={1.4} />
                        <span className="text-[11.5px] font-semibold whitespace-nowrap group-hover:text-akua-blue">{c.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {q && results.length > 0 && (
            <>
              <p className={label} aria-live="polite">
                {results.length} produit{results.length > 1 ? "s" : ""}
              </p>
              <ul className="-mx-2 mt-2">
                {shown.map((p) => (
                  <li key={p.id}>
                    <Link href={`/produit/${p.slug}`} onClick={close} className="group flex items-center gap-3 rounded-[16px] p-2 transition-colors hover:bg-akua-page">
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-[14px] bg-akua-tile">
                        <Image
                          src={p.images[0]}
                          alt=""
                          fill
                          sizes="56px"
                          className={p.images[0].includes("/fb-") || p.categoryId === "cat-simulation" ? "object-cover" : "object-contain p-1.5"}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-semibold group-hover:text-akua-blue">{p.name}</span>
                        <span className="block text-[12.5px] text-akua-gray-500">{categories.find((c) => c.id === p.categoryId)?.name}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className={cn("block text-[14.5px] font-extrabold tabular-nums", p.compareAtPrice ? "text-akua-blue" : "text-akua-ink")}>{formatFCFA(p.price)}</span>
                        {p.compareAtPrice && <span className="block text-[11.5px] text-akua-gray-500 tabular-nums line-through">{formatFCFA(p.compareAtPrice)}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {q && results.length === 0 && (
            <div className="py-8 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-akua-page">
                <Search aria-hidden className="size-5 text-akua-gray-500" strokeWidth={1.8} />
              </span>
              <p className="mt-3 text-[15.5px] font-bold">Aucun produit pour « {q.trim()} »</p>
              <p className="mt-1 text-[13.5px] text-akua-gray-500">Vérifiez l&apos;orthographe ou essayez un autre mot-clé.</p>
            </div>
          )}
        </div>

        {q && results.length > 0 && (
          <button
            type="button"
            onClick={submit}
            className="group flex h-14 shrink-0 items-center justify-between gap-3 border-t border-akua-gray-200 bg-akua-page/60 px-5 text-[14px] font-semibold text-akua-blue transition-colors hover:bg-akua-blue-100"
          >
            <span className="truncate">{results.length > 1 ? `Voir les ${results.length} résultats` : "Voir le résultat dans la boutique"}</span>
            <span className="flex items-center gap-2 text-akua-gray-500">
              <CornerDownLeft aria-hidden className="hidden size-4 sm:block" />
              <ArrowRight aria-hidden className="size-4 text-akua-blue transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

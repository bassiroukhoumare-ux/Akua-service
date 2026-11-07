"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronRight, Heart, LayoutGrid, Package, Percent, Search, ShieldCheck, ShoppingBag, Newspaper, Store, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { primeKeyboard } from "@/components/ui/search-dialog";
import { TopBanner } from "./top-banner";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { btn } from "@/lib/btn";
import { discountPercent, formatFCFA } from "@/lib/format";
import { getCategoryIcon } from "@/lib/icons";
import { HOME_VISUAL } from "@/config/home-visual";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { selectCount, selectTotal, useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { useUI } from "@/store/ui";

type MegaKind = "shop" | "offers";
const NAV: { label: string; href: string; mega?: MegaKind; match?: string[] }[] = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique", mega: "shop" },
  { label: "Offres", href: "/boutique/promos", mega: "offers", match: ["/packs", "/boutique/promos"] },
  { label: "Vente en gros", href: "/vente-en-gros" },
  { label: "Contact", href: "/contact" },
];

const COVER = (src: string) => src.includes("/fb-") || src.includes("g29") || src.includes("camera");

/* --------------------------------------------------------------- méga-menus */

const panel =
  "absolute inset-x-4 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[28px] min-[1368px]:inset-x-0 border border-akua-gray-200 bg-akua-white shadow-[0_40px_80px_-40px_rgb(11_16_32/0.45)]";
const motionProps = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};
const eyebrow = "text-[11.5px] font-semibold tracking-[0.14em] text-akua-gray-500 uppercase";

/** Bandeau de réassurance commun aux deux menus. */
function MenuFooter({ href, label, onClose }: { href: string; label: string; onClose: () => void }) {
  const items = [
    { icon: Truck, t: "Livraison au Togo et dans la sous-région" },
    { icon: Store, t: "Retrait gratuit en boutique" },
    { icon: ShieldCheck, t: "Produits testés et garantis" },
  ];
  return (
    <div className="flex items-center justify-between gap-6 border-t border-akua-gray-200 bg-akua-page px-6 py-3.5">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
        {items.map(({ icon: Icon, t }) => (
          <li key={t} className="flex items-center gap-2 text-[12.5px] font-medium text-akua-gray-500">
            <Icon aria-hidden className="size-4 text-akua-blue" strokeWidth={1.8} />
            {t}
          </li>
        ))}
      </ul>
      <Link href={href} onClick={onClose} className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-akua-blue">
        {label} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  const quick = [
    { href: "/boutique?tri=nouveautes", icon: Newspaper, t: "Nouveautés" },
    { href: "/boutique/promos", icon: Percent, t: "Promotions" },
    { href: "/packs", icon: Package, t: "Packs prêts à jouer" },
    { href: "/vente-en-gros", icon: Store, t: "Vente en gros" },
    { href: "/boutique", icon: LayoutGrid, t: "Toute la boutique" },
  ];
  return (
    <motion.div {...motionProps} className={panel}>
      <div className="grid grid-cols-[minmax(0,1fr)_220px_236px] gap-6 p-6">
        {/* Rayons */}
        <div className="min-w-0">
          <p className={eyebrow}>Nos rayons</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              const count = c.slug === "promos" ? products.filter((p) => p.compareAtPrice).length : products.filter((p) => p.categoryId === c.id).length;
              return (
                <li key={c.id}>
                  <Link href={`/boutique/${c.slug}`} onClick={onClose} className="group flex h-[60px] items-center gap-3 rounded-2xl px-2.5 transition-colors hover:bg-akua-page">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-akua-page text-akua-ink transition-colors group-hover:bg-akua-blue group-hover:text-akua-white">
                      <Icon aria-hidden className="size-5" strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-akua-ink">{c.name}</span>
                      <span className="block text-[12px] text-akua-gray-500">
                        {count} produit{count > 1 ? "s" : ""}
                      </span>
                    </span>
                    <ChevronRight aria-hidden className="size-4 -translate-x-1 text-akua-blue opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Accès rapide */}
        <div className="border-l border-akua-gray-200 pl-6">
          <p className={eyebrow}>Accès rapide</p>
          <ul className="mt-3 grid gap-1">
            {quick.map(({ href, icon: Icon, t }) => (
              <li key={href}>
                <Link href={href} onClick={onClose} className="group flex h-11 items-center gap-3 rounded-xl px-2.5 text-[14px] font-medium text-akua-ink transition-colors hover:bg-akua-page hover:text-akua-blue">
                  <Icon aria-hidden className="size-[18px] text-akua-gray-500 transition-colors group-hover:text-akua-blue" strokeWidth={1.7} />
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* À la une : même affiche que sur l'accueil */}
        <Link href={HOME_VISUAL.href} onClick={onClose} className="group block">
          <span className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-akua-page">
            <Image src={HOME_VISUAL.src} alt={HOME_VISUAL.alt} fill sizes="236px" className="object-cover transition-transform duration-700 ease-akua group-hover:scale-[1.04]" />
          </span>
        </Link>
      </div>
      <MenuFooter href="/boutique" label="Voir toute la boutique" onClose={onClose} />
    </motion.div>
  );
}

function OffersMenu({ onClose }: { onClose: () => void }) {
  const promos = products.filter((p) => p.compareAtPrice).slice(0, 4);
  const best = Math.max(0, ...products.map((p) => discountPercent(p.price, p.compareAtPrice) ?? 0));
  const offers = [
    { href: "/packs", icon: Package, t: "Packs prêts à jouer", d: "Console, manettes et jeux, dès 170 000 F", featured: true },
    { href: "/boutique/promos", icon: Percent, t: "Promos du jour", d: best ? `Jusqu'à -${best} % sur une sélection` : "Une sélection à prix réduit" },
    { href: "/boutique?tri=nouveautes", icon: Newspaper, t: "Nouveautés", d: "Switch 2, FC 27 et derniers arrivages" },
  ];
  return (
    <motion.div {...motionProps} className={panel}>
      <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-6 p-6">
        {/* Nos offres */}
        <div>
          <p className={eyebrow}>Nos offres</p>
          <ul className="mt-3 grid gap-2">
            {offers.map(({ href, icon: Icon, t, d, featured }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3.5 rounded-2xl p-3.5 transition-colors",
                    featured ? "bg-akua-blue text-akua-white hover:bg-akua-blue-600" : "bg-akua-page text-akua-ink hover:bg-akua-blue-100",
                  )}
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", featured ? "bg-akua-white/15" : "bg-akua-white text-akua-blue")}>
                    <Icon aria-hidden className="size-5" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-bold">{t}</span>
                    <span className={cn("block text-[12.5px]", featured ? "text-akua-white/80" : "text-akua-gray-500")}>{d}</span>
                  </span>
                  <ArrowRight aria-hidden className={cn("size-4 shrink-0 transition-transform group-hover:translate-x-0.5", !featured && "text-akua-blue")} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* En promo maintenant */}
        <div className="min-w-0 border-l border-akua-gray-200 pl-6">
          <p className={eyebrow}>En promo maintenant</p>
          <ul className="mt-3 grid grid-cols-4 gap-3">
            {promos.map((p) => {
              const pct = discountPercent(p.price, p.compareAtPrice);
              const img = p.images[0];
              return (
                <li key={p.id} className="min-w-0">
                  <Link href={`/produit/${p.slug}`} onClick={onClose} className="group block">
                    <span className="relative block aspect-square overflow-hidden rounded-2xl bg-akua-tile">
                      <Image src={img} alt="" fill sizes="180px" className={cn("transition-transform duration-500 group-hover:scale-105", COVER(img) ? "object-cover" : "object-contain p-3")} />
                      {pct && <span className="absolute top-2 left-2 rounded-full bg-akua-red px-2 py-0.5 text-[11px] font-bold text-akua-white">-{pct} %</span>}
                    </span>
                    <span className="mt-2.5 block truncate text-[13.5px] font-semibold text-akua-ink group-hover:text-akua-blue">{p.name}</span>
                    <span className="mt-0.5 flex items-baseline gap-2">
                      <span className="text-[14px] font-bold text-akua-blue">{formatFCFA(p.price)}</span>
                      {p.compareAtPrice && <span className="text-[12px] text-akua-gray-500 line-through">{formatFCFA(p.compareAtPrice)}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <MenuFooter href="/boutique/promos" label="Voir toutes les promos" onClose={onClose} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ header */

export function SiteHeader() {
  const path = usePathname();
  const hydrated = useHydrated();
  const count = useCart(selectCount);
  const total = useCart(selectTotal);
  const favs = useFavorites((s) => s.ids.length);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const [mega, setMega] = useState<MegaKind | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const openSearch = () => {
    primeKeyboard();
    setSearchOpen(true);
  };

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      // seuils différents à l'aller et au retour : pas de clignotement autour de la limite
      setCompact((c) => (c ? y > 40 : y > 140));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMega(null), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const isActive = (href: string, match?: string[]) => (href === "/" ? path === "/" : (match ?? [href]).some((m) => path.startsWith(m)));
  const indicator = hover ?? NAV.find((n) => isActive(n.href, n.match))?.href ?? null;

  return (
    <>
      <TopBanner />
      <header
        className={cn("sticky top-0 z-50 transition-all duration-300", scrolled ? "border-b border-akua-gray-200/80 bg-akua-white/85 backdrop-blur-xl" : "border-b border-transparent bg-akua-white")}
        onMouseLeave={() => {
          setMega(null);
          setHover(null);
        }}
      >
        <div className="container-akua relative">
          {/* Tablette et ordinateur */}
          <div className="hidden h-[80px] items-center gap-4 md:flex">
            <Logo priority className="h-12 lg:h-14" />

            <nav aria-label="Navigation principale" className="ml-2 hidden items-center rounded-full bg-akua-page p-1 lg:flex xl:ml-4">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onMouseEnter={() => {
                    setHover(n.href);
                    setMega(n.mega ?? null);
                  }}
                  className={cn("relative flex h-9 items-center gap-1 rounded-full px-3.5 text-[13.5px] font-medium whitespace-nowrap transition-colors xl:px-4", isActive(n.href, n.match) ? "text-akua-ink" : "text-akua-gray-500 hover:text-akua-ink")}
                >
                  {indicator === n.href && <motion.span layoutId="nav-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-akua-white shadow-[0_2px_8px_-2px_rgb(11_16_32/0.18)]" />}
                  <span className="relative">{n.label}</span>
                  {n.mega && <ChevronDown aria-hidden className={cn("relative size-3.5 transition-transform", mega === n.mega && "rotate-180")} />}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            <button
              type="button"
              onClick={openSearch}
              className="group flex h-10 w-[150px] items-center gap-2 rounded-full border border-transparent px-3.5 text-[13.5px] font-medium text-akua-ink transition-all duration-300 ease-akua hover:w-[230px] hover:border-akua-gray-200 focus-visible:w-[230px] xl:w-[170px] xl:hover:w-[260px]"
            >
              <Search aria-hidden className="size-[18px] shrink-0" strokeWidth={1.8} />
              <span className="truncate">Rechercher</span>
              <kbd className="ml-auto hidden font-sans text-[11px] font-medium text-akua-gray-500 xl:inline">⌘K</kbd>
            </button>
            <Link href="/favoris" aria-label="Mes favoris" className="relative grid size-11 place-items-center rounded-full border border-akua-gray-200 transition-colors hover:border-akua-ink">
              <Heart aria-hidden className="size-[19px]" strokeWidth={1.9} />
              {hydrated && favs > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-akua-red px-1 text-[10px] font-bold text-akua-white ring-2 ring-akua-white">{favs}</span>}
            </Link>
            <Link href="/panier" aria-label="Mon panier" className={btn({ variant: "dark", size: "md", className: "h-11 gap-2.5 pr-2 pl-4" })}>
              <ShoppingBag aria-hidden className="size-[18px]" strokeWidth={2} />
              <span className="relative z-[2] tabular-nums lg:hidden xl:inline">{formatFCFA(hydrated ? total : 0)}</span>
              <span className="relative z-[2] grid h-7 min-w-7 place-items-center rounded-full bg-akua-blue px-1.5 text-[12px] font-bold text-akua-white">{hydrated ? count : 0}</span>
            </Link>
          </div>

          {/* Mobile : logo centré, puis barre de recherche discrète sur toute la largeur */}
          <div className="md:hidden">
            <div className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-akua", compact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100")}>
              <div className="overflow-hidden">
                <div className="flex h-[68px] items-center justify-center">
                  <Logo priority className="h-12" />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={openSearch}
              aria-label="Rechercher un produit"
              className={cn(
                "mb-2.5 flex h-11 w-full items-center gap-2.5 rounded-full bg-akua-page px-4 text-left text-[14px] text-akua-gray-500 transition-[margin,background-color] duration-300 active:bg-akua-gray-200/70",
                compact && "mt-2.5",
              )}
            >
              <Search aria-hidden className="size-[18px] shrink-0 text-akua-ink" strokeWidth={1.8} />
              Rechercher un produit
            </button>
          </div>
          <AnimatePresence mode="wait">
            {mega === "shop" && <MegaMenu key="shop" onClose={() => setMega(null)} />}
            {mega === "offers" && <OffersMenu key="offers" onClose={() => setMega(null)} />}
          </AnimatePresence>
        </div>
      </header>

    </>
  );
}


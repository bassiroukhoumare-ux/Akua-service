"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Heart, Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { TopBanner } from "./top-banner";
import { categories } from "@/data/categories";
import { categoryImages } from "@/data/category-media";
import { products } from "@/data/products";
import { btn } from "@/lib/btn";
import { formatFCFA } from "@/lib/format";
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

/* --------------------------------------------------------------- méga-menu */

function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 top-[calc(100%+8px)] z-50 grid grid-cols-[1fr_300px] gap-4 rounded-[28px] border border-akua-gray-200 bg-akua-white p-4 shadow-[0_40px_80px_-40px_rgb(11_16_32/0.45)]"
    >
      <div className="grid grid-cols-4 gap-2">
        {categories.map((c) => {
          const count = c.slug === "promos" ? products.filter((p) => p.compareAtPrice).length : products.filter((p) => p.categoryId === c.id).length;
          const img = categoryImages[c.id];
          return (
            <Link key={c.id} href={`/boutique/${c.slug}`} onClick={onClose} className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-akua-page">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-akua-page">
                <Image src={img} alt="" fill sizes="56px" className={cn("transition-transform duration-500 group-hover:scale-110", COVER(img) ? "object-cover" : "object-contain p-1.5")} />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold group-hover:text-akua-blue">{c.name}</span>
                <span className="block text-[12px] text-akua-gray-500">{count} produit{count > 1 ? "s" : ""}</span>
              </span>
            </Link>
          );
        })}
      </div>
      <Link href="/packs" onClick={onClose} className="group relative flex flex-col overflow-hidden rounded-2xl bg-akua-blue p-5 text-akua-white">
        <span className="text-[11.5px] font-semibold tracking-[0.14em] text-akua-white/70 uppercase">Packs prêts à jouer</span>
        <span className="mt-1.5 text-[20px] leading-tight font-bold">PS4 complète dès 170 000 F</span>
        <span className="relative mt-auto aspect-[2/1]">
          <Image src="/products/ps4-ds4.webp" alt="" fill sizes="260px" className="object-contain drop-shadow-[0_20px_20px_rgb(0_0_0/0.35)] transition-transform duration-500 group-hover:scale-105" />
        </span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold">
          Découvrir <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

function OffersMenu({ onClose }: { onClose: () => void }) {
  const promos = products.filter((p) => p.compareAtPrice).slice(0, 4);
  const tiles = [
    { href: "/packs", title: "Packs prêts à jouer", text: "Console + manettes + jeux, dès 170 000 F", img: "/products/ps4-ds4.webp", tone: "bg-akua-blue text-akua-white" },
    { href: "/boutique/promos", title: "Promos et offres du jour", text: "Jusqu'à -23 % sur une sélection", img: "/products/ds3.webp", tone: "bg-akua-page text-akua-ink" },
    { href: "/boutique?tri=nouveautes", title: "Nouveautés", text: "Switch 2, FC 27 et derniers arrivages", img: "/products/switch-2-dock.webp", tone: "bg-akua-blue-100 text-akua-ink" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 top-[calc(100%+8px)] z-50 rounded-[28px] border border-akua-gray-200 bg-akua-white p-4 shadow-[0_40px_80px_-40px_rgb(11_16_32/0.45)]"
    >
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} onClick={onClose} className={cn("group relative flex h-[170px] flex-col overflow-hidden rounded-2xl p-5", t.tone)}>
            <span className="relative z-10 max-w-[60%] text-[18px] leading-tight font-bold">{t.title}</span>
            <span className="relative z-10 mt-1 max-w-[58%] text-[12.5px] opacity-75">{t.text}</span>
            <span className="relative z-10 mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold">
              Découvrir <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute top-[18%] right-[-6%] bottom-[10%] w-[50%] transition-transform duration-500 group-hover:scale-105">
              <Image src={t.img} alt="" fill sizes="200px" className="object-contain drop-shadow-[0_16px_16px_rgb(0_0_0/0.25)]" />
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-4 mb-2 px-1 text-[12px] font-semibold tracking-[0.12em] text-akua-gray-500 uppercase">En promo maintenant</p>
      <div className="grid grid-cols-4 gap-2">
        {promos.map((p) => (
          <Link key={p.id} href={`/produit/${p.slug}`} onClick={onClose} className="group flex items-center gap-3 rounded-2xl p-2 hover:bg-akua-page">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-akua-page">
              <Image src={p.images[0]} alt="" fill sizes="48px" className={COVER(p.images[0]) ? "object-cover" : "object-contain p-1"} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold group-hover:text-akua-blue">{p.name}</span>
              <span className="text-[13px] font-bold">{formatFCFA(p.price)}</span>
            </span>
          </Link>
        ))}
      </div>
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
  const [hover, setHover] = useState<string | null>(null);
  const [expanding, setExpanding] = useState(false);
  const searchOpen = useUI((s) => s.searchOpen);
  useEffect(() => {
    if (!searchOpen) setExpanding(false);
  }, [searchOpen]);
  const openSearch = () => {
    setExpanding(true);
    window.setTimeout(() => setSearchOpen(true), 220);
  };

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
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
          <div className="hidden h-[72px] items-center gap-4 md:flex">
            <Logo priority className="h-11 lg:h-12" />

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
              onClick={() => setSearchOpen(true)}
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

          {/* Mobile : logo + recherche compacte qui se déploie au toucher */}
          <div className="flex h-[60px] items-center justify-between gap-3 md:hidden">
            <motion.div animate={{ opacity: expanding ? 0 : 1, width: expanding ? 0 : "auto" }} transition={{ duration: 0.2 }} className="shrink-0 overflow-hidden">
              <Logo priority className="h-10" />
            </motion.div>
            <motion.button
              type="button"
              layout
              onClick={openSearch}
              aria-label="Rechercher un produit"
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className={cn(
                "flex h-10 items-center gap-2 rounded-full border border-akua-gray-200 bg-akua-white px-3.5 text-[13.5px] font-medium text-akua-ink",
                expanding ? "flex-1 border-akua-blue" : "ml-auto",
              )}
            >
              <Search aria-hidden className="size-[17px] shrink-0" strokeWidth={1.8} />
              <span className={cn(expanding && "text-akua-gray-500")}>{expanding ? "Console, manette, jeu…" : "Rechercher"}</span>
            </motion.button>
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


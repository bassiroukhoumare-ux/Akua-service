"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Heart, Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { primeKeyboard } from "@/components/ui/search-dialog";
import { TopBanner } from "./top-banner";
import { useCatalog } from "@/components/catalog-provider";
import { btn } from "@/lib/btn";
import { discountPercent, formatFCFA } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { selectCount, selectTotal, useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { useUI } from "@/store/ui";

type MegaKind = "shop" | "offers";
const NAV: {
  label: string;
  href: string;
  mega?: MegaKind;
  match?: string[];
}[] = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique", mega: "shop" },
  {
    label: "Offres",
    href: "/boutique/promos",
    mega: "offers",
    match: ["/packs", "/boutique/promos"],
  },
  { label: "Vente en gros", href: "/vente-en-gros" },
  { label: "Contact", href: "/contact" },
];

const COVER = (src: string) => src.includes("/fb-") || src.includes("g29") || src.includes("camera");

/* --------------------------------------------------------------- méga-menus */

// zone transparente de 8 px au-dessus du panneau : la souris passe du menu au panneau sans le fermer
const panelWrap = "absolute inset-x-4 top-full z-50 pt-2 min-[1368px]:inset-x-0";
const panel = "overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white shadow-[0_40px_80px_-40px_rgb(11_16_32/0.45)]";
const motionProps = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};
const eyebrow = "text-[11.5px] font-semibold tracking-[0.14em] text-akua-gray-500 uppercase";

/** Photo de catégorie ou de produit : fichier du site (optimisé) ou image importée / externe. */
function Thumb({ src, sizes, className }: { src: string; sizes: string; className?: string }) {
  if (src.startsWith("/") && !src.startsWith("/api/")) return <Image src={src} alt="" fill sizes={sizes} className={className} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className={cn("absolute inset-0 size-full", className)} />;
}

/** En-tête commun : titre du menu et lien vers la page complète. */
function MenuHead({ title, href, label, onClose }: { title: React.ReactNode; href: string; label: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 pt-5">
      <p className={eyebrow}>{title}</p>
      <Link href={href} onClick={onClose} className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-akua-blue">
        {label} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

/** Menu « Boutique » : les catégories et leurs sous-rayons, en texte (les photos sont déjà sur l'accueil). */
function MegaMenu({ onClose }: { onClose: () => void }) {
  const { categories } = useCatalog();
  return (
    <motion.div {...motionProps} className={panelWrap}>
      <div className={panel}>
        <MenuHead title="Catégories" href="/boutique" label="Voir toute la boutique" onClose={onClose} />
        <ul className="grid grid-cols-6 gap-x-6 gap-y-6 px-6 pt-4 pb-6">
          {categories
            .filter((c) => c.slug !== "promos")
            .map((c) => (
              <li key={c.id} className="min-w-0">
                <Link href={`/boutique/${c.slug}`} onClick={onClose} className="group flex min-h-[2.6em] items-start gap-1 text-[13px] leading-tight font-extrabold tracking-[0.02em] text-akua-ink uppercase transition-colors hover:text-akua-blue">
                  {c.name}
                  <ArrowRight aria-hidden className="size-3.5 shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
                <ul className="mt-3 grid gap-0.5 border-t border-akua-gray-200 pt-2.5">
                  {(c.groups ?? []).map((g) => (
                    <li key={g.slug}>
                      <Link href={`/boutique/${c.slug}?type=${g.slug}`} onClick={onClose} className="-mx-2 block truncate rounded-lg px-2 py-1.5 text-[13.5px] text-akua-gray-500 transition-colors hover:bg-akua-page hover:text-akua-ink">
                        {g.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href={`/boutique/${c.slug}`} onClick={onClose} className="-mx-2 block rounded-lg px-2 py-1.5 text-[13.5px] font-semibold text-akua-blue transition-colors hover:bg-akua-page">
                      Tout voir
                    </Link>
                  </li>
                </ul>
              </li>
            ))}
        </ul>
      </div>
    </motion.div>
  );
}

/** Menu « Offres » : uniquement les produits en promotion en ce moment. */
function OffersMenu({ onClose }: { onClose: () => void }) {
  const { products } = useCatalog();
  const all = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).sort((a, b) => (discountPercent(b.price, b.compareAtPrice) ?? 0) - (discountPercent(a.price, a.compareAtPrice) ?? 0));
  const promos = all.slice(0, 12);
  return (
    <motion.div {...motionProps} className={panelWrap}>
      <div className={panel}>
        <MenuHead
          title={
            <>
              En promotion maintenant <span className="text-akua-blue">· {all.length}</span>
            </>
          }
          href="/boutique/promos"
          label="Voir toutes les promos"
          onClose={onClose}
        />
        {promos.length === 0 ? (
          <p className="px-6 pt-4 pb-7 text-[14px] text-akua-gray-500">Aucune promotion en ce moment. Revenez bientôt.</p>
        ) : (
          <ul className="grid grid-cols-6 gap-x-4 gap-y-5 p-6 pt-4">
            {promos.map((p) => {
              const pct = discountPercent(p.price, p.compareAtPrice);
              const img = p.images[0];
              return (
                <li key={p.id} className="min-w-0">
                  <Link href={`/produit/${p.slug}`} onClick={onClose} className="group block">
                    <span className="relative block aspect-square overflow-hidden rounded-2xl border border-transparent bg-akua-tile transition-colors duration-300 group-hover:border-akua-blue/40">
                      {img && <Thumb src={img} sizes="180px" className={cn("transition-transform duration-500 group-hover:scale-105", COVER(img) ? "object-cover" : "object-contain p-3")} />}
                      {pct && <span className="absolute top-2 left-2 rounded-full bg-akua-red px-2 py-0.5 text-[11px] font-bold text-akua-white">-{pct} %</span>}
                    </span>
                    <span className="mt-2.5 block truncate text-[13.5px] font-semibold text-akua-ink group-hover:text-akua-blue">{p.name}</span>
                    <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                      <span className="text-[14px] font-bold text-akua-blue">{formatFCFA(p.price)}</span>
                      <span className="text-[12px] text-akua-gray-500 line-through">{formatFCFA(p.compareAtPrice!)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
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
                  className={cn(
                    "relative flex h-9 items-center gap-1 rounded-full px-3.5 text-[13.5px] font-medium whitespace-nowrap transition-colors xl:px-4",
                    isActive(n.href, n.match) ? "text-akua-ink" : "text-akua-gray-500 hover:text-akua-ink",
                  )}
                >
                  {indicator === n.href && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute inset-0 rounded-full bg-akua-white shadow-[0_2px_8px_-2px_rgb(11_16_32/0.18)]"
                    />
                  )}
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
            <Link
              href="/panier"
              aria-label="Mon panier"
              className={btn({
                variant: "dark",
                size: "md",
                className: "h-11 gap-2.5 pr-2 pl-4",
              })}
            >
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

      {/* Menu ouvert : le reste du site est flouté et assombri pour mettre le menu en avant */}
      <AnimatePresence>
        {mega && (
          <motion.div
            key="voile"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setMega(null)}
            onClick={() => setMega(null)}
            className="fixed inset-0 z-40 hidden bg-akua-ink/25 backdrop-blur-[6px] lg:block"
          />
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Heart, Menu, Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { primeKeyboard } from "@/components/ui/search-dialog";
import { TopBanner } from "./top-banner";
import { useShopSettings } from "@/components/shop-settings-provider";
import { CurrencySwitch, useMoney } from "@/components/currency";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { useCatalog } from "@/components/catalog-provider";
import { discountPercent } from "@/lib/format";
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
  { label: "Boutique", href: "/boutique", match: ["/boutique", "/produit"] },
  { label: "Promotions", href: "/boutique/promos", mega: "offers", match: ["/boutique/promos"] },
  { label: "Packs", href: "/packs" },
  { label: "Vente en gros", href: "/vente-en-gros" },
  { label: "Contact", href: "/contact" },
];

const COVER = (src: string) => src.includes("/fb-") || src.includes("g29") || src.includes("camera");

/* --------------------------------------------------------------- méga-menus */

// zone transparente de 8 px au-dessus du panneau : la souris passe du menu au panneau sans le fermer
const panelWrap = "absolute inset-x-4 top-full z-50 hidden max-h-[calc(100dvh-270px)] overflow-y-auto lg:max-h-[calc(100dvh-190px)] overscroll-contain md:inset-x-6 md:block lg:inset-x-8";
const panel = "overflow-hidden rounded-b-[14px] border border-t-2 border-akua-gray-200 border-t-akua-blue bg-akua-white shadow-[0_40px_80px_-40px_rgb(11_16_32/0.45)]";
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
        <ul className="grid grid-cols-3 gap-x-6 gap-y-7 px-6 pt-4 pb-6 xl:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]" style={{ "--cols": Math.min(Math.max(categories.filter((c) => c.slug !== "promos").length, 4), 7) } as React.CSSProperties}>
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
  const money = useMoney();
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
          <ul className="grid grid-cols-4 gap-x-4 gap-y-5 p-6 pt-4 lg:grid-cols-6">
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
                    <span className="mt-0.5 block text-[15px] font-extrabold text-akua-blue tabular-nums">{money(p.price)}</span>
                    <span className="block text-[12px] text-akua-gray-500 line-through tabular-nums">{money(p.compareAtPrice!)}</span>
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

// raccourcis de droite : icône au-dessus, libellé en dessous
const action = "group flex w-[62px] flex-col items-center gap-1 text-akua-ink transition-colors hover:text-akua-blue lg:w-[70px]";
const actionLabel = "max-w-full truncate text-[11.5px] font-medium tabular-nums";
const badge = "absolute -top-1.5 -right-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-akua-blue px-1 text-[10px] font-bold text-akua-white ring-2 ring-akua-white";


export function SiteHeader() {
  const path = usePathname();
  const hydrated = useHydrated();
  const count = useCart(selectCount);
  const total = useCart(selectTotal);
  const favs = useFavorites((s) => s.ids.length);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const settings = useShopSettings();
  const money = useMoney();
  const [mega, setMega] = useState<MegaKind | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  // Support client : ouvre directement la conversation WhatsApp de la boutique
  const support = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Bonjour AKUA.SERVICE, j'ai une question.")}`;
  // Filtrer (téléphone) : ouvre le panneau de filtres de la page ; ailleurs, on passe d'abord par la boutique
  const router = useRouter();
  const setFiltersOpen = useUI((s) => s.setFiltersOpen);
  const openFilters = () => {
    if (path !== "/" && !path.startsWith("/boutique")) router.push("/boutique");
    setFiltersOpen(true);
  };
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
        className={cn("sticky top-0 z-50 bg-akua-white transition-shadow duration-300", scrolled ? "shadow-[0_14px_30px_-22px_rgb(11_16_32/0.45)]" : "")}
        onMouseLeave={() => {
          setMega(null);
          setHover(null);
        }}
      >
        {/* 2. Logo, grande recherche, raccourcis */}
        <div className="border-b border-akua-gray-200">
          <div className="container-akua">
            {/* tablette et ordinateur */}
            <div className="hidden h-[76px] items-center gap-5 md:flex lg:gap-8">
              <Logo priority className="h-12 shrink-0" />

              <div className="mx-auto flex h-12 w-full max-w-[680px] min-w-0 items-stretch rounded-[10px] border border-akua-gray-200 bg-akua-white transition-[border-color,box-shadow] focus-within:border-akua-blue hover:border-akua-blue hover:shadow-[0_0_0_4px_rgb(31_91_255/0.1)]">
                <button type="button" onClick={openSearch} className="flex min-w-0 flex-1 items-center gap-2.5 pl-4 text-left text-[14px] text-akua-gray-500">
                  <span className="min-w-0 flex-1 truncate">Rechercher un produit, une marque…</span>
                  <kbd className="mr-3 hidden rounded-md border border-akua-gray-200 px-1.5 py-0.5 font-sans text-[11px] font-medium xl:inline">⌘K</kbd>
                </button>
                <button type="button" onClick={openSearch} aria-label="Rechercher" className="btn-shine glow-blue -my-px -mr-px grid w-14 shrink-0 place-items-center rounded-r-[10px] bg-akua-blue text-akua-white hover:bg-akua-blue-600">
                  <Search aria-hidden className="relative z-[2] size-5" strokeWidth={2.2} />
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-1 lg:gap-2">
                <div className="mr-1 hidden flex-col items-center gap-1 lg:flex">
                  <CurrencySwitch size="sm" />
                  <span className={actionLabel}>Devise</span>
                </div>
                <a href={support} target="_blank" rel="noopener" aria-label="Support client sur WhatsApp" className={cn(action, "w-auto px-1.5 lg:w-auto")}>
                  <WhatsAppIcon size={24} variant="color" />
                  <span className={cn(actionLabel, "whitespace-nowrap")}>Support client</span>
                </a>
                <Link href="/favoris" aria-label="Mes favoris" className={action}>
                  <span className="relative">
                    <Heart aria-hidden className="size-6" strokeWidth={1.7} />
                    {hydrated && favs > 0 && <span className={badge}>{favs}</span>}
                  </span>
                  <span className={actionLabel}>Favoris</span>
                </Link>
                <Link href="/panier" aria-label="Mon panier" className={action}>
                  <span className="relative">
                    <ShoppingBag aria-hidden className="size-6" strokeWidth={1.7} />
                    <span className={badge}>{hydrated ? count : 0}</span>
                  </span>
                  <span className={actionLabel}>{hydrated && total > 0 ? money(total) : "Panier"}</span>
                </Link>
              </div>
            </div>

            {/* téléphone : logo centré, puis la recherche (favoris et panier sont dans la barre du bas) */}
            <div className="md:hidden">
              <div className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-akua", compact ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100")}>
                <div className="overflow-hidden">
                  <div className="flex h-[58px] items-center justify-center">
                    <Logo priority className="h-10" />
                  </div>
                </div>
              </div>
              {/* recherche et filtres sur la même ligne */}
              <div className={cn("mb-2.5 flex items-stretch gap-2", compact && "mt-2.5")}>
                <button type="button" onClick={openSearch} aria-label="Rechercher un produit" className="flex h-11 min-w-0 flex-1 items-stretch rounded-[10px] border border-akua-gray-200 bg-akua-white text-left text-[14px] text-akua-gray-500">
                  <span className="flex min-w-0 flex-1 items-center truncate pl-3.5">Rechercher un produit…</span>
                  <span aria-hidden className="-my-px -mr-px grid w-12 shrink-0 place-items-center rounded-r-[10px] bg-akua-blue text-akua-white">
                    <Search className="size-[18px]" strokeWidth={2.3} />
                  </span>
                </button>
                <button type="button" onClick={openFilters} aria-label="Filtrer les produits" className="flex h-11 shrink-0 items-center gap-1.5 rounded-[10px] border border-akua-ink bg-akua-white px-3 text-[13.5px] font-semibold text-akua-ink transition-colors active:bg-akua-ink active:text-akua-white">
                  <SlidersHorizontal aria-hidden className="size-[18px]" strokeWidth={2} />
                  <span className="max-[359px]:hidden">Filtrer</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Menu : « Toutes les catégories » puis les pages */}
        <div className="hidden border-b border-akua-gray-200 md:block">
          <div className="container-akua relative flex h-12 items-stretch">
            <button
              type="button"
              onMouseEnter={() => {
                setHover(null);
                setMega("shop");
              }}
              onClick={() => setMega("shop")}
              aria-expanded={mega === "shop"}
              className={cn("flex shrink-0 items-center gap-2.5 px-4 text-[13px] font-bold tracking-[0.04em] whitespace-nowrap uppercase transition-colors lg:w-[264px]", mega === "shop" ? "bg-akua-blue text-akua-white" : "bg-akua-ink text-akua-white hover:bg-akua-blue")}
            >
              <Menu aria-hidden className="size-[18px]" strokeWidth={2.2} />
              <span className="hidden lg:inline">Toutes les catégories</span>
              <span className="lg:hidden">Catégories</span>
              <ChevronDown aria-hidden className={cn("ml-auto hidden size-4 transition-transform lg:block", mega === "shop" && "rotate-180")} />
            </button>
            <nav aria-label="Navigation principale" className="no-scrollbar flex min-w-0 flex-1 items-stretch overflow-x-auto pl-1.5 lg:pl-4">
              {NAV.map((n) => {
                const on = indicator === n.href;
                const active = on || isActive(n.href, n.match);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onMouseEnter={() => {
                      setHover(n.href);
                      setMega(n.mega ?? null);
                    }}
                    className={cn("relative flex shrink-0 items-center gap-1 px-2 text-[12px] font-bold tracking-[0.04em] whitespace-nowrap uppercase transition-colors lg:px-4 lg:text-[13px] lg:tracking-[0.05em]", active ? "text-akua-blue" : "text-akua-ink hover:text-akua-blue")}
                  >
                    {n.label}
                    {n.mega && <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", mega === n.mega && "rotate-180")} strokeWidth={2.4} />}
                    {on && <motion.span layoutId="nav-underline" transition={{ type: "spring", stiffness: 480, damping: 38 }} className="absolute inset-x-2 bottom-0 h-[3px] bg-akua-blue lg:inset-x-4" />}
                  </Link>
                );
              })}
            </nav>
            <AnimatePresence mode="wait">
              {mega === "shop" && <MegaMenu key="shop" onClose={() => setMega(null)} />}
              {mega === "offers" && <OffersMenu key="offers" onClose={() => setMega(null)} />}
            </AnimatePresence>
          </div>
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
            className="fixed inset-0 z-40 hidden bg-akua-ink/25 backdrop-blur-[6px] md:block"
          />
        )}
      </AnimatePresence>
    </>
  );
}

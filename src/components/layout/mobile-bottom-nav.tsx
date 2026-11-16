"use client";

import { motion } from "framer-motion";
import { Heart, House, Menu, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { selectCount, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";

const TABS = [
  { label: "Accueil", href: "/", icon: House },
  { label: "Boutique", href: "/boutique", icon: Store },
  { label: "Panier", href: "/panier", icon: ShoppingBag },
  { label: "Favoris", href: "/favoris", icon: Heart },
];

const tab = "group flex h-full w-full flex-col items-center justify-center gap-1 transition-colors";
const chip = "relative grid h-8 w-[52px] place-items-center";
const glow = "absolute inset-0 rounded-[10px] bg-akua-blue-100 shadow-[0_0_0_1px_rgb(31_91_255/0.14),0_8px_18px_-10px_rgb(31_91_255/0.7)]";
const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

/**
 * Barre de navigation mobile collée au bas de l'écran : bandeau blanc aux coins arrondis et
 * cinq onglets au même format (icône puis libellé). L'onglet actif passe en bleu : icône remplie
 * posée sur une pastille bleu clair lumineuse qui glisse d'un onglet à l'autre.
 */
export function MobileBottomNav() {
  const path = usePathname();
  const hydrated = useHydrated();
  const count = useCart(selectCount);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const label = (on: boolean) => cn("max-w-full truncate px-0.5 text-[11.5px] leading-none", on ? "font-bold" : "font-medium");
  const tone = (on: boolean) => (on ? "text-akua-blue" : "text-akua-ink/75 active:text-akua-blue");
  return (
    <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-40 rounded-t-[22px] border-t border-akua-gray-200 bg-akua-white pb-[env(safe-area-inset-bottom)] shadow-[0_-16px_36px_-20px_rgb(11_16_32/0.4)] lg:hidden">
      <ul className="mx-auto grid h-[66px] max-w-2xl grid-cols-5 px-2">
        {TABS.map(({ label: text, href, icon: Icon }) => {
          const active = !menuOpen && (href === "/" ? path === "/" : path.startsWith(href));
          return (
            <li key={href} className="min-w-0">
              <Link href={href} aria-current={active ? "page" : undefined} className={cn(tab, tone(active))}>
                <span className={chip}>
                  {active && <motion.span layoutId="bottom-glow" transition={spring} className={glow} />}
                  <span className="relative">
                    <Icon aria-hidden className={cn("size-[23px] transition-all duration-300", active && "fill-akua-blue/20")} strokeWidth={active ? 2.1 : 1.7} />
                    {href === "/panier" && hydrated && count > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-akua-blue px-1 text-[9.5px] font-bold text-akua-white ring-2 ring-akua-white">{count}</span>
                    )}
                  </span>
                </span>
                <span className={label(active)}>{text}</span>
              </Link>
            </li>
          );
        })}
        <li className="min-w-0">
          <button type="button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-label="Ouvrir le menu" className={cn(tab, tone(menuOpen))}>
            <span className={chip}>
              {menuOpen && <motion.span layoutId="bottom-glow" transition={spring} className={glow} />}
              <Menu aria-hidden className="relative size-[23px]" strokeWidth={menuOpen ? 2.1 : 1.7} />
            </span>
            <span className={label(menuOpen)}>Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

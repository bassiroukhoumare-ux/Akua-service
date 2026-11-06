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

/** Barre de navigation mobile : capsule flottante, onglet actif en pastille bleue. */
export function MobileBottomNav() {
  const path = usePathname();
  const hydrated = useHydrated();
  const count = useCart(selectCount);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  return (
    <nav aria-label="Navigation mobile" className="fixed inset-x-2.5 bottom-[calc(8px+env(safe-area-inset-bottom))] z-40 lg:hidden">
      <ul className="mx-auto grid h-[64px] max-w-lg grid-cols-5 rounded-[24px] border border-akua-gray-200/80 bg-akua-white/92 px-1.5 shadow-[0_18px_40px_-18px_rgb(11_16_32/0.35)] backdrop-blur-xl">
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = !menuOpen && (href === "/" ? path === "/" : path.startsWith(href));
          return (
            <li key={href} className="flex items-center justify-center">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("relative flex h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-[18px] text-[10.5px] font-semibold transition-colors", active ? "text-akua-blue" : "text-akua-gray-500 active:bg-akua-page")}
              >
                {active && <motion.span layoutId="bottom-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-[18px] bg-akua-blue-100" />}
                <span className="relative">
                  <Icon aria-hidden className="size-[21px]" strokeWidth={active ? 2.2 : 1.8} />
                  {href === "/panier" && hydrated && count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-akua-blue px-1 text-[9.5px] font-bold text-akua-white ring-2 ring-akua-white">{count}</span>
                  )}
                </span>
                <span className="relative">{label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-label="Ouvrir le menu"
            className={cn("relative flex h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-[18px] text-[10.5px] font-semibold transition-colors", menuOpen ? "bg-akua-blue-100 text-akua-blue" : "text-akua-gray-500 active:bg-akua-page")}
          >
            <Menu aria-hidden className="size-[21px]" strokeWidth={menuOpen ? 2.2 : 1.8} />
            <span>Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

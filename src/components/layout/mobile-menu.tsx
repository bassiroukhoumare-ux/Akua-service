"use client";

import { ArrowUpRight, BadgePercent, ChevronRight, House, MessageCircleMore, PackageOpen, Store, Warehouse, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { OpenStatus } from "@/components/shop/open-status";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { useShopSettings } from "@/components/shop-settings-provider";
import { SocialLinkIcon } from "@/components/ui/social-link-icon";
import { summarizeHours } from "@/lib/shop-settings";
import { useCatalog } from "@/components/catalog-provider";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";

const LINKS = [
  { label: "Accueil", href: "/", icon: House },
  { label: "Boutique", href: "/boutique", icon: Store },
  { label: "Packs prêts à jouer", href: "/packs", icon: PackageOpen },
  { label: "Promotions", href: "/boutique/promos", icon: BadgePercent },
  { label: "Vente en gros", href: "/vente-en-gros", icon: Warehouse },
  { label: "Contact", href: "/contact", icon: MessageCircleMore },
];


/** Menu latéral mobile (ouvert depuis l'onglet « Menu » de la barre du bas). */
export function MobileMenu() {
  const settings = useShopSettings();
  const hours = summarizeHours(settings.hours);
  const { categories } = useCatalog();
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const path = usePathname();
  const close = () => setOpen(false);

  useEffect(() => setOpen(false), [path, setOpen]);

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[88vw] max-w-[380px] gap-0 border-0 bg-akua-white p-0 [&>button]:hidden">
        <SheetTitle className="sr-only">Menu</SheetTitle>

        <div className="flex items-center justify-between border-b border-akua-gray-200 px-5 py-3">
          <Logo className="h-10" />
          <button type="button" onClick={close} aria-label="Fermer le menu" className="grid size-10 place-items-center rounded-full border border-akua-gray-200 transition-colors hover:border-akua-ink">
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
          <p className="px-2 text-[11.5px] font-semibold tracking-[0.14em] text-akua-gray-500 uppercase">Navigation</p>
          <nav aria-label="Menu" className="mt-2 space-y-1">
            {LINKS.map(({ label, href, icon: Icon }) => {
              const on = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  aria-current={on ? "page" : undefined}
                  className={cn("group flex items-center gap-4 rounded-2xl px-3.5 py-3.5 text-[15.5px] font-semibold transition-colors", on ? "bg-akua-blue-100 text-akua-blue" : "hover:bg-akua-page")}
                >
                  <Icon aria-hidden className={cn("size-[22px] shrink-0 transition-colors", on ? "text-akua-blue" : "text-akua-ink")} strokeWidth={1.5} />
                  {label}
                  <ChevronRight aria-hidden className={cn("ml-auto size-4 transition-transform group-hover:translate-x-0.5", on ? "text-akua-blue" : "text-akua-gray-500")} />
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 flex items-center justify-between px-2">
            <p className="text-[11.5px] font-semibold tracking-[0.14em] text-akua-gray-500 uppercase">Nos catégories</p>
            <Link href="/boutique" onClick={close} className="flex items-center gap-0.5 text-[12.5px] font-semibold text-akua-blue">
              Tout voir <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </div>
          <div className="mt-2.5 grid grid-cols-4 rounded-[22px] border border-akua-gray-200">
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <Link key={c.id} href={`/boutique/${c.slug}`} onClick={close} className="group flex flex-col items-center gap-1.5 min-w-0 rounded-[20px] px-0 py-3.5 text-center transition-colors hover:bg-akua-page">
                  <Icon aria-hidden className="size-6 text-akua-ink transition-colors group-hover:text-akua-blue" strokeWidth={1.4} />
                  <span className="w-full truncate text-[9.5px] leading-tight font-semibold tracking-[-0.03em] min-[380px]:text-[10.5px] min-[380px]:tracking-[-0.01em]">{c.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-[22px] bg-akua-page p-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <p className="text-[14px] font-bold whitespace-nowrap">Horaires d&apos;ouverture</p>
              <OpenStatus />
            </div>
            {hours.map((h, i) => (
              <p key={h.days} className={i ? "text-[13px] text-akua-gray-500" : "mt-2 text-[13.5px]"}>
                {h.days} : {h.hours}
              </p>
            ))}
            <div className="mt-4 flex items-center gap-2">
              <span className="mr-1 text-[12.5px] font-medium text-akua-gray-500">Suivez-nous</span>
              {settings.socials
                .filter((x) => /^https?:\/\//.test(x.url))
                .map((x) => (
                  <a key={x.id} href={x.url} target="_blank" rel="noopener" aria-label={x.label} className="grid size-9 place-items-center rounded-full bg-akua-ink text-akua-white">
                    <SocialLinkIcon network={x.network} className="size-4" />
                  </a>
                ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

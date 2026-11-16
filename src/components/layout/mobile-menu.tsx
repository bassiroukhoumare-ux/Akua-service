"use client";

import { useSitePath } from "@/lib/use-site-path";
import { ArrowUpRight, BadgePercent, ChevronRight, House, MessageCircleMore, PackageOpen, Store, Warehouse, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { OpenStatus } from "@/components/shop/open-status";
import { CurrencySwitch } from "@/components/currency";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { useShopSettings } from "@/components/shop-settings-provider";
import { SocialBrandBadge } from "@/components/ui/social-brand";
import { summarizeHours } from "@/lib/shop-settings";
import { useCatalog } from "@/components/catalog-provider";
import { getCategoryIcon } from "@/lib/icons";
import { categoryImages } from "@/data/category-media";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";

const LINKS = [
  { label: "Accueil", href: "/", icon: House },
  { label: "Boutique", href: "/boutique", icon: Store },
  { label: "Packs prêts à l'emploi", href: "/packs", icon: PackageOpen },
  { label: "Promotions", href: "/boutique/promos", icon: BadgePercent },
  { label: "Vente en gros", href: "/vente-en-gros", icon: Warehouse },
  { label: "Contact", href: "/contact", icon: MessageCircleMore },
];


const heading = "text-[12px] font-extrabold tracking-[0.06em] text-akua-ink uppercase";

/** Menu latéral mobile (ouvert depuis l'onglet « Menu » de la barre du bas). */
export function MobileMenu() {
  const settings = useShopSettings();
  const hours = summarizeHours(settings.hours);
  const { categories } = useCatalog();
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const path = useSitePath();
  const close = () => setOpen(false);

  useEffect(() => setOpen(false), [path, setOpen]);

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[88vw] max-w-[380px] gap-0 border-0 bg-akua-white p-0 [&>button]:hidden">
        <SheetTitle className="sr-only">Menu</SheetTitle>

        <div className="flex items-center justify-between border-b border-akua-gray-200 px-5 py-3">
          <Logo className="h-10" />
          <button type="button" onClick={close} aria-label="Fermer le menu" className="glow-soft grid size-10 place-items-center rounded-[10px] border border-akua-gray-200">
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
          {/* devise d'affichage des prix (sur téléphone, uniquement ici) */}
          <div className="mb-6 rounded-[12px] border border-akua-gray-200 bg-akua-white p-3.5">
            <p className={heading}>Afficher les prix en</p>
            <CurrencySwitch className="mt-3 flex w-full bg-akua-white [&>button]:h-10 [&>button]:flex-1 [&>button]:text-[13.5px]" />
            <p className="mt-2 text-[11.5px] leading-snug text-akua-gray-500">Euro et dollar à titre indicatif : le paiement se fait en F CFA.</p>
          </div>

          <p className={heading}>Navigation</p>
          <nav aria-label="Menu" className="mt-1">
            {LINKS.map(({ label, href, icon: Icon }) => {
              const on = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  aria-current={on ? "page" : undefined}
                  className={cn("group relative flex items-center gap-3.5 border-b border-akua-gray-200 px-2 py-3.5 text-[15px] font-semibold transition-colors", on ? "text-akua-blue" : "text-akua-ink active:bg-akua-blue-100/50")}
                >
                  {on && <span aria-hidden className="absolute inset-y-2.5 -left-4 w-[3px] bg-akua-blue" />}
                  <Icon aria-hidden className={cn("size-[22px] shrink-0 transition-colors", on ? "text-akua-blue" : "text-akua-ink")} strokeWidth={1.6} />
                  {label}
                  <ChevronRight aria-hidden className={cn("ml-auto size-4 transition-transform group-hover:translate-x-0.5", on ? "text-akua-blue" : "text-akua-gray-500")} />
                </Link>
              );
            })}
          </nav>

          <div className="mt-7 flex items-end justify-between border-b border-akua-gray-200">
            <p className={cn(heading, "-mb-px border-b-2 border-akua-blue pb-2")}>Nos catégories</p>
            <Link href="/boutique" onClick={close} className="flex items-center gap-0.5 pb-2 text-[12px] font-bold tracking-[0.02em] text-akua-blue uppercase">
              Tout voir <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </div>
          {/* 3 colonnes régulières : photo de la catégorie puis nom (les promos sont déjà dans la navigation) */}
          <ul className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4">
            {categories
              .filter((c) => c.slug !== "promos")
              .map((c) => {
                const img = c.image ?? categoryImages[c.id];
                const Icon = getCategoryIcon(c.icon);
                return (
                  <li key={c.id} className="min-w-0">
                    <Link href={`/boutique/${c.slug}`} onClick={close} className="group flex h-full flex-col items-center gap-2 text-center">
                      <span className="relative grid size-[68px] place-items-center overflow-hidden rounded-full bg-akua-tile ring-1 ring-akua-gray-200 transition-shadow group-active:ring-akua-blue">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" loading="lazy" className="absolute inset-0 size-full object-contain p-3" />
                        ) : (
                          <Icon aria-hidden className="size-5 text-akua-ink" strokeWidth={1.5} />
                        )}
                      </span>
                      <span className="w-full px-0.5 text-[10.5px] leading-tight font-semibold tracking-[-0.01em] min-[380px]:text-[11.5px] text-akua-ink [overflow-wrap:normal] [word-break:keep-all]">{c.shortName ?? c.name}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>

          <div className="mt-7 rounded-[12px] border border-akua-gray-200 bg-akua-white p-4">
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
                  <a key={x.id} href={x.url} target="_blank" rel="noopener" aria-label={x.label} className="block rounded-full">
                    <SocialBrandBadge network={x.network} className="size-10" />
                  </a>
                ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

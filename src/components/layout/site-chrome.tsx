"use client";

import { usePathname } from "next/navigation";
import { AddedToast } from "@/components/cart/added-toast";
import { CartBar, WhatsAppFab } from "@/components/cart/whatsapp-order-bar";
import { VisitTracker } from "@/components/analytics/visit-tracker";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchDialog } from "@/components/ui/search-dialog";
import { ADMIN_BASE, TEAM_BASE } from "@/config/admin-base";

/** En-tête, pied de page et éléments flottants du site public : absents de l'espace administrateur. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path?.startsWith(ADMIN_BASE) || path?.startsWith(TEAM_BASE)) return <>{children}</>;
  return (
    <>
      <a href="#contenu" className="sr-only z-[70] rounded-lg bg-akua-blue px-4 py-2 text-akua-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Aller au contenu
      </a>
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenu">{children}</main>
      <Footer />
      <MobileBottomNav />
      <MobileMenu />
      <CartBar />
      <WhatsAppFab />
      <AddedToast />
      <SearchDialog />
      <VisitTracker />
    </>
  );
}

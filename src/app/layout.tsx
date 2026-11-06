import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AddedToast } from "@/components/cart/added-toast";
import { CartBar, WhatsAppFab } from "@/components/cart/whatsapp-order-bar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchDialog } from "@/components/ui/search-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/config/site";
import "./globals.css";

// Inter auto-hébergée (variable 400–800) : aucune dépendance réseau au build.
const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  weight: "400 800",
  src: [
    { path: "./fonts/inter-latin-var.woff2", style: "normal" },
    { path: "./fonts/inter-latin-ext-var.woff2", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description:
    "Consoles, jeux vidéo, manettes et accessoires neufs scellés et garantis. Vente en gros et au détail, livraison dans 7 pays d'Afrique de l'Ouest.",
  openGraph: { type: "website", locale: "fr_FR", siteName: SITE_NAME },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable}`}>
      <body>
        <TooltipProvider>
          <a href="#contenu" className="sr-only z-[70] rounded-lg bg-akua-blue px-4 py-2 text-akua-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
            Aller au contenu
          </a>
          <SiteHeader />
          <main id="contenu">{children}</main>
          <Footer />
          <MobileBottomNav />
          <MobileMenu />
          <CartBar />
          <WhatsAppFab />
          <AddedToast />
          <SearchDialog />
        </TooltipProvider>
      </body>
    </html>
  );
}

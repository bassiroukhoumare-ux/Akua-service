import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { CatalogProvider } from "@/components/catalog-provider";
import { SiteChrome } from "@/components/layout/site-chrome";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/config/site";
import { ShopSettingsProvider } from "@/components/shop-settings-provider";
import { loadCatalog, loadSettings } from "@/lib/catalog";
import { setWhatsAppNumber } from "@/lib/whatsapp";
import { RatesProvider } from "@/components/currency";
import { getRates } from "@/lib/rates";
import { GlowTracker } from "@/components/ui/glow-tracker";
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

// Sora auto-hébergée (variable 400–800) : titres, prix et chiffres clés.
const sora = localFont({
  variable: "--font-sora",
  display: "swap",
  weight: "400 800",
  src: [{ path: "./fonts/sora-latin-var.woff2", style: "normal" }],
});

// Les pages publiques se régénèrent toutes seules au plus tard une minute après un changement de contenu
// (bannières, catalogue, promos, réglages), même si le signal de rafraîchissement n'est pas parti.
export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description:
    "Consoles et jeux vidéo, ordinateurs, tablettes, accessoires informatiques et équipements électroniques, testés et garantis. Vente en gros et au détail, livraison et expédition possibles.",
  // image affichée quand on partage un lien du site (WhatsApp, Facebook…) : 1200 × 630 px
  openGraph: { type: "website", locale: "fr_FR", siteName: SITE_NAME, url: "/", images: [{ url: "/og-akua-service.jpg", width: 1200, height: 630, alt: `${SITE_NAME} · ${SITE_TAGLINE}`, type: "image/jpeg" }] },
  twitter: { card: "summary_large_image", images: ["/og-akua-service.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ products, categories }, settings, rates] = await Promise.all([loadCatalog(), loadSettings(), getRates()]);
  setWhatsAppNumber(settings.whatsapp);
  return (
    <html lang="fr" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <GlowTracker />
        <TooltipProvider>
          <CatalogProvider value={{ products, categories: [...categories].sort((a, b) => a.order - b.order) }}>
            <ShopSettingsProvider value={settings}>
              <RatesProvider value={rates}>
                <SiteChrome>{children}</SiteChrome>
              </RatesProvider>
            </ShopSettingsProvider>
          </CatalogProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

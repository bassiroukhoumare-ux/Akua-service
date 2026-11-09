import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { CatalogProvider } from "@/components/catalog-provider";
import { SiteChrome } from "@/components/layout/site-chrome";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/config/site";
import { ShopSettingsProvider } from "@/components/shop-settings-provider";
import { loadCatalog, loadSettings } from "@/lib/catalog";
import { setWhatsAppNumber } from "@/lib/whatsapp";
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
    "Consoles, jeux vidéo, manettes et accessoires testés et garantis. Vente en gros et au détail, livraison au Togo et dans la sous-région.",
  openGraph: { type: "website", locale: "fr_FR", siteName: SITE_NAME },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ products, categories }, settings] = await Promise.all([loadCatalog(), loadSettings()]);
  setWhatsAppNumber(settings.whatsapp);
  return (
    <html lang="fr" className={`${inter.variable}`}>
      <body>
        <TooltipProvider>
          <CatalogProvider value={{ products, categories: [...categories].sort((a, b) => a.order - b.order) }}>
            <ShopSettingsProvider value={settings}>
              <SiteChrome>{children}</SiteChrome>
            </ShopSettingsProvider>
          </CatalogProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

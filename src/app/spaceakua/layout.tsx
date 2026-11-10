import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Espace administrateur", template: "%s | Admin AKUA Service" },
  robots: { index: false, follow: false },
  // application installable (écran d'accueil) avec notifications
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "AKUA Admin", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

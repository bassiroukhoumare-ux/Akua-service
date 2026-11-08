import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Espace administrateur", template: "%s | Admin AKUA Service" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

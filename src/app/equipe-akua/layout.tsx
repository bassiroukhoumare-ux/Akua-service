import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Espace équipe", template: "%s | Espace équipe AKUA Service" },
  robots: { index: false, follow: false },
};

export default function TeamRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

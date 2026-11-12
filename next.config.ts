import type { NextConfig } from "next";

// anciennes adresses de rayons → nouvelles catégories (liens déjà partagés, favoris, Google)
const OLD_SHELVES: Record<string, string> = {
  consoles: "/boutique/consoles-jeux-video?type=consoles",
  packs: "/boutique/consoles-jeux-video?type=packs",
  jeux: "/boutique/consoles-jeux-video?type=jeux",
  manettes: "/boutique/consoles-jeux-video?type=manettes",
  simulation: "/boutique/consoles-jeux-video?type=simulation",
  informatique: "/boutique/ordinateurs-informatique",
  surveillance: "/boutique/electronique-equipements?type=securite",
};

const nextConfig: NextConfig = {
  // autorise l'accès au serveur de dev depuis un téléphone du même réseau Wi-Fi
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  async redirects() {
    return Object.entries(OLD_SHELVES).map(([old, destination]) => ({ source: `/boutique/${old}`, destination, permanent: false }));
  },
};

export default nextConfig;

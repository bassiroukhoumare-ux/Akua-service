import type { Category } from "@/types/catalog";

// Les 5 univers d'AKUA Service (+ « Promos », rayon automatique des produits en promotion).
export const categories: Category[] = [
  {
    id: "cat-consoles",
    slug: "consoles-jeux-video",
    name: "Consoles & Jeux vidéo",
    shortName: "Consoles & Jeux",
    icon: "console",
    order: 1,
    image: "/products/ps5-dualsense.webp",
    description: "PlayStation, Nintendo Switch, Xbox, jeux vidéo et accessoires gaming.",
    groups: [
      { slug: "consoles", name: "Consoles" },
      { slug: "packs", name: "Packs" },
      { slug: "jeux", name: "Jeux vidéo" },
      { slug: "manettes", name: "Manettes" },
      { slug: "simulation", name: "Volants & simulation" },
    ],
  },
  {
    id: "cat-informatique",
    slug: "ordinateurs-informatique",
    name: "Ordinateurs & Informatique",
    shortName: "Ordinateurs",
    icon: "laptop",
    order: 2,
    image: "/categories/univers-ordinateurs.webp",
    description: "Ordinateurs portables, équipements informatiques et accessoires pour ordinateur.",
    groups: [
      { slug: "portables", name: "Ordinateurs portables" },
      { slug: "equipements", name: "Équipements informatiques" },
      { slug: "stockage", name: "Stockage" },
    ],
  },
  {
    id: "cat-tablettes",
    slug: "tablettes",
    name: "Tablettes",
    icon: "tablet",
    order: 3,
    image: "/categories/univers-tablettes.webp",
    description: "Tablettes éducatives, professionnelles et accessoires pour tablettes.",
    groups: [
      { slug: "educatives", name: "Tablettes éducatives" },
      { slug: "professionnelles", name: "Tablettes professionnelles" },
      { slug: "accessoires", name: "Accessoires pour tablettes" },
    ],
  },
  {
    id: "cat-accessoires",
    slug: "accessoires-informatiques",
    name: "Accessoires informatiques",
    shortName: "Accessoires",
    icon: "mouse",
    order: 4,
    image: "/categories/univers-accessoires.webp",
    description: "Souris, claviers, supports, refroidisseurs, adaptateurs, hubs USB et autres accessoires.",
    groups: [
      { slug: "souris", name: "Souris" },
      { slug: "claviers", name: "Claviers" },
      { slug: "supports", name: "Supports & refroidisseurs" },
      { slug: "adaptateurs", name: "Adaptateurs & hubs USB" },
      { slug: "audio-video", name: "Casques & webcams" },
    ],
  },
  {
    id: "cat-electronique",
    slug: "electronique-equipements",
    name: "Électronique & Équipements",
    shortName: "Électronique",
    icon: "router",
    order: 5,
    image: "/categories/univers-electronique.webp",
    description: "Routeurs Wi-Fi, vidéoprojecteurs, caméras et autres équipements électroniques.",
    groups: [
      { slug: "reseau", name: "Routeurs Wi-Fi & réseau" },
      { slug: "projection", name: "Vidéoprojecteurs" },
      { slug: "securite", name: "Caméras de surveillance" },
      { slug: "audio-energie", name: "Onduleurs & énergie" },
    ],
  },
  {
    id: "cat-audio",
    slug: "audio-objets-connectes",
    name: "Audio & Objets connectés",
    shortName: "Audio",
    icon: "headphones",
    order: 6,
    image: "/categories/univers-audio.webp",
    description: "Casques, écouteurs sans fil, enceintes Bluetooth et montres connectées.",
    groups: [
      { slug: "casques", name: "Casques & écouteurs" },
      { slug: "enceintes", name: "Enceintes Bluetooth" },
      { slug: "montres", name: "Montres connectées" },
    ],
  },
  { id: "cat-promos", slug: "promos", name: "Promos", icon: "percent", order: 7, image: "/products/ds3.webp", description: "Les meilleures offres du moment." },
];

/** Catégories « réelles » (sans le rayon automatique des promotions). */
export const isPromoCategory = (c: { slug: string }) => c.slug === "promos";

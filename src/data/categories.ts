import type { Category } from "@/types/catalog";

export const categories: Category[] = [
  { id: "cat-consoles", slug: "consoles", name: "Consoles", icon: "console", order: 1, description: "PS5, PS4, Switch 2, PS3, Xbox 360 : neuves scellées et garanties." },
  { id: "cat-packs", slug: "packs", name: "Packs", icon: "pack", order: 2, description: "Consoles complètes avec manettes, jeux et accessoires, prêtes à jouer." },
  { id: "cat-jeux", slug: "jeux", name: "Jeux", icon: "disc", order: 3, description: "Les derniers jeux PS5, PS4 et Switch 2, neufs sous blister." },
  { id: "cat-manettes", slug: "manettes", name: "Manettes", icon: "gamepad", order: 4, description: "DualSense, DualShock, Xbox, Switch Pro et manettes Android." },
  { id: "cat-simulation", slug: "simulation", name: "Simulation", icon: "gauge", order: 5, description: "Volants, pédaliers et leviers de vitesse." },
  { id: "cat-informatique", slug: "informatique", name: "Informatique", icon: "hard-drive", order: 6, description: "Disques durs externes et stockage." },
  { id: "cat-surveillance", slug: "surveillance", name: "Surveillance", icon: "cctv", order: 7, description: "Caméras de surveillance pour maison et commerce." },
  { id: "cat-promos", slug: "promos", name: "Promos", icon: "percent", order: 8, description: "Les meilleures offres du moment." },
];

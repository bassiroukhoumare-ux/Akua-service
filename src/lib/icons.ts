import {
  BadgePercent,
  Backpack,
  BatteryCharging,
  Cable,
  Camera,
  Car,
  Cctv,
  CircuitBoard,
  Cpu,
  CreditCard,
  Dice5,
  Disc3,
  Drone,
  Fan,
  Film,
  Gamepad,
  Gamepad2,
  Gauge,
  Gift,
  Glasses,
  HardDrive,
  Headphones,
  Joystick,
  Keyboard,
  Laptop,
  Lightbulb,
  type LucideIcon,
  MemoryStick,
  Mic,
  Monitor,
  Mouse,
  Music,
  PackageOpen,
  Plug,
  Printer,
  Projector,
  Puzzle,
  Router,
  ShieldCheck,
  Smartphone,
  Speaker,
  Store,
  Tablet,
  Tag,
  Ticket,
  Trophy,
  Tv,
  Usb,
  Watch,
  Webcam,
  Wrench,
} from "lucide-react";

/** Trait unique pour toutes les icônes du site (look premium cohérent). */
export const ICON_STROKE = 1.75;

export interface CategoryIconDef {
  icon: LucideIcon;
  label: string;
  /** mots-clés (sans accents) qui font proposer cette icône à partir du nom de la catégorie */
  keywords: string[];
}

/** Registre des icônes de catégories : les données stockent le nom (clé) en texte. */
export const CATEGORY_ICON_DEFS: Record<string, CategoryIconDef> = {
  console: { icon: Gamepad2, label: "Console", keywords: ["console", "playstation", "ps5", "ps4", "ps3", "xbox", "nintendo", "switch", "jeux video"] },
  pack: { icon: PackageOpen, label: "Pack", keywords: ["pack", "bundle", "lot", "coffret", "complet"] },
  disc: { icon: Disc3, label: "Jeu (disque)", keywords: ["jeu", "jeux", "disque", "cd", "dvd", "blu-ray", "bluray", "cartouche"] },
  gamepad: { icon: Gamepad, label: "Manette", keywords: ["manette", "controleur", "controller", "dualsense", "dualshock", "joypad"] },
  joystick: { icon: Joystick, label: "Arcade / rétro", keywords: ["arcade", "retro", "joystick", "borne", "fight stick"] },
  gauge: { icon: Gauge, label: "Simulation", keywords: ["simulation", "volant", "pedalier", "levier", "course", "racing"] },
  car: { icon: Car, label: "Voiture", keywords: ["voiture", "auto", "automobile", "vehicule"] },
  "hard-drive": { icon: HardDrive, label: "Stockage", keywords: ["disque dur", "stockage", "ssd", "hdd", "informatique"] },
  memory: { icon: MemoryStick, label: "Carte mémoire", keywords: ["carte memoire", "memoire", "sd", "ram"] },
  usb: { icon: Usb, label: "Clé USB", keywords: ["usb", "cle", "flash"] },
  laptop: { icon: Laptop, label: "Ordinateur portable", keywords: ["ordinateur", "pc", "laptop", "portable", "macbook", "notebook"] },
  monitor: { icon: Monitor, label: "Écran", keywords: ["ecran", "moniteur", "monitor", "affichage"] },
  tv: { icon: Tv, label: "Télévision", keywords: ["television", "tele", "tv", "smart tv"] },
  projector: { icon: Projector, label: "Projecteur", keywords: ["projecteur", "videoprojecteur", "projection"] },
  keyboard: { icon: Keyboard, label: "Clavier", keywords: ["clavier", "keyboard", "accessoires pc", "peripherique"] },
  mouse: { icon: Mouse, label: "Souris", keywords: ["souris", "mouse", "tapis"] },
  cpu: { icon: Cpu, label: "Composants", keywords: ["composant", "processeur", "cpu", "carte graphique", "gpu"] },
  circuit: { icon: CircuitBoard, label: "Électronique", keywords: ["electronique", "carte mere", "circuit", "piece"] },
  fan: { icon: Fan, label: "Refroidissement", keywords: ["ventilateur", "refroidissement", "cooling", "ventilation"] },
  smartphone: { icon: Smartphone, label: "Téléphone", keywords: ["telephone", "smartphone", "mobile", "iphone", "android", "samsung"] },
  tablet: { icon: Tablet, label: "Tablette", keywords: ["tablette", "ipad", "tablet"] },
  watch: { icon: Watch, label: "Montre", keywords: ["montre", "smartwatch", "bracelet connecte"] },
  headphones: { icon: Headphones, label: "Casque audio", keywords: ["casque", "ecouteur", "audio", "headset", "airpods"] },
  speaker: { icon: Speaker, label: "Enceinte", keywords: ["enceinte", "haut-parleur", "son", "speaker", "barre de son"] },
  mic: { icon: Mic, label: "Micro", keywords: ["micro", "microphone", "streaming", "podcast"] },
  music: { icon: Music, label: "Musique", keywords: ["musique", "instrument"] },
  webcam: { icon: Webcam, label: "Webcam", keywords: ["webcam", "visio"] },
  camera: { icon: Camera, label: "Appareil photo", keywords: ["appareil photo", "photo", "camera", "objectif"] },
  cctv: { icon: Cctv, label: "Surveillance", keywords: ["surveillance", "securite", "videosurveillance", "cctv", "camera de surveillance"] },
  shield: { icon: ShieldCheck, label: "Protection", keywords: ["protection", "housse", "etui", "coque", "film"] },
  drone: { icon: Drone, label: "Drone", keywords: ["drone"] },
  vr: { icon: Glasses, label: "Réalité virtuelle", keywords: ["vr", "realite virtuelle", "casque vr", "oculus", "lunettes"] },
  router: { icon: Router, label: "Réseau", keywords: ["reseau", "routeur", "wifi", "internet", "modem"] },
  cable: { icon: Cable, label: "Câbles", keywords: ["cable", "hdmi", "connectique", "fil"] },
  plug: { icon: Plug, label: "Adaptateur", keywords: ["adaptateur", "prise", "alimentation", "multiprise"] },
  battery: { icon: BatteryCharging, label: "Charge", keywords: ["chargeur", "batterie", "powerbank", "charge", "station de charge"] },
  printer: { icon: Printer, label: "Imprimante", keywords: ["imprimante", "impression", "encre", "scanner"] },
  light: { icon: Lightbulb, label: "Éclairage", keywords: ["eclairage", "led", "lampe", "lumiere", "ring light"] },
  backpack: { icon: Backpack, label: "Sacs", keywords: ["sac", "sacoche", "valise", "transport"] },
  card: { icon: CreditCard, label: "Cartes et abonnements", keywords: ["carte psn", "carte cadeau", "abonnement", "psn", "xbox live", "game pass", "credit"] },
  gift: { icon: Gift, label: "Cadeaux", keywords: ["cadeau", "coffret cadeau", "offre", "noel"] },
  ticket: { icon: Ticket, label: "Billets", keywords: ["billet", "ticket", "evenement", "tournoi inscription"] },
  trophy: { icon: Trophy, label: "Compétition", keywords: ["tournoi", "competition", "esport", "trophee"] },
  puzzle: { icon: Puzzle, label: "Jeux de société", keywords: ["societe", "puzzle", "plateau", "jouet"] },
  dice: { icon: Dice5, label: "Jeux et loisirs", keywords: ["loisir", "de", "casino"] },
  film: { icon: Film, label: "Films", keywords: ["film", "cinema", "serie"] },
  wrench: { icon: Wrench, label: "Réparation", keywords: ["reparation", "depannage", "entretien", "service", "sav", "outil"] },
  store: { icon: Store, label: "Boutique", keywords: ["boutique", "magasin", "occasion", "destockage"] },
  tag: { icon: Tag, label: "Soldes", keywords: ["solde", "destockage", "liquidation", "bon plan"] },
  percent: { icon: BadgePercent, label: "Promotions", keywords: ["promo", "promotion", "reduction", "remise", "%"] },
};

/** Compatibilité : registre simple nom → icône, utilisé par le site public. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = Object.fromEntries(Object.entries(CATEGORY_ICON_DEFS).map(([k, v]) => [k, v.icon]));

export function getCategoryIcon(name?: string): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Gamepad2;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .trim();

/**
 * Propose l'icône la plus adaptée au nom d'une catégorie (« Casques audio » → casque).
 * Les mots-clés les plus longs l'emportent (« camera de surveillance » avant « camera »).
 */
export function suggestCategoryIcon(name: string): string | null {
  const n = ` ${norm(name)} `;
  if (n.trim().length < 2) return null;
  let best: { key: string; score: number } | null = null;
  for (const [key, def] of Object.entries(CATEGORY_ICON_DEFS)) {
    for (const kw of def.keywords) {
      const k = norm(kw);
      // mot entier, ou début de mot (pluriels : « manettes », « casques »)
      const hit = n.includes(` ${k} `) || n.includes(` ${k}s `) || n.includes(` ${k}x `) || (k.length >= 4 && n.includes(` ${k}`));
      if (hit && (!best || k.length > best.score)) best = { key, score: k.length };
    }
  }
  return best?.key ?? null;
}

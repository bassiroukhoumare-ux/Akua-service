import {
  BadgePercent,
  Cctv,
  Disc3,
  Gamepad,
  Gamepad2,
  Gauge,
  HardDrive,
  type LucideIcon,
  PackageOpen,
} from "lucide-react";

/** Trait unique pour toutes les icônes du site (look premium cohérent). */
export const ICON_STROKE = 1.75;

/** Registre des icônes de catégories (les données stockent le nom en texte). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  console: Gamepad2,
  pack: PackageOpen,
  disc: Disc3,
  gamepad: Gamepad,
  gauge: Gauge,
  "hard-drive": HardDrive,
  cctv: Cctv,
  percent: BadgePercent,
};

export function getCategoryIcon(name?: string): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Gamepad2;
}

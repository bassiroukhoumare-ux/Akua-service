import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "soft" | "solid" | "dark" | "glass" | "whatsapp";
type Size = "sm" | "md" | "lg";

interface IconTileProps {
  icon: LucideIcon;
  tone?: Tone;
  size?: Size;
  /** conservé pour compatibilité : les icônes sont désormais affichées sans cadre */
  shape?: "circle" | "squircle";
  className?: string;
  label?: string;
}

const sizes: Record<Size, string> = { sm: "size-6", md: "size-8", lg: "size-10" };

const tones: Record<Tone, string> = {
  soft: "text-akua-ink",
  solid: "text-akua-blue",
  dark: "text-akua-white",
  glass: "text-akua-white",
  whatsapp: "text-akua-whatsapp",
};

/** Icône premium affichée seule, au trait fin, sans tuile ni cadre arrondi. */
export function IconTile({ icon: Icon, tone = "soft", size = "md", className, label }: IconTileProps) {
  return (
    <Icon
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      strokeWidth={1.4}
      className={cn("shrink-0", sizes[size], tones[tone], className)}
    />
  );
}

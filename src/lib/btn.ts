import { cn } from "@/lib/utils";

export type BtnVariant = "primary" | "dark" | "outline" | "light" | "whatsapp" | "soft";
export type BtnSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "btn-shine inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:relative [&_svg]:z-[2]";

const variants: Record<BtnVariant, string> = {
  primary: "bg-akua-blue text-akua-white glow-blue hover:bg-akua-blue-600",
  dark: "bg-akua-ink text-akua-white glow-ink hover:bg-akua-black",
  outline: "border border-akua-gray-200 bg-akua-white text-akua-ink [--shine:rgb(31_91_255/0.2)] hover:border-akua-ink",
  light: "bg-akua-white text-akua-ink [--shine:rgb(31_91_255/0.24)] hover:shadow-[0_12px_30px_-12px_rgb(7_8_12/0.45)]",
  whatsapp: "bg-akua-whatsapp text-akua-white hover:shadow-[0_12px_30px_-10px_rgb(37_211_102/0.7)]",
  soft: "bg-akua-blue-100 text-akua-blue [--shine:rgb(255_255_255/0.8)] hover:bg-akua-blue hover:text-akua-white",
};

const sizes: Record<BtnSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-[52px] px-7 text-[15px]",
  icon: "size-11",
  "icon-sm": "size-9",
};

/** Classes de bouton AKUA (lueur droite → gauche au survol). */
export function btn({ variant = "primary", size = "md", className }: { variant?: BtnVariant; size?: BtnSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

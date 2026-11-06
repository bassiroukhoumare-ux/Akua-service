import Image from "next/image";
import { cn } from "@/lib/utils";

interface WhatsAppIconProps {
  size?: number;
  className?: string;
  /** white : sur fond vert/bleu/noir · black : sur fond clair · color : logo rond officiel */
  variant?: "white" | "black" | "color";
}

const SRC = {
  white: "/brand/whatsapp-white.png",
  black: "/brand/whatsapp-black.png",
  color: "/brand/whatsapp-color.png",
};

/** Logo WhatsApp officiel (fichiers fournis par AKUA Service). */
export function WhatsAppIcon({ size = 20, className, variant = "white" }: WhatsAppIconProps) {
  return <Image src={SRC[variant]} alt="" aria-hidden width={size} height={size} className={cn("relative z-[2] shrink-0 select-none", className)} />;
}

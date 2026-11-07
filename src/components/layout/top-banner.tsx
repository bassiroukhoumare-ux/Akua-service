import { ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TOP_BANNER } from "@/config/banner";

/** Bannière bord à bord au ratio fixe 1920 × 250 : même format sur ordinateur et mobile. */
export function TopBanner() {
  const { enabled, src, width, height, href, alt } = TOP_BANNER;
  if (!enabled) return null;
  const ratio = { aspectRatio: `${width} / ${height}` };

  if (!src) {
    return (
      <div style={ratio} className="relative w-full overflow-hidden bg-akua-blue-100" role="img" aria-label="Emplacement de la bannière">
        <div aria-hidden className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(-45deg,transparent_0_16px,color-mix(in_oklab,var(--akua-blue)_10%,transparent)_16px_32px)]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-1 px-4 text-center text-akua-blue">
          <ImageIcon aria-hidden className="size-4 md:size-7" />
          <p className="text-[11px] font-bold md:text-[18px]">Bannière · 1920 × 200 px</p>
          <p className="hidden text-[13px] font-medium opacity-80 md:block">Même format sur mobile : l&apos;image se réduit sans être déformée.</p>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} aria-label={alt} style={ratio} className="relative block w-full overflow-hidden bg-akua-blue-100">
      <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
    </Link>
  );
}

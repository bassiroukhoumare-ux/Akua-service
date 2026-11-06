import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** hauteur du logo (classe Tailwind), la largeur suit le ratio officiel 2,28:1 */
  className?: string;
  href?: string | null;
  priority?: boolean;
}

/** Logo officiel AKUA SERVICE (fichier fourni : « LOGO AKUA.png »). */
export function Logo({ className, href = "/", priority }: LogoProps) {
  const img = (
    <Image
      src="/brand/logo-akua.webp"
      alt="AKUA Service"
      width={638}
      height={280}
      priority={priority}
      className={cn("h-10 w-auto select-none", className)}
    />
  );
  if (!href) return img;
  return (
    <Link href={href} aria-label="AKUA Service, accueil" className="inline-flex shrink-0 rounded-md">
      {img}
    </Link>
  );
}

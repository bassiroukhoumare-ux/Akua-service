import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  text?: string;
  icon?: LucideIcon;
  /** conservé pour compatibilité */
  word?: string;
  image?: string;
  children?: React.ReactNode;
}

/** En-tête de page : dégradé bleu léger, fil d'Ariane, titre, visuel produit. */
export function PageHero({ eyebrow, title, text, icon: Icon, image, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-akua-gray-200">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--akua-blue-100)_80%,var(--akua-white))_0%,var(--akua-white)_100%)]" />
      <div className="container-akua relative grid items-center gap-6 py-8 md:grid-cols-[1fr_auto] md:py-12">
        <div>
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[12.5px] text-akua-gray-500">
            <Link href="/" className="hover:text-akua-ink">
              Accueil
            </Link>
            <span aria-hidden>›</span>
            <span className="font-medium text-akua-ink">{eyebrow}</span>
          </nav>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-akua-white px-3 py-1.5 text-[12.5px] font-semibold text-akua-blue ring-1 ring-akua-gray-200">
            {Icon && <Icon aria-hidden className="size-4" strokeWidth={2} />}
            {eyebrow}
          </p>
          <h1 className="mt-3 text-[30px] leading-tight font-extrabold tracking-[-0.02em] md:text-[44px]">{title}</h1>
          {text && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-akua-gray-500">{text}</p>}
          {children}
        </div>
        {image && (
          <div className="relative hidden aspect-[2/1] w-[380px] md:block">
            <Image src={image} alt="" fill priority sizes="380px" className="object-contain drop-shadow-[0_30px_30px_rgb(11_16_32/0.25)]" />
          </div>
        )}
      </div>
    </section>
  );
}

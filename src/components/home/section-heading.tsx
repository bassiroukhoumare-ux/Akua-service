import { cn } from "@/lib/utils";

/**
 * Titre de section : libellé en capitales, souligné d'un trait bleu sur une ligne grise,
 * avec l'action (« Voir tout ») alignée à droite.
 */
export function SectionHeading({
  eyebrow,
  title,
  children,
  className,
}: {
  index?: string;
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  centerMobile?: boolean;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4 border-b border-akua-gray-200", className)}>
      <div className="relative -mb-px min-w-0 border-b-2 border-akua-blue pb-3">
        {eyebrow && <p className="mb-1 text-[11px] font-semibold tracking-[0.14em] text-akua-blue uppercase">{eyebrow}</p>}
        <h2 className="text-[18px] leading-tight font-extrabold tracking-[-0.01em] text-balance text-akua-ink uppercase md:text-[24px]">{title}</h2>
      </div>
      {children && <div className="flex shrink-0 items-center gap-3 pb-2.5">{children}</div>}
    </div>
  );
}

/** Lien « Voir tout » des titres de section. */
export const headingLink = "group inline-flex items-center gap-1.5 text-[13px] font-bold tracking-[0.02em] whitespace-nowrap text-akua-blue uppercase transition-colors hover:text-akua-blue-600 md:text-[13.5px]";

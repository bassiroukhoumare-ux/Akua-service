import { ArrowDownRight, ArrowUpRight, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Titre de page : sur-titre, titre, description et actions à droite. */
export function PageHeader({ title, description, actions, className }: { title: string; description?: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-[26px] leading-[1.1] font-extrabold tracking-[-0.03em] md:text-[32px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[14.5px] text-akua-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Carte blanche de l'espace admin. */
export function Panel({ title, description, action, children, className, bodyClassName }: { title?: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("rounded-[26px] border border-akua-gray-200/90 bg-akua-white shadow-[0_1px_2px_rgb(11_16_32/0.03),0_14px_34px_-28px_rgb(11_16_32/0.22)]", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5 md:px-6 md:pt-6">
          <div className="min-w-0">
            {title && <h2 className="text-[16.5px] font-bold tracking-[-0.015em]">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-akua-gray-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-5 md:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Bandeau : les chiffres affichés sont des exemples tant que la base de données n'est pas branchée. */
export function DemoNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-dashed border-akua-blue/35 bg-akua-blue-100/50 px-4 py-3 text-[13.5px]">
      <Info aria-hidden className="mt-0.5 size-[18px] shrink-0 text-akua-blue" strokeWidth={1.8} />
      <p className="text-akua-ink">
        <span className="font-semibold">Données d&apos;exemple.</span>{" "}
        <span className="text-akua-gray-500">{children ?? "Cet écran montre le design final. Les vrais chiffres s'afficheront dès que la base de données sera branchée."}</span>
      </p>
    </div>
  );
}

export function DemoChip({ className }: { className?: string }) {
  return <span className={cn("inline-flex h-6 items-center rounded-full bg-akua-page px-2.5 text-[11px] font-semibold text-akua-gray-500", className)}>Exemple</span>;
}

const nf = new Intl.NumberFormat("fr-FR");
export const formatNumber = (n: number) => nf.format(n).replace(/ | /g, " ");

/** Tuile chiffre clé : libellé, valeur, évolution par rapport à la période précédente. */
export function StatTile({ icon: Icon, label, value, delta, hint, invert }: { icon: LucideIcon; label: string; value: string; delta?: number; hint?: string; invert?: boolean }) {
  // invert : une hausse est une mauvaise nouvelle (ex. paniers abandonnés)
  const good = delta === undefined ? true : invert ? delta <= 0 : delta >= 0;
  return (
    <div className="group rounded-[26px] border border-akua-gray-200/90 bg-akua-white p-5 shadow-[0_1px_2px_rgb(11_16_32/0.03),0_14px_34px_-28px_rgb(11_16_32/0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-28px_rgb(31_91_255/0.4)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-akua-gray-500">{label}</p>
        <span className="grid size-10 place-items-center rounded-[14px] bg-akua-page transition-colors group-hover:bg-akua-blue-100">
          <Icon aria-hidden className="size-[18px] text-akua-ink transition-colors group-hover:text-akua-blue" strokeWidth={1.7} />
        </span>
      </div>
      <p className="mt-3 text-[28px] leading-none font-extrabold tracking-[-0.035em] tabular-nums md:text-[32px]">{value}</p>
      <div className="mt-3 flex items-center gap-2 text-[12.5px]">
        {delta !== undefined && (
          <span className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold whitespace-nowrap", good ? "bg-akua-whatsapp/12 text-[#128c4a]" : "bg-akua-red/10 text-akua-red")}>
            {delta >= 0 ? <ArrowUpRight aria-hidden className="size-3.5" /> : <ArrowDownRight aria-hidden className="size-3.5" />}
            {Math.abs(delta)} %
          </span>
        )}
        {hint && <span className="hidden min-w-0 truncate text-akua-gray-500 sm:inline">{hint}</span>}
      </div>
    </div>
  );
}

/**
 * Téléphone : boutons d'action principaux fixés en bas de l'écran (au-dessus de la barre de navigation
 * de l'espace équipe), pour les atteindre au pouce. Sur ordinateur, ils restent dans l'en-tête.
 */
export function MobileActions({ children }: { children: React.ReactNode; team?: boolean }) {
  return (
    <>
      <div aria-hidden className="h-20 lg:hidden" />
      <div className={cn("fixed inset-x-0 z-30 border-t border-akua-gray-200 bg-akua-white/95 px-4 pt-3 pb-3 backdrop-blur-xl lg:hidden", "bottom-[calc(62px+env(safe-area-inset-bottom))]")}>
        <div className="mx-auto flex max-w-[560px] gap-2.5 [&>*]:flex-1">{children}</div>
      </div>
    </>
  );
}

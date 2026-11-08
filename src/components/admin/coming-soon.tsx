import { ArrowLeft, Hammer } from "lucide-react";
import Link from "next/link";
import { ADMIN_CURRENT_STEP, type AdminModule } from "@/config/admin";
import { btn } from "@/lib/btn";
import { PageHeader } from "./ui";

/** Module d'une étape suivante : page d'attente, dans le design final. */
export function ComingSoon({ module: m, base }: { module: AdminModule; base: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={m.label} description={m.description} />
      <div className="flex flex-col items-center rounded-[28px] border border-dashed border-akua-gray-200 bg-akua-white px-6 py-16 text-center md:py-24">
        <span className="relative grid size-16 place-items-center rounded-[20px] bg-akua-page">
          <m.icon aria-hidden className="size-7 text-akua-ink" strokeWidth={1.5} />
          <span className="absolute -right-1.5 -bottom-1.5 grid size-7 place-items-center rounded-full bg-akua-blue text-akua-white ring-4 ring-akua-white">
            <Hammer aria-hidden className="size-3.5" strokeWidth={2} />
          </span>
        </span>
        <p className="mt-5 text-[20px] font-extrabold tracking-[-0.02em]">Bientôt disponible</p>
        <p className="mt-1.5 max-w-md text-[14.5px] text-akua-gray-500">
          Ce module est prévu à l&apos;étape {m.step}
          {m.step === ADMIN_CURRENT_STEP + 1 ? ", juste après la validation de l'étape en cours" : ""}. Le menu et l&apos;accès sont déjà prêts.
        </p>
        <Link href={base} className={btn({ variant: "outline", size: "md", className: "mt-6" })}>
          <ArrowLeft aria-hidden className="size-4" /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}

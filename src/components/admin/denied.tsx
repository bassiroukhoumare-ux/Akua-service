import { Lock } from "lucide-react";
import Link from "next/link";
import { TEAM_BASE } from "@/config/admin-base";
import { btn } from "@/lib/btn";

/** Module non attribué à l'équipier connecté. */
export function Denied() {
  return (
    <div className="flex flex-col items-center rounded-[28px] border border-akua-gray-200 bg-akua-white px-6 py-16 text-center md:py-24">
      <span className="grid size-16 place-items-center rounded-[20px] bg-akua-page">
        <Lock aria-hidden className="size-7 text-akua-ink" strokeWidth={1.5} />
      </span>
      <p className="mt-5 text-[20px] font-extrabold tracking-[-0.02em]">Accès non autorisé</p>
      <p className="mt-1.5 max-w-md text-[14.5px] text-akua-gray-500">Ce module ne vous a pas été attribué. Demandez au responsable de la boutique si vous en avez besoin.</p>
      <Link href={TEAM_BASE} className={btn({ variant: "outline", size: "md", className: "mt-6" })}>
        Retour à mon espace
      </Link>
    </div>
  );
}

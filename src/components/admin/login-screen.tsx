import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import type { PortalKind } from "@/config/admin-base";
import { LoginForm } from "./login-form";
import { Aurora, Reveal } from "./login-visual";

const COPY: Record<PortalKind, { eyebrow: string; sub: string }> = {
  owner: {
    eyebrow: "Espace administrateur",
    sub: "Entrez votre mot de passe pour ouvrir l'espace administrateur.",
  },
  team: {
    eyebrow: "Espace équipe",
    sub: "Réservé uniquement aux équipes d'AKUA Service. Connectez-vous avec votre numéro WhatsApp et votre mot de passe.",
  },
};

/** Écran de connexion d'un portail : uniquement le formulaire, centré. */
export function LoginScreen({ kind }: { kind: PortalKind }) {
  const c = COPY[kind];
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-akua-white px-5 text-akua-ink">
      <Aurora />
      <main className="relative mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
        <Reveal className="flex justify-center">
          <Logo href={null} priority className="h-12" />
        </Reveal>
        <Reveal delay={0.08} className="mt-8">
          <div className="rounded-[30px] border border-akua-gray-200/80 bg-akua-white/90 p-7 shadow-[0_40px_90px_-40px_rgb(23_45_120/0.4)] backdrop-blur-2xl sm:p-9">
            <p className="flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] text-akua-blue uppercase">
              <ShieldCheck aria-hidden className="size-[18px]" strokeWidth={1.8} />
              {c.eyebrow}
            </p>
            <h1 className="mt-3 text-[30px] leading-tight font-extrabold tracking-[-0.035em]">Accès privé</h1>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-akua-gray-500">{c.sub}</p>
            <div className="mt-7">
              <Suspense>
                <LoginForm kind={kind} />
              </Suspense>
            </div>
            <p className="mt-6 text-center text-[12.5px] leading-relaxed text-akua-gray-500">Mot de passe oublié ? Demandez-en un nouveau au responsable de la boutique.</p>
          </div>
        </Reveal>
      </main>
      <footer className="relative py-6 text-center text-[12px] text-akua-gray-500">© {new Date().getFullYear()} AKUA Service</footer>
    </div>
  );
}

import { Lock, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import type { PortalKind } from "@/config/admin-base";
import { LoginForm } from "./login-form";
import { Aurora, LoginScene, Reveal } from "./login-visual";

const COPY: Record<PortalKind, { eyebrow: string; title: React.ReactNode; text: string; heading: string; sub: string; foot: string }> = {
  owner: {
    eyebrow: "Espace administrateur",
    title: (
      <>
        Votre boutique, <span className="bg-gradient-to-r from-akua-blue to-[#6b8cff] bg-clip-text text-transparent">en un seul endroit.</span>
      </>
    ),
    text: "Produits, accueil, promotions, clients, statistiques et équipe : tout ce qui s'affiche sur le site se gère ici.",
    heading: "Bon retour.",
    sub: "Entrez votre mot de passe pour ouvrir l'espace administrateur.",
    foot: "Connexion chiffrée · session limitée à cet appareil",
  },
  team: {
    eyebrow: "Espace équipe",
    title: (
      <>
        Votre espace de travail <span className="bg-gradient-to-r from-akua-blue to-[#6b8cff] bg-clip-text text-transparent">AKUA Service.</span>
      </>
    ),
    text: "Retrouvez les tâches qui vous ont été confiées. Chaque modification est enregistrée à votre nom.",
    heading: "Connexion équipe",
    sub: "Utilisez le numéro WhatsApp et le mot de passe reçus du responsable.",
    foot: "Mot de passe oublié ? Demandez-en un nouveau au responsable de la boutique.",
  },
};

/** Écran de connexion d'un portail (propriétaire ou équipe). */
export function LoginScreen({ kind }: { kind: PortalKind }) {
  const c = COPY[kind];
  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-akua-white text-akua-ink">
      <Aurora />

      <div className="relative mx-auto grid min-h-dvh max-w-[1280px] grid-rows-[auto_1fr_auto] px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2.5">
            <Logo href={null} priority className="h-10 sm:h-11" />
            {kind === "team" && <span className="rounded-full bg-akua-blue-100 px-2 py-0.5 text-[10.5px] font-bold tracking-[0.08em] text-akua-blue uppercase">Équipe</span>}
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-akua-white/70 px-3 py-1.5 text-[12px] font-semibold text-akua-gray-500 ring-1 ring-akua-gray-200 backdrop-blur sm:inline-flex">
            <Lock aria-hidden className="size-3.5" strokeWidth={2} /> Accès privé
          </span>
        </header>

        <main className="grid items-center gap-10 py-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,440px)] lg:gap-16">
          <div className="hidden lg:block">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-akua-white/80 px-3 py-1.5 text-[12px] font-bold tracking-[0.08em] text-akua-blue uppercase ring-1 ring-akua-blue/15 backdrop-blur">
                <ShieldCheck aria-hidden className="size-4" strokeWidth={2} /> {c.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 max-w-[580px] text-[48px] leading-[1.02] font-extrabold tracking-[-0.045em] text-balance xl:text-[58px]">{c.title}</h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-[460px] text-[16px] leading-relaxed text-akua-gray-500">{c.text}</p>
            </Reveal>
            <div className="mt-8">
              <LoginScene kind={kind} />
            </div>
          </div>

          <Reveal delay={0.1} className="mx-auto w-full max-w-[440px]">
            <div className="relative">
              <div aria-hidden className="absolute -inset-px rounded-[33px] bg-gradient-to-b from-akua-white via-akua-blue/10 to-akua-blue/25 opacity-80" />
              <div className="relative rounded-[32px] border border-akua-white bg-akua-white/90 p-7 shadow-[0_50px_100px_-40px_rgb(23_45_120/0.45),0_1px_0_rgb(255_255_255)_inset] backdrop-blur-2xl sm:p-9">
                <span className="grid size-14 place-items-center rounded-[18px] bg-gradient-to-br from-akua-blue to-[#4f7bff] text-akua-white shadow-[0_16px_30px_-12px_rgb(31_91_255/0.7)]">
                  <Lock aria-hidden className="size-6" strokeWidth={1.9} />
                </span>
                <h2 className="mt-6 text-[30px] leading-tight font-extrabold tracking-[-0.035em]">{c.heading}</h2>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-akua-gray-500">{c.sub}</p>
                <div className="mt-7">
                  <Suspense>
                    <LoginForm kind={kind} />
                  </Suspense>
                </div>
                <p className="mt-6 flex items-start justify-center gap-1.5 text-center text-[12.5px] text-akua-gray-500">
                  <ShieldCheck aria-hidden className="mt-px size-3.5 shrink-0" strokeWidth={2} /> {c.foot}
                </p>
              </div>
            </div>
          </Reveal>
        </main>

        <footer className="py-6 text-center text-[12px] text-akua-gray-500 lg:text-left">© {new Date().getFullYear()} AKUA Service · Lomé, Togo</footer>
      </div>
    </div>
  );
}

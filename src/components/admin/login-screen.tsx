import { BarChart3, History, Layers, type LucideIcon, Package, ShieldCheck, Users } from "lucide-react";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import type { PortalKind } from "@/config/admin-base";
import { LoginForm } from "./login-form";

const COPY: Record<
  PortalKind,
  { badge: string; title: React.ReactNode; text: string; heading: string; sub: string; foot?: string; points: { icon: LucideIcon; t: string; d: string }[] }
> = {
  owner: {
    badge: "Espace administrateur",
    title: (
      <>
        Pilotez votre boutique, <span className="whitespace-nowrap text-[#7fa2ff]">de A à Z.</span>
      </>
    ),
    text: "Tout ce qui s'affiche sur le site se gère ici : produits, accueil, promotions, avis et équipe.",
    heading: "Connexion",
    sub: "Entrez votre mot de passe pour accéder à l'espace administrateur.",
    points: [
      { icon: Package, t: "Catalogue", d: "Produits, packs, catégories et images" },
      { icon: BarChart3, t: "Statistiques", d: "Visiteurs, pays et provenance" },
      { icon: Users, t: "Équipe", d: "Accès par équipier, droits sur mesure" },
    ],
  },
  team: {
    badge: "Espace équipe",
    title: (
      <>
        Votre espace de travail <span className="whitespace-nowrap text-[#7fa2ff]">AKUA Service.</span>
      </>
    ),
    text: "Retrouvez les tâches qui vous ont été confiées et gérez-les en toute simplicité.",
    heading: "Connexion équipe",
    sub: "Connectez-vous avec le numéro WhatsApp et le mot de passe que vous avez reçus.",
    foot: "Mot de passe oublié ? Contactez le responsable de la boutique.",
    points: [
      { icon: Layers, t: "Vos modules", d: "Uniquement les tâches qui vous sont confiées" },
      { icon: History, t: "Suivi", d: "Chaque modification est enregistrée à votre nom" },
      { icon: ShieldCheck, t: "Accès sécurisé", d: "Personnel, à ne jamais partager" },
    ],
  },
};

/** Écran de connexion d'un portail (propriétaire ou équipe). */
export function LoginScreen({ kind }: { kind: PortalKind }) {
  const c = COPY[kind];
  return (
    <div className="grid min-h-dvh bg-akua-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <aside className="relative hidden overflow-hidden bg-akua-ink p-12 text-akua-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div aria-hidden className="bg-grid absolute inset-0 opacity-[0.07]" />
        <div aria-hidden className="absolute -top-40 -right-40 size-[520px] rounded-full bg-akua-blue/35 blur-[120px]" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-akua-white/10 px-3 py-1.5 text-[12px] font-semibold tracking-[0.08em] uppercase ring-1 ring-akua-white/15">
            <ShieldCheck aria-hidden className="size-4 text-akua-blue-100" /> {c.badge}
          </span>
          <p className="mt-8 max-w-[520px] text-[44px] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance xl:text-[54px]">{c.title}</p>
          <p className="mt-4 max-w-sm text-[15px] text-akua-white/65">{c.text}</p>
        </div>
        <ul className="relative grid gap-3">
          {c.points.map((p) => (
            <li key={p.t} className="flex items-center gap-4 rounded-[20px] bg-akua-white/[0.06] p-4 ring-1 ring-akua-white/10 backdrop-blur">
              <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-akua-white/10">
                <p.icon aria-hidden className="size-5" strokeWidth={1.6} />
              </span>
              <span>
                <span className="block text-[15px] font-bold">{p.t}</span>
                <span className="block text-[13px] text-akua-white/60">{p.d}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-center gap-2.5 lg:justify-start">
          <Logo href={null} priority className="h-11" />
          {kind === "team" && <span className="rounded-full bg-akua-blue-100 px-2 py-0.5 text-[10.5px] font-bold tracking-[0.08em] text-akua-blue uppercase">Équipe</span>}
        </div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <h1 className="text-[30px] leading-tight font-extrabold tracking-[-0.03em]">{c.heading}</h1>
          <p className="mt-1.5 text-[14.5px] text-akua-gray-500">{c.sub}</p>
          <div className="mt-8">
            <Suspense>
              <LoginForm kind={kind} />
            </Suspense>
          </div>
          {c.foot && <p className="mt-6 text-center text-[12.5px] text-akua-gray-500">{c.foot}</p>}
        </div>
        <p className="text-center text-[12px] text-akua-gray-500">© {new Date().getFullYear()} AKUA Service</p>
      </main>
    </div>
  );
}

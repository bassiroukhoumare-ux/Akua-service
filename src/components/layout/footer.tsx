"use client";

import { ArrowUpRight, Clock, Globe2, MapPin, MessagesSquare, Navigation } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useCatalog } from "@/components/catalog-provider";
import { useShopSettings } from "@/components/shop-settings-provider";
import { SocialBrandBadge } from "@/components/ui/social-brand";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { summarizeHours } from "@/lib/shop-settings";

const ORDER = [
  { label: "Toute la boutique", href: "/boutique" },
  { label: "Promotions", href: "/boutique/promos" },
  { label: "Packs prêts à l'emploi", href: "/packs" },
  { label: "Mon panier", href: "/panier" },
  { label: "Mes favoris", href: "/favoris" },
];

const PRO = [
  { label: "Vente en gros", href: "/vente-en-gros" },
  { label: "Demander un devis", href: "/vente-en-gros" },
  { label: "Contact", href: "/contact" },
  { label: "Livraison", href: "/livraison" },
];

const LEGAL = [
  { label: "Conditions générales de vente", href: "/conditions-generales-de-vente" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
];

const cardCls = "glow-card flex min-w-0 flex-col rounded-[12px] border border-akua-gray-200 bg-akua-white p-5 md:p-6";
const cardTitle = "flex items-center gap-2.5 text-[12px] font-semibold tracking-[0.12em] text-akua-gray-500 uppercase";

function LinkCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="min-w-0">
      <p className="text-[13px] font-extrabold tracking-[0.08em] text-akua-ink uppercase">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="group inline-flex items-center gap-1 text-[14px] text-akua-gray-500 transition-colors hover:text-akua-ink">
              {l.label}
              <ArrowUpRight aria-hidden className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const s = useShopSettings();
  const { categories } = useCatalog();
  const hours = summarizeHours(s.hours);
  const socials = s.socials.filter((x) => /^https?:\/\//.test(x.url));
  const universes = categories.filter((c) => c.slug !== "promos").map((c) => ({ label: c.name, href: `/boutique/${c.slug}` }));

  return (
    <footer className="mt-12 bg-akua-white pb-[calc(80px+env(safe-area-inset-bottom))] md:mt-16 lg:pb-0">
      {/* 0. Bande bleue : une question, un bouton */}
      <div className="bg-akua-blue">
        <div className="container-akua flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between md:py-7">
          <div className="flex items-center gap-4 text-akua-white">
            <MessagesSquare aria-hidden className="hidden size-10 shrink-0 sm:block" strokeWidth={1.4} />
            <div>
              <p className="font-num text-[17px] leading-tight font-extrabold tracking-[-0.01em] uppercase md:text-[20px]">Une question avant de commander ?</p>
              <p className="mt-1 text-[13.5px] text-akua-white/85">Commandes, devis et conseils : on vous répond vite sur WhatsApp.</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Bonjour AKUA.SERVICE, j'ai une question.")}`}
            target="_blank"
            rel="noopener"
            className="btn-shine inline-flex h-12 w-full shrink-0 items-center justify-center gap-2.5 rounded-[10px] bg-akua-white px-5 text-[14px] font-bold text-akua-ink transition-shadow [--shine:rgb(31_91_255/0.25)] hover:shadow-[0_0_0_4px_rgb(255_255_255/0.25),0_14px_30px_-12px_rgb(7_8_12/0.6)] sm:w-auto"
          >
            <WhatsAppIcon size={20} variant="color" /> <span className="relative z-[2]">Écrivez-nous sur WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 1. Infos pratiques */}
      <div className="container-akua grid gap-3 pt-10 md:grid-cols-2 md:pt-12">
        <div className={cardCls}>
          <p className={cardTitle}>
            <MapPin aria-hidden className="size-4 text-akua-blue" strokeWidth={2} /> Notre boutique
          </p>
          <p className="mt-3 text-[17px] font-bold text-akua-ink">{s.address}</p>
          <p className="mt-1 text-[13px] text-akua-gray-500">Retrait des commandes sur rendez-vous.</p>
          <a href={s.mapsLink || "/contact#carte"} target="_blank" rel="noopener" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13.5px] font-semibold text-akua-blue">
            <Navigation aria-hidden className="size-4" /> Voir l&apos;itinéraire
          </a>
        </div>

        <div className={cardCls}>
          <p className={cardTitle}>
            <Clock aria-hidden className="size-4 text-akua-blue" strokeWidth={2} /> Horaires
          </p>
          <ul className="mt-3 space-y-1.5">
            {hours.map((h) => (
              <li key={h.days} className="flex items-baseline justify-between gap-3 text-[13.5px]">
                <span className="font-semibold text-akua-ink">{h.days}</span>
                <span className={h.hours === "Fermé" ? "font-medium text-akua-red" : "font-medium text-akua-gray-500 tabular-nums"}>{h.hours}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* 2. Marque et liens */}
      <div className="container-akua grid gap-10 pt-12 pb-10 md:pt-14 lg:grid-cols-[1.3fr_2fr] lg:gap-16">
        <div>
          <Logo className="h-14" />
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-akua-gray-500">
            <span className="font-semibold text-akua-ink">{s.tagline}.</span> Consoles, ordinateurs, tablettes, accessoires et équipements électroniques, en gros et au détail.
          </p>
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Réseaux sociaux">
              {socials.map(({ id, label, url, network }) => (
                <li key={id}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener"
                    aria-label={`${label} : AKUA.SERVICE`}
                    title={label}
                    className="block rounded-full transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <SocialBrandBadge network={network} className="size-10" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <LinkCol title="Nos univers" links={universes} />
          </div>
          <LinkCol title="Commander" links={ORDER} />
          <LinkCol title="Professionnels" links={PRO} />
        </div>
      </div>

      {/* 3. Livraison */}
      <div className="border-t border-akua-gray-200">
        <div className="container-akua flex flex-col gap-1.5 py-5 sm:flex-row sm:items-center sm:gap-3">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-akua-ink">
            <Globe2 aria-hidden className="size-[18px] text-akua-blue" strokeWidth={1.8} /> Livraison et expédition possibles
          </p>
          <p className="text-[13px] text-akua-gray-500">Indiquez-nous votre pays : nous confirmons l&apos;envoi, les frais et le délai sur WhatsApp.</p>
        </div>
      </div>

      {/* 4. Mentions */}
      <div className="border-t border-akua-gray-200">
        <div className="container-akua flex flex-col items-center justify-between gap-2 py-5 text-center text-[12.5px] text-akua-gray-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} AKUA.SERVICE. Tous droits réservés.</p>
          <nav aria-label="Informations légales">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-akua-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

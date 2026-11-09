"use client";

import { ArrowUpRight, Clock, Globe2, MapPin } from "lucide-react";
import Link from "next/link";
import { Flag } from "@/components/ui/flag";
import { Logo } from "@/components/ui/logo";
import { useShopSettings } from "@/components/shop-settings-provider";
import { SocialLinkIcon } from "@/components/ui/social-link-icon";
import { summarizeHours } from "@/lib/shop-settings";

const COLS = [
  {
    title: "Commander",
    links: [
      { label: "Mon panier", href: "/panier" },
      { label: "Mes favoris", href: "/favoris" },
      { label: "Packs prêts à jouer", href: "/packs" },
      { label: "Promotions", href: "/boutique/promos" },
    ],
  },
  {
    title: "Rayons",
    links: [
      { label: "Consoles", href: "/boutique/consoles" },
      { label: "Manettes", href: "/boutique/manettes" },
      { label: "Jeux vidéo", href: "/boutique/jeux" },
      { label: "Simulation", href: "/boutique/simulation" },
      { label: "Informatique", href: "/boutique/informatique" },
    ],
  },
  {
    title: "Professionnels",
    links: [
      { label: "Vente en gros", href: "/vente-en-gros" },
      { label: "Demander un devis", href: "/vente-en-gros" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const LEGAL = [
  { label: "Conditions générales de vente", href: "/conditions-generales-de-vente" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
];

export function Footer() {
  const s = useShopSettings();
  const hours = summarizeHours(s.hours);
  const socials = s.socials.filter((x) => /^https?:\/\//.test(x.url));
  const delivery = s.delivery.filter((c) => c.enabled);
  return (
    <footer className="mt-16 bg-akua-page pb-[calc(80px+env(safe-area-inset-bottom))] md:mt-24 lg:pb-0">
      <div className="container-akua grid gap-10 pt-12 pb-12 md:pt-14 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div>
          <Logo className="h-14" />
          <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-akua-gray-500">
            Votre référence High-Tech en Afrique de l&apos;Ouest. Consoles, jeux, manettes et accessoires, en gros et au détail.
          </p>
          <ul className="mt-5 space-y-3 text-[14px]">
            <li>
              <a href={s.mapsLink || "#"} target="_blank" rel="noopener" className="group flex items-center gap-3 hover:text-akua-blue">
                <MapPin aria-hidden className="size-5 shrink-0 text-akua-blue" strokeWidth={1.5} />
                <span>
                  {s.address}
                  <span className="block text-[13px] text-akua-gray-500 group-hover:text-akua-blue">Voir sur Google Maps</span>
                </span>
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock aria-hidden className="size-5 shrink-0 text-akua-blue" strokeWidth={1.5} />
              <span>
                {hours.map((h, i) => (
                  <span key={h.days} className={i ? "block text-[13px] text-akua-gray-500" : "block"}>
                    {h.days} : {h.hours}
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <p className="text-[15px] font-bold">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="group inline-flex items-center gap-1 text-[14px] text-akua-gray-500 transition-colors hover:text-akua-ink">
                    {l.label}
                    <ArrowUpRight aria-hidden className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-akua-gray-200">
        <div className="container-akua flex flex-col gap-4 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 w-full text-[13px] font-semibold sm:w-auto">Nous livrons :</span>
            {delivery.map((c) => (
              <span key={c.code} className="inline-flex items-center gap-1.5 rounded-full bg-akua-white px-3 py-1.5 text-[12.5px] font-medium ring-1 ring-akua-gray-200">
                <Flag code={c.code} /> {c.name}
              </span>
            ))}
            {s.deliveryOthers && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-akua-white px-3 py-1.5 text-[12.5px] font-medium text-akua-gray-500 ring-1 ring-akua-gray-200">
                <Globe2 aria-hidden className="size-3.5" strokeWidth={1.8} /> et autres pays
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 w-full text-[13px] font-semibold sm:w-auto">Suivez-nous :</span>
            {socials.map(({ id, label, url, network }) => (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener"
                aria-label={`${label} : AKUA Service`}
                className="btn-shine inline-flex items-center gap-2 rounded-full bg-akua-white py-1.5 pr-3.5 pl-1.5 text-[12.5px] font-medium ring-1 ring-akua-gray-200 [--shine:rgb(31_91_255/0.15)] hover:ring-akua-ink"
              >
                <span className="relative z-[2] grid size-6 place-items-center rounded-full bg-akua-ink text-akua-white">
                  <SocialLinkIcon network={network} className="size-3.5" />
                </span>
                <span className="relative z-[2]">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-akua-gray-200">
        <div className="container-akua flex flex-col items-center justify-between gap-2 py-5 text-center text-[12.5px] text-akua-gray-500 sm:flex-row sm:text-left">
          <p>© 2026 AKUA SERVICE. Tous droits réservés.</p>
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

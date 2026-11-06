import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Flag } from "@/components/ui/flag";
import { Logo } from "@/components/ui/logo";
import { FacebookIcon, TikTokIcon } from "@/components/ui/social-icons";
import { ADDRESS, DELIVERY_COUNTRIES, FACEBOOK_URL, TIKTOK_HANDLE, TIKTOK_URL } from "@/config/site";

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

const SOCIALS = [
  { label: "TikTok", handle: TIKTOK_HANDLE, href: TIKTOK_URL, Icon: TikTokIcon },
  { label: "Facebook", handle: "AKUA Service", href: FACEBOOK_URL, Icon: FacebookIcon },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-akua-page pb-[calc(96px+env(safe-area-inset-bottom))] md:mt-24 lg:pb-0">
      <div className="container-akua grid gap-10 pt-12 pb-12 md:pt-14 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div>
          <Logo className="h-14" />
          <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-akua-gray-500">
            Votre référence High-Tech en Afrique de l&apos;Ouest. Consoles, jeux, manettes et accessoires, en gros et au détail.
          </p>
          <ul className="mt-5 space-y-3 text-[14px]">
            <li className="flex items-center gap-3">
              <MapPin aria-hidden className="size-5 shrink-0 text-akua-blue" strokeWidth={1.5} />
              {ADDRESS}
            </li>
            <li className="flex items-center gap-3">
              <Clock aria-hidden className="size-5 shrink-0 text-akua-blue" strokeWidth={1.5} />
              <span>
                Lundi – Samedi : 10h – 20h
                <span className="block text-[13px] text-akua-gray-500">Dimanche : fermé</span>
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
            {DELIVERY_COUNTRIES.map((c) => (
              <span key={c.code} className="inline-flex items-center gap-1.5 rounded-full bg-akua-white px-3 py-1.5 text-[12.5px] font-medium ring-1 ring-akua-gray-200">
                <Flag code={c.code} /> {c.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 w-full text-[13px] font-semibold sm:w-auto">Suivez-nous :</span>
            {SOCIALS.map(({ label, handle, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener"
                aria-label={`${label} : ${handle}`}
                className="btn-shine inline-flex items-center gap-2 rounded-full bg-akua-white py-1.5 pr-3.5 pl-1.5 text-[12.5px] font-medium ring-1 ring-akua-gray-200 [--shine:rgb(31_91_255/0.15)] hover:ring-akua-ink"
              >
                <span className="relative z-[2] grid size-6 place-items-center rounded-full bg-akua-ink text-akua-white">
                  <Icon className="size-3.5" />
                </span>
                <span className="relative z-[2]">
                  {label} <span className="text-akua-gray-500">{handle}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-akua-gray-200">
        <div className="container-akua flex flex-col items-center justify-between gap-2 py-5 text-center text-[12.5px] text-akua-gray-500 sm:flex-row sm:text-left">
          <p>© 2026 AKUA SERVICE. Tous droits réservés.</p>
          <p>Commande et paiement confirmés sur WhatsApp</p>
        </div>
      </div>
    </footer>
  );
}

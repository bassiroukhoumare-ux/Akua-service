"use client";

import { ArrowUpRight, Clock, Globe2, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { Flag } from "@/components/ui/flag";
import { Logo } from "@/components/ui/logo";
import { useCatalog } from "@/components/catalog-provider";
import { useShopSettings } from "@/components/shop-settings-provider";
import { WhatsAppContactButton } from "@/components/shop/whatsapp-contact-dialog";
import { SocialLinkIcon } from "@/components/ui/social-link-icon";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { summarizeHours } from "@/lib/shop-settings";

const ORDER = [
  { label: "Toute la boutique", href: "/boutique" },
  { label: "Promotions", href: "/boutique/promos" },
  { label: "Packs prêts à jouer", href: "/packs" },
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

const cardCls = "flex min-w-0 flex-col rounded-[22px] border border-akua-gray-200 bg-akua-white p-5";
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
  const delivery = s.delivery.filter((c) => c.enabled);
  const universes = categories.filter((c) => c.slug !== "promos").map((c) => ({ label: c.name, href: `/boutique/${c.slug}` }));

  return (
    <footer className="mt-16 bg-akua-page pb-[calc(80px+env(safe-area-inset-bottom))] md:mt-24 lg:pb-0">
      {/* 1. Infos pratiques */}
      <div className="container-akua grid gap-3 pt-10 md:grid-cols-3 md:pt-14">
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

        <div className={cardCls}>
          <p className={cardTitle}>
            <WhatsAppIcon size={16} variant="color" /> Une question ?
          </p>
          <p className="mt-3 text-[17px] font-bold text-akua-ink tabular-nums">{s.whatsapp}</p>
          <p className="mt-1 text-[13px] text-akua-gray-500">Commandes, devis et conseils : on vous répond vite.</p>
          <div className="mt-auto pt-4">
            <WhatsAppContactButton className="inline-flex h-10 items-center gap-2 rounded-full bg-akua-whatsapp px-4 text-[13.5px] font-semibold text-akua-white transition-shadow hover:shadow-[0_10px_24px_-10px_rgb(37_211_102/0.7)]">
              <WhatsAppIcon size={16} /> Écrire sur WhatsApp
            </WhatsAppContactButton>
          </div>
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
                    aria-label={`${label} : AKUA Service`}
                    title={label}
                    className="grid size-10 place-items-center rounded-full bg-akua-ink text-akua-white transition-colors hover:bg-akua-blue"
                  >
                    <SocialLinkIcon network={network} className="size-[18px]" />
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
        <div className="container-akua flex flex-col gap-3 py-5 md:flex-row md:items-center md:gap-4">
          <p className="shrink-0 text-[13px] font-semibold text-akua-ink">Nous livrons</p>
          <ul className="flex flex-wrap gap-2">
            {delivery.map((c) => (
              <li key={c.code} className="inline-flex items-center gap-1.5 rounded-full bg-akua-white px-3 py-1.5 text-[12.5px] font-medium ring-1 ring-akua-gray-200">
                <Flag code={c.code} /> {c.name}
              </li>
            ))}
            {s.deliveryOthers && (
              <li className="inline-flex items-center gap-1.5 rounded-full bg-akua-white px-3 py-1.5 text-[12.5px] font-medium text-akua-gray-500 ring-1 ring-akua-gray-200">
                <Globe2 aria-hidden className="size-3.5" strokeWidth={1.8} /> et autres pays
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. Mentions */}
      <div className="border-t border-akua-gray-200">
        <div className="container-akua flex flex-col items-center justify-between gap-2 py-5 text-center text-[12.5px] text-akua-gray-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} AKUA SERVICE. Tous droits réservés.</p>
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

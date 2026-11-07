import { ArrowRight, Clock, ExternalLink, Map as MapIcon, MapPin, MessageCircleMore, Navigation } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OpenStatus } from "@/components/shop/open-status";
import { PageHero } from "@/components/ui/page-hero";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { ADDRESS, FACEBOOK_URL, MAPS_DIRECTIONS_URL, MAPS_EMBED_URL, MAPS_URL, OPENING_SCHEDULE, SHOP_COORDS, SITE_NAME, SITE_URL, WHATSAPP_DISPLAY } from "@/config/site";
import { btn } from "@/lib/btn";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contact", description: "Contactez AKUA Service sur WhatsApp. Boutique ouverte du lundi au samedi, de 10h à 20h." };

export default function ContactPage() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: [FACEBOOK_URL],
    openingHours: "Mo-Sa 10:00-20:00",
    hasMap: MAPS_URL,
    geo: { "@type": "GeoCoordinates", latitude: SHOP_COORDS.lat, longitude: SHOP_COORDS.lng },
  };
  return (
    <div className="pb-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <PageHero icon={MessageCircleMore} eyebrow="Contact" title="On vous répond sur WhatsApp." text="Une question sur un produit, une commande ou un achat en gros ? Écrivez-nous, notre équipe vous répond rapidement." />

      <section className="container-akua pt-8 md:pt-12">
        <div className="grid gap-3 md:grid-cols-3">
          {/* WhatsApp */}
          <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-akua-whatsapp p-6 text-akua-white md:p-7">
            <div aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-akua-white/10" />
            <WhatsAppIcon size={40} className="relative" />
            <p className="relative mt-6 text-[13px] font-medium text-akua-white/85">WhatsApp</p>
            <p className="relative text-[24px] font-extrabold tracking-[-0.02em]">{WHATSAPP_DISPLAY}</p>
            <p className="relative mt-2 text-[14px] text-akua-white/85">Commandes, devis et questions.</p>
            <a href={waLink("Bonjour AKUA Service,")} target="_blank" rel="noopener" className={btn({ variant: "light", size: "lg", className: "relative mt-auto w-full [--shine:rgb(37_211_102/0.3)]" })}>
              <WhatsAppIcon size={20} variant="color" /> Écrire sur WhatsApp
            </a>
          </div>

          {/* Adresse */}
          <div className="flex flex-col rounded-[28px] border border-akua-gray-200 p-6 md:p-7">
            <MapPin aria-hidden className="size-9 text-akua-ink" strokeWidth={1.4} />
            <p className="mt-6 text-[13px] font-medium text-akua-gray-500">Adresse de la boutique</p>
            <p className="text-[22px] font-extrabold tracking-[-0.02em]">{ADDRESS}</p>
            <p className="mt-2 text-[14px] text-akua-gray-500">Retrait de commande en boutique du lundi au samedi, sur le créneau choisi lors de la commande.</p>
            <a href="#carte" className={btn({ variant: "outline", size: "lg", className: "mt-auto w-full" })}>
              <MapIcon aria-hidden className="size-4" /> Voir sur la carte
            </a>
          </div>

          {/* Horaires */}
          <div className="flex flex-col rounded-[28px] border border-akua-gray-200 p-6 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <Clock aria-hidden className="size-9 text-akua-ink" strokeWidth={1.4} />
              <OpenStatus />
            </div>
            <p className="mt-6 text-[13px] font-medium text-akua-gray-500">Horaires d&apos;ouverture</p>
            <ul className="mt-2 divide-y divide-akua-gray-200">
              {OPENING_SCHEDULE.map((o) => (
                <li key={o.days} className="flex items-center justify-between py-3">
                  <span className="text-[15px] font-semibold">{o.days}</span>
                  <span className={o.hours === "Fermé" ? "text-[15px] font-semibold text-akua-red" : "text-[15px] font-bold text-akua-blue"}>{o.hours}</span>
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-4 text-[13px] text-akua-gray-500">Les messages WhatsApp reçus le dimanche sont traités dès le lundi matin.</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div id="carte" className="flex scroll-mt-28 flex-col overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white">
            <iframe
              src={MAPS_EMBED_URL}
              title="Carte de la boutique AKUA Service à Lomé"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-[320px] w-full border-0 bg-akua-page sm:h-[380px] lg:h-full lg:min-h-[400px]"
            />
            <div className="flex flex-col gap-3 border-t border-akua-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <MapPin aria-hidden className="size-6 shrink-0 text-akua-blue" strokeWidth={1.6} />
                <div className="min-w-0">
                  <p className="text-[15px] font-bold">{SITE_NAME}</p>
                  <p className="text-[13px] text-akua-gray-500">{ADDRESS}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener" className={btn({ variant: "primary", size: "md", className: "flex-1 sm:flex-none" })}>
                  <Navigation aria-hidden className="size-4" /> Suivre l&apos;itinéraire
                </a>
                <a href={MAPS_URL} target="_blank" rel="noopener" aria-label="Ouvrir dans Google Maps" title="Ouvrir dans Google Maps" className={btn({ variant: "outline", size: "icon" })}>
                  <ExternalLink aria-hidden className="size-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-[28px] bg-akua-blue-100 p-6 md:p-8">
            <div>
              <p className="text-[22px] leading-tight font-extrabold tracking-[-0.03em]">Revendeur ou salle de jeux ?</p>
              <p className="mt-2 text-[14.5px] text-akua-gray-500">Demandez un devis : tarifs dégressifs, stock disponible, livraison au Togo et dans la sous-région.</p>
            </div>
            <Link href="/vente-en-gros" className={btn({ variant: "primary", size: "lg", className: "w-fit" })}>
              Demander un devis <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

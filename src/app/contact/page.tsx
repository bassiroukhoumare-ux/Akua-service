import { ArrowRight, Clock, ExternalLink, MapPin, MessageCircleMore, Navigation, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection } from "@/components/home/sections";
import { OpenStatus } from "@/components/shop/open-status";
import { WhatsAppContactButton } from "@/components/shop/whatsapp-contact-dialog";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { SITE_NAME, SITE_URL } from "@/config/site";
import { loadSettings } from "@/lib/catalog";
import { mapsDirectionsUrl, mapsEmbedUrl, summarizeHours } from "@/lib/shop-settings";
import { btn } from "@/lib/btn";

export const metadata: Metadata = { title: "Contact", description: "Contactez AKUA Service sur WhatsApp : notre équipe vous répond rapidement." };

const card = "rounded-[28px] border border-akua-gray-200 bg-akua-white";

export default async function ContactPage() {
  const s = await loadSettings();
  const MAPS_EMBED_URL = mapsEmbedUrl(s.lat, s.lng);
  const MAPS_DIRECTIONS_URL = mapsDirectionsUrl(s.lat, s.lng);
  const OPENING_SCHEDULE = summarizeHours(s.hours);
  const tel = s.whatsapp.replace(/[^\d+]/g, "");
  const org = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: s.socials.filter((x) => x.url).map((x) => x.url),
    openingHours: "Mo-Sa 10:00-20:00",
    hasMap: s.mapsLink,
    geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng },
  };

  return (
    <div className="pb-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />

      {/* 1. Écrivez-nous */}
      <section className="container-akua pt-5 md:pt-8">
        <div className="relative overflow-hidden rounded-[30px] bg-akua-blue-100 px-6 py-9 md:px-12 md:py-14">
          <div aria-hidden className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
          <div className="relative grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
            <div>
              <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[12.5px] text-akua-gray-500">
                <Link href="/" className="hover:text-akua-ink">
                  Accueil
                </Link>
                <span aria-hidden>›</span>
                <span className="font-medium text-akua-ink">Contact</span>
              </nav>
              <MessageCircleMore aria-hidden className="mt-6 size-10 text-akua-blue md:size-11" strokeWidth={1.4} />
              <h1 className="mt-4 max-w-2xl text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance md:text-[48px]">
                Une question ? Écrivez-nous, <span className="text-akua-blue">on répond vite.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-akua-gray-500">Un conseil pour choisir un ordinateur, une tablette ou une console, une disponibilité, une commande : notre équipe vous répond sur WhatsApp.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <WhatsAppContactButton className={btn({ variant: "whatsapp", size: "lg", className: "h-14 w-full px-7 text-[15.5px] sm:w-auto lg:w-full" })}>
                <WhatsAppIcon size={20} /> Écrire sur WhatsApp
              </WhatsAppContactButton>
              <a href={`tel:${tel}`} className={btn({ variant: "outline", size: "lg", className: "h-14 w-full bg-akua-white px-7 sm:w-auto lg:w-full" })}>
                <Phone aria-hidden className="size-4" /> {s.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Horaires */}
      <section aria-labelledby="horaires" className="container-akua pt-4 md:pt-5">
        <div className={`${card} grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-12`}>
          <div>
            <div className="flex items-center justify-between gap-3 lg:justify-start">
              <Clock aria-hidden className="size-9 text-akua-ink" strokeWidth={1.4} />
              <OpenStatus />
            </div>
            <h2 id="horaires" className="mt-5 text-[24px] leading-tight font-extrabold tracking-[-0.03em] md:text-[30px]">
              Horaires d&apos;ouverture
            </h2>
            <p className="mt-2 text-[14px] text-akua-gray-500">Sur WhatsApp, écrivez-nous à tout moment : nous vous répondons dans les meilleurs délais.</p>
          </div>
          <ul className="grid content-start gap-x-8 sm:grid-cols-2">
            {OPENING_SCHEDULE.map((o) => (
              <li key={o.days} className="flex items-center justify-between gap-4 border-b border-akua-gray-200 py-3.5">
                <span className="text-[15px] font-semibold">{o.days}</span>
                <span className={o.hours === "Fermé" ? "text-[15px] font-semibold text-akua-red" : "text-[15px] font-bold text-akua-blue tabular-nums"}>{o.hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Carte */}
      <section aria-labelledby="carte-titre" id="carte" className="container-akua scroll-mt-28 md:scroll-mt-36 pt-4 md:pt-5">
        <div className={`${card} overflow-hidden`}>
          <iframe
            src={MAPS_EMBED_URL}
            title="Carte de la boutique AKUA Service à Lomé"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="block h-[300px] w-full border-0 bg-akua-page sm:h-[380px] lg:h-[440px]"
          />
          <div className="flex flex-col gap-4 border-t border-akua-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="flex min-w-0 items-center gap-3.5">
              <MapPin aria-hidden className="size-7 shrink-0 text-akua-blue" strokeWidth={1.6} />
              <div className="min-w-0">
                <h2 id="carte-titre" className="text-[16px] font-bold">
                  {SITE_NAME}
                </h2>
                <p className="text-[13.5px] text-akua-gray-500">{s.address} · retrait des commandes sur rendez-vous</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener" className={btn({ variant: "primary", size: "md", className: "flex-1 sm:flex-none" })}>
                <Navigation aria-hidden className="size-4" /> Suivre l&apos;itinéraire
              </a>
              <a href={s.mapsLink} target="_blank" rel="noopener" aria-label="Ouvrir dans Google Maps" title="Ouvrir dans Google Maps" className={btn({ variant: "outline", size: "icon" })}>
                <ExternalLink aria-hidden className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Devis */}
      <section className="container-akua pt-4 md:pt-5">
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-[28px] bg-akua-ink p-6 text-akua-white md:flex-row md:items-center md:justify-between md:p-10">
          <div aria-hidden className="absolute -top-24 -right-24 size-72 rounded-full bg-akua-blue/25 blur-3xl" />
          <div className="relative">
            <p className="text-[24px] leading-tight font-extrabold tracking-[-0.03em] md:text-[30px]">Vous voulez acheter en gros ?</p>
            <p className="mt-2 max-w-xl text-[14.5px] text-akua-white/70">Revendeur, entreprise ou école : choisissez vos produits et vos quantités, nous vous envoyons nos meilleurs tarifs.</p>
          </div>
          <Link href="/vente-en-gros" className={btn({ variant: "primary", size: "lg", className: "relative h-14 w-full shrink-0 px-7 md:w-auto" })}>
            Demander un devis <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>

      {/* 5. Questions fréquentes */}
      <FaqSection />
    </div>
  );
}

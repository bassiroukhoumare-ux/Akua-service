import { ArrowRight, BadgeCheck, Check, LayoutGrid, MessageCircleMore, PackageCheck, ShieldCheck, Store, TrendingUp, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BuyNowButton } from "@/components/product/add-to-cart-button";
import { ProductCard } from "@/components/product/product-card";
import { ProductVisual } from "@/components/product/product-visual";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { categoryImages } from "@/data/category-media";
import { btn } from "@/lib/btn";
import { CONDITION_LABEL } from "@/lib/format";
import { Money } from "@/components/currency";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types/catalog";
import { MobileSlider } from "@/components/ui/mobile-slider";
import { PLATFORM_LOGOS } from "./platform-logos";
import { PromoTimer } from "./promo-timer";
import { WhatsAppContactButton } from "@/components/shop/whatsapp-contact-dialog";
import { dealEnd, type DealTiming } from "@/lib/deals";
import { headingLink, SectionHeading } from "./section-heading";

export { SectionHeading };


/* --------------------------------------------------- garanties sous la bannière */

const TRUST = [
  { icon: BadgeCheck, t: "Testés et garantis", d: "Vérifiés avant la vente" },
  { icon: Truck, t: "Livraison et expédition", d: "Lomé et autres pays" },
  { icon: Store, t: "Retrait en boutique", d: "Sur rendez-vous" },
  { icon: MessageCircleMore, t: "Commande confirmée", d: "Sur WhatsApp" },
];

/** Les 4 garanties, en une ligne discrète sous la bannière (2 par ligne sur téléphone). */
export function TrustStrip() {
  return (
    <section aria-label="Nos garanties" className="container-akua pt-12 md:pt-16">
      <ul className="grid grid-cols-2 rounded-[12px] border border-akua-gray-200 bg-akua-white lg:grid-cols-4">
        {TRUST.map((x, i) => (
          <li key={x.t} className={cn("group flex items-center gap-3 px-3.5 py-4 md:gap-4 md:px-6 md:py-5", i % 2 === 1 && "border-l border-akua-gray-200", i >= 2 && "border-t border-akua-gray-200 lg:border-t-0", i === 2 && "lg:border-l")}>
            <x.icon aria-hidden className="size-7 shrink-0 text-akua-blue transition-transform duration-300 group-hover:scale-110 md:size-9" strokeWidth={1.5} />
            <span className="min-w-0">
              <span className="block text-[12.5px] leading-tight font-bold text-akua-ink md:text-[14.5px]">{x.t}</span>
              <span className="mt-0.5 block text-[11.5px] leading-tight text-akua-gray-500 md:text-[13px]">{x.d}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------------------------------------------------- bandeau plateformes */

export function PlatformMarquee() {
  return (
    <div className="container-akua mt-10 md:mt-14"><div className="overflow-hidden rounded-[12px] border border-akua-gray-200 py-5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] md:py-6">
      <p className="sr-only">Marques et plateformes disponibles : {PLATFORM_LOGOS.map((p) => p.name).join(", ")}</p>
      <div aria-hidden className="flex w-max animate-[akua-marquee_38s_linear_infinite] items-center gap-12 motion-reduce:animate-none md:gap-16">
        {[0, 1].map((d) => (
          <ul key={d} className="flex shrink-0 items-center gap-12 md:gap-16">
            {[...PLATFORM_LOGOS, ...PLATFORM_LOGOS].map((p, i) => (
              <li key={`${d}-${i}`} title={p.name} className="flex items-center gap-12 text-akua-ink md:gap-16">
                {p.node}
                <span className="size-2 rounded-full bg-akua-blue" />
              </li>
            ))}
          </ul>
        ))}
      </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ rayons */

/** Visuel de l'accueil (affiche ou bannière) choisi dans l'admin. */
export interface HomeSlot {
  src: string;
  alt: string;
  href: string | null;
  media?: "image" | "video";
}


/** Photo d'une catégorie : fichier du site (optimisé) ou image importée / externe. */
function CategoryPhoto({ src, className, sizes }: { src: string; className?: string; sizes: string }) {
  if (src.startsWith("/") && !src.startsWith("/api/")) return <Image src={src} alt="" fill sizes={sizes} className={className} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" className={cn("absolute inset-0 size-full", className)} />;
}

function CategoryTile({ c }: { c: Category }) {
  return (
    <Link href={`/boutique/${c.slug}`} className="group flex w-[86px] shrink-0 flex-col items-center gap-2.5 text-center md:w-auto md:gap-3">
      <span className="relative block size-[68px] overflow-hidden rounded-full bg-akua-tile ring-1 ring-akua-gray-200 transition-[box-shadow,transform] duration-300 ease-akua group-hover:-translate-y-0.5 group-hover:shadow-[0_0_0_4px_rgb(31_91_255/0.14),0_14px_28px_-12px_rgb(31_91_255/0.6)] group-hover:ring-akua-blue md:size-[92px]">
        {c.image && <CategoryPhoto src={c.image} sizes="100px" className="object-contain p-3 transition-transform duration-500 ease-akua group-hover:scale-110 md:p-4" />}
      </span>
      <span className="line-clamp-2 text-[11.5px] leading-[1.25] font-semibold text-balance text-akua-ink transition-colors group-hover:text-akua-blue md:text-[13.5px]">{c.shortName ?? c.name}</span>
    </Link>
  );
}

export function CategoryRail({ categories }: { categories: Category[]; products?: Product[] }) {
  // les promos ont leur propre section et le menu « Promotions » : pas de pastille ici
  const cards = categories.filter((c) => c.slug !== "promos").map((c) => ({ ...c, image: c.image ?? categoryImages[c.id] }));

  return (
    <>
      <h1 className="sr-only">AKUA.SERVICE : consoles, ordinateurs, tablettes, accessoires informatiques et équipements électroniques</h1>

      {/* Catégories : pastilles rondes dans un cadre. Téléphone : la rangée défile au doigt. */}
      <section id="categories" aria-label="Catégories" className="container-akua scroll-mt-[120px] pt-4 md:scroll-mt-36 md:pt-5">
        <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 py-1 md:mx-0 md:grid md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] md:gap-2 md:rounded-[12px] md:border md:border-akua-gray-200 md:bg-akua-white md:px-4 md:py-6 md:shadow-[0_18px_40px_-34px_rgb(11_16_32/0.5)]" style={{ "--cols": cards.length + 1 } as React.CSSProperties}>
          {cards.map((c) => (
            <li key={c.id} className="flex justify-center">
              <CategoryTile c={c} />
            </li>
          ))}
          <li className="flex justify-center">
            <Link href="/boutique" className="group flex w-[86px] shrink-0 flex-col items-center gap-2.5 text-center md:w-auto md:gap-3">
              <span className="grid size-[68px] place-items-center rounded-full bg-akua-ink text-akua-white transition-[box-shadow,transform,background-color] duration-300 ease-akua group-hover:-translate-y-0.5 group-hover:bg-akua-blue group-hover:shadow-[0_0_0_4px_rgb(31_91_255/0.14),0_14px_28px_-12px_rgb(31_91_255/0.6)] md:size-[92px]">
                <LayoutGrid aria-hidden className="size-6 md:size-7" strokeWidth={1.7} />
              </span>
              <span className="text-[11.5px] leading-[1.25] font-semibold text-akua-ink transition-colors group-hover:text-akua-blue md:text-[13.5px]">Tout voir</span>
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}

/* --------------------------------------------------------------- bandeau packs */

/** Bandeau intermédiaire : les packs, entre deux rangées de produits. */
export function PromoBand({ packs }: { packs: Product[] }) {
  if (!packs.length) return null;
  return (
    <section aria-label="Packs prêts à l'emploi" className="container-akua pt-10 md:pt-14">
      {/* affiche fournie (5121 × 1146) : même forme sur téléphone et ordinateur, jamais recadrée ni déformée */}
      <Link href="/packs" aria-label="Packs prêts à l'emploi : voir les packs" className="glow-soft group relative block aspect-[5121/1146] overflow-hidden rounded-[8px] bg-akua-blue-100 ring-1 ring-akua-blue/15 sm:rounded-[12px]">
        <Image src="/banners/packs-prets-a-lemploi.webp" alt="Packs prêts à l'emploi : gaming, études ou bureau. L'appareil et ses accessoires, testés et garantis." fill sizes="(min-width:1320px) 1256px, 100vw" className="object-cover transition-transform duration-700 ease-akua group-hover:scale-[1.015]" />
      </Link>
    </section>
  );
}

/* --------------------------------------------------------------- offre spéciale */

/** Textes, durée et vidéos de l'offre spéciale réglés dans l'admin. */
export interface DealsSettings extends DealTiming {
  enabled: boolean;
  title: string;
  highlight: string;
  text: string;
  videos: [string[], string[]];
}

export function DealsSection({ deals, config }: { deals: Product[]; config?: DealsSettings | null }) {
  if (config && (!config.enabled || !dealEnd(config))) return null;
  // les 4 produits choisis dans l'admin (« Offre spéciale »), dans l'ordre choisi
  const promo = deals.filter((p) => p.compareAtPrice && p.published !== false).slice(0, 4);
  if (!promo.length) return null;
  return (
    <section aria-labelledby="promo" className="container-akua pt-10 md:pt-14">
      <Reveal>
        <SectionHeading
          title={
            <span id="promo" className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>
                {config?.title ?? "Offre spéciale"} <span className="text-akua-blue">{config?.highlight ?? "jusqu'à minuit"}</span>
              </span>
              <PromoTimer timing={config ? { mode: config.mode, hours: config.hours, startedAt: config.startedAt, repeat: config.repeat } : undefined} />
            </span>
          }
        >
          <Link href="/boutique/promos" className={cn(headingLink, "hidden sm:inline-flex")}>
            Voir tout <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </SectionHeading>
        {/* Les 4 promotions : 2 par ligne sur téléphone et petit ordinateur, 4 alignées sur grand écran. */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 md:mt-6 md:grid-cols-4 md:gap-4">
          {promo.map((p, i) => (
            <div key={p.id} className="min-w-0">
              <ProductCard product={p} priority={i < 2} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/boutique/promos" className={btn({ variant: "outline", size: "md", className: "w-auto sm:hidden" })}>
            Voir toutes les promotions <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------- packs */

export function PackCard({ product, featured }: { product: Product; featured?: boolean }) {
  const card = (
    <article className={cn("group flex h-full flex-col overflow-hidden rounded-[11px] bg-akua-white", !featured && "glow-card border border-akua-gray-200")}>
      <Link href={`/produit/${product.slug}`} aria-label={product.name} className="relative block aspect-[4/3] overflow-hidden bg-akua-page">
        <div className="absolute inset-0 transition-transform duration-700 ease-akua group-hover:scale-105">
          <ProductVisual product={product} sizes="(min-width:1024px) 300px, (min-width:768px) 33vw, 50vw" inset="p-[8%]" />
        </div>
        {featured ? (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,var(--akua-gold-light),var(--akua-gold))] px-2 py-1 text-[10.5px] whitespace-nowrap md:top-3 md:left-3 md:gap-1.5 md:px-3 md:text-[11.5px] font-bold text-akua-ink shadow-[0_8px_18px_-8px_rgb(201_162_39/0.9)]">
            <TrendingUp aria-hidden className="size-3 md:size-3.5" strokeWidth={2.5} /> Le plus vendu
          </span>
        ) : (
          <span className="absolute top-2 left-2 rounded-full bg-akua-ink px-2 py-1 text-[10.5px] whitespace-nowrap md:top-3 md:left-3 md:px-3 md:text-[11.5px] font-bold text-akua-white">{CONDITION_LABEL[product.condition]}</span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-3 md:p-4">
        <h3 className="font-num text-[14.5px] leading-tight font-extrabold tracking-[-0.03em] [overflow-wrap:anywhere] md:text-[17px]">{product.name}</h3>
        <ul className="mt-2.5 grid gap-y-1.5 md:mt-3">
          {(product.includes ?? []).slice(0, 4).map((inc) => (
            <li key={inc} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-akua-gray-500 md:gap-2 md:text-[13px]">
              <Check aria-hidden className={cn("mt-[2px] size-3 shrink-0 md:size-3.5", featured ? "text-akua-gold" : "text-akua-blue")} strokeWidth={3} />
              {inc}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4">
          <div className="min-w-0">
            <p className="font-num text-[17px] leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap text-akua-blue md:text-[21px]"><Money amount={product.price} /></p>
            {product.compareAtPrice && <p className="mt-1 text-[12px] whitespace-nowrap text-akua-gray-500 line-through tabular-nums md:text-[13px]"><Money amount={product.compareAtPrice} /></p>}
          </div>
          <BuyNowButton product={product} className="mt-3 h-10 w-full px-2 text-[13.5px] md:h-11 md:text-[14.5px]" />
        </div>
      </div>
    </article>
  );
  if (!featured) return card;
  return (
    <div className="h-full rounded-[12px] bg-[linear-gradient(140deg,var(--akua-gold-light),var(--akua-gold)_40%,var(--akua-gold-light)_70%,var(--akua-gold))] p-[2px] shadow-[0_30px_60px_-34px_rgb(201_162_39/0.75)] ">{card}</div>
  );
}

export function PacksSection({ packs, eyebrow = "Nos packs", title = "Packs prêts à l'emploi" }: { packs: Product[]; eyebrow?: string; title?: string }) {
  return (
    <section aria-labelledby="packs" className="pt-10 md:pt-14">
      <Reveal className="container-akua">
        <SectionHeading eyebrow={eyebrow} title={<span id="packs">{title}</span>}>
          <Link href="/packs" className={headingLink}>
            Voir tout <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </SectionHeading>
      </Reveal>
      <div className="mt-5 md:container-akua md:mt-6">
        <MobileSlider label="Packs prêts à l'emploi" slideClass="w-[82%] sm:w-[60%] py-1" gridClass="grid-cols-3 gap-4" speed={0.8}>
          {packs.map((p, i) => (
            <PackCard key={p.id} product={p} featured={i === 0} />
          ))}
        </MobileSlider>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ pourquoi AKUA */

const WHY = [
  { icon: BadgeCheck, t: "Testé et garanti", d: "Neuf ou venant, chaque produit est vérifié avant la vente et garanti par AKUA.SERVICE." },
  { icon: ShieldCheck, t: "Zéro risque", d: "Vous ne payez qu'après confirmation de votre commande sur WhatsApp." },
  { icon: Truck, t: "Livraison et expédition", d: "Livraison et expédition possibles : nous voyons avec vous sur WhatsApp l'envoi vers votre pays." },
  { icon: PackageCheck, t: "Retrait en boutique", d: "Réservez votre créneau et récupérez votre commande sur place." },
];

export function WhySection() {
  return (
    <section aria-labelledby="why" className="container-akua pt-14 md:pt-20">
      <Reveal>
        <SectionHeading index="04" eyebrow="Pourquoi AKUA.SERVICE" title={<span id="why">Achetez l&apos;esprit tranquille.</span>} />
      </Reveal>
      <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {WHY.map((w, i) => (
          <Reveal key={w.t} delay={i * 0.05}>
            <div className="group h-full rounded-[12px] border border-akua-gray-200 p-6 transition-all duration-300 hover:border-akua-blue hover:bg-akua-blue-100/40">
              <w.icon aria-hidden className="size-9 text-akua-ink transition-colors duration-300 group-hover:text-akua-blue" strokeWidth={1.4} />
              <p className="mt-6 text-[19px] font-extrabold tracking-[-0.02em]">{w.t}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-akua-gray-500">{w.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="mt-3 flex flex-col gap-5 overflow-hidden rounded-[12px] bg-akua-blue p-6 text-akua-white md:flex-row md:items-center md:justify-between md:p-8 [background-image:radial-gradient(60%_140%_at_100%_50%,color-mix(in_oklab,var(--akua-blue)_70%,var(--akua-white))_0%,var(--akua-blue)_55%,var(--akua-blue-600)_100%)]">
          <div className="flex items-center gap-4">
            <Store aria-hidden className="size-10 shrink-0" strokeWidth={1.3} />
            <div>
              <p className="text-[22px] font-extrabold tracking-[-0.03em] md:text-[26px]">Revendeur, entreprise ou école ?</p>
              <p className="text-[14px] text-akua-white/80">Tarifs dégressifs, stock disponible, livraison et expédition possibles.</p>
            </div>
          </div>
          <Link href="/vente-en-gros" className={btn({ variant: "light", size: "lg" })}>
            Demander un devis <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------------------------------------------- FAQ */

const FAQ = [
  { q: "Comment passer commande ?", a: "Ajoutez vos produits au panier, remplissez vos informations puis envoyez la commande sur WhatsApp. Notre équipe vous répond avec le lien de paiement." },
  { q: "Les produits sont-ils neufs ?", a: "Selon l'article, un produit peut être neuf ou venant, dans son carton d'origine ou sans carton. Vérifiez toujours la fiche du produit : son état et son conditionnement y sont indiqués. En cas de doute, posez-nous la question sur WhatsApp." },
  { q: "Puis-je récupérer ma commande en boutique ?", a: "Oui. Choisissez « Retrait en boutique », indiquez le jour et l'heure de passage. Vous pouvez verser un acompte pour réserver le produit." },
  { q: "Que vendez-vous ?", a: "Consoles et jeux vidéo, ordinateurs portables, tablettes, accessoires informatiques (souris, claviers, hubs USB…) et équipements électroniques comme les routeurs Wi-Fi et les vidéoprojecteurs. Tous nos produits sont testés et garantis." },
  { q: "Expédiez-vous dans mon pays ?", a: "L'expédition est possible. Indiquez-nous votre pays sur WhatsApp : nous voyons ensemble la solution d'envoi, les frais et le délai avant tout paiement." },
];

/** Questions fréquentes (page Contact) : titre à gauche, questions à droite sur ordinateur. */
export function FaqSection({ eyebrow = "Questions fréquentes", title = "On vous répond." }: { eyebrow?: string; title?: string }) {
  return (
    <section id="questions" aria-labelledby="faq" className="container-akua scroll-mt-28 md:scroll-mt-36 pt-12 md:pt-16">
      <Reveal>
        <div className="grid gap-6 rounded-[12px] border border-akua-gray-200 p-6 md:p-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-12">
          <SectionHeading eyebrow={eyebrow} title={<span id="faq">{title}</span>} className="self-start" />
          <Accordion type="single" collapsible className="-mt-2 lg:mt-0">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`f${i}`}>
                <AccordionTrigger className="text-[15.5px] font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[14.5px] leading-relaxed text-akua-gray-500">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Reveal>
    </section>
  );
}

/** Questions fréquentes + bloc « Écrivez-nous » côte à côte (bas des pages Boutique et Packs). */
export function FaqCta({ eyebrow = "Questions fréquentes", title = "On vous répond." }: { eyebrow?: string; title?: string }) {
  return (
    <section aria-labelledby="faq" className="container-akua pt-14 md:pt-20">
      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <div className="h-full rounded-[12px] border border-akua-gray-200 p-6 md:p-9">
            <SectionHeading eyebrow={eyebrow} title={<span id="faq">{title}</span>} />
            <Accordion type="single" collapsible className="mt-5">
              {FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`f${i}`}>
                  <AccordionTrigger className="text-[15.5px] font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-[14.5px] leading-relaxed text-akua-gray-500">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[12px] bg-akua-blue-100 p-6 md:p-9">
            <div aria-hidden className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_bottom_right,black,transparent_70%)]" />
            <MessageCircleMore aria-hidden className="relative size-11 text-akua-blue" strokeWidth={1.3} />
            <p className="relative mt-6 text-[28px] leading-[1.08] font-extrabold tracking-[-0.035em] md:text-[34px]">Une question ? Écrivez-nous, on répond vite.</p>
            <p className="relative mt-3 text-[14.5px] text-akua-gray-500">Conseil pour choisir un ordinateur, une tablette ou une console, disponibilité, prix de gros : écrivez-nous sur WhatsApp, notre équipe vous répond rapidement.</p>
            <div className="relative mt-auto flex flex-wrap gap-2.5 pt-8">
              <WhatsAppContactButton />
              <Link href="/contact" className={btn({ variant: "outline", size: "lg" })}>
                Nous contacter
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

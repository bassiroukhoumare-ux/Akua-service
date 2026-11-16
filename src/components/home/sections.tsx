import { ArrowRight, BadgeCheck, Check, MessageCircleMore, PackageCheck, ShieldCheck, Store, TrendingUp, Truck } from "lucide-react";
import { MobileFilterBar } from "./home-shell";
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
import { SectionHeading } from "./section-heading";

export { SectionHeading };


/* --------------------------------------------------- bandeau plateformes */

export function PlatformMarquee() {
  return (
    <div className="mt-8 overflow-hidden border-y border-akua-gray-200 py-6 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] md:mt-14 md:py-7">
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
    <Link href={`/boutique/${c.slug}`} className="group flex flex-col items-center gap-2 text-center md:gap-3">
      <span className="relative block aspect-square w-full overflow-hidden rounded-[18px] border border-transparent bg-akua-tile transition-all duration-500 ease-akua group-hover:-translate-y-1 group-hover:border-akua-blue/40 group-hover:shadow-[0_20px_40px_-28px_rgb(31_91_255/0.6)] md:rounded-[22px]">
        {c.image && <CategoryPhoto src={c.image} sizes="(min-width:1024px) 200px, 33vw" className="object-contain p-2.5 transition-transform duration-700 ease-akua group-hover:scale-[1.06] md:p-4" />}
      </span>
      <span className="line-clamp-3 text-[11px] leading-[1.2] font-extrabold tracking-[0.01em] text-balance text-akua-ink uppercase transition-colors group-hover:text-akua-blue min-[400px]:text-[11.5px] md:text-[14px] md:tracking-[0.02em]">{c.name}</span>
    </Link>
  );
}

export function CategoryRail({ categories }: { categories: Category[]; products?: Product[] }) {
  // les promos ont leur propre section et le menu « Offres » : pas de tuile ici
  const cards = categories.filter((c) => c.slug !== "promos").map((c) => ({ ...c, image: c.image ?? categoryImages[c.id] }));

  return (
    <>
      <h1 className="sr-only">AKUA.SERVICE : consoles, ordinateurs, tablettes, accessoires informatiques et équipements électroniques</h1>

      {/* Catégories : tout en haut, droit au but. Téléphone : 3 par ligne. Ordinateur : toutes sur une ligne. */}
      <section id="categories" aria-labelledby="rayons" className="container-akua scroll-mt-[120px] pt-5 md:scroll-mt-36 md:pt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="rayons" className="text-[20px] font-extrabold tracking-[-0.02em] md:text-[26px]">Catégories</h2>
          <Link href="/boutique" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-akua-blue md:text-[14.5px]">
            Tout voir <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        {/* une seule ligne sur grand écran (jusqu'à 8 catégories) ; 3 par ligne sur téléphone et sur petit ordinateur (colonne de filtres à gauche) */}
        <ul
          className="mt-4 grid grid-cols-3 gap-x-3 gap-y-5 md:mt-5 md:[grid-template-columns:repeat(var(--cols-md),minmax(0,1fr))] md:gap-x-4 lg:grid-cols-3 xl:[grid-template-columns:repeat(var(--cols-lg),minmax(0,1fr))]"
          style={{ "--cols-md": cards.length <= 6 ? cards.length : 4, "--cols-lg": Math.min(Math.max(cards.length, 4), 8) } as React.CSSProperties}
        >
          {cards.map((c) => (
            <li key={c.id}>
              <CategoryTile c={c} />
            </li>
          ))}
        </ul>
      </section>

      {/* Téléphone : accès aux filtres juste sous les catégories */}
      <MobileFilterBar />

    </>
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
    <section aria-labelledby="promo" className="container-akua pt-12 md:pt-16">
      <Reveal>
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-end md:justify-between md:gap-6 md:text-left">
          <div>
            <h2 id="promo" className="text-[34px] leading-[1.02] font-extrabold tracking-[-0.04em] md:text-[54px]">
              {config?.title ?? "Offre spéciale"}
              <br />
              <span className="text-akua-blue">{config?.highlight ?? "jusqu'à minuit"}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] text-akua-gray-500 md:mx-0">{config?.text ?? "Promotions exclusives, en quantité limitée. Les prix reviennent à la normale à la fin du compte à rebours."}</p>
          </div>
          <PromoTimer timing={config ? { mode: config.mode, hours: config.hours, startedAt: config.startedAt, repeat: config.repeat } : undefined} />
        </div>
        {/* Les 4 promotions : 2 par ligne sur téléphone et petit ordinateur, 4 alignées sur grand écran. */}
        <div className="mt-8 grid grid-cols-2 gap-2.5 md:gap-4 xl:grid-cols-4">
          {promo.map((p, i) => (
            <div key={p.id} className="min-w-0">
              <ProductCard product={p} priority={i < 2} />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/boutique/promos" className={btn({ variant: "dark", size: "lg", className: "w-auto" })}>
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
    <article className={cn("group flex h-full flex-col overflow-hidden rounded-[29px] bg-akua-white transition-all duration-500", !featured && "border border-akua-gray-200 hover:-translate-y-1 hover:shadow-[0_30px_60px_-36px_rgb(31_91_255/0.6)]")}>
      <Link href={`/produit/${product.slug}`} aria-label={product.name} className="relative block aspect-[16/10] overflow-hidden bg-akua-page">
        <div className="absolute inset-0 transition-transform duration-700 ease-akua group-hover:scale-105">
          <ProductVisual product={product} sizes="(min-width:1024px) 30vw, 90vw" inset="p-[8%]" />
        </div>
        {featured ? (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,var(--akua-gold-light),var(--akua-gold))] px-3 py-1 text-[11.5px] font-bold text-akua-ink shadow-[0_8px_18px_-8px_rgb(201_162_39/0.9)]">
            <TrendingUp aria-hidden className="size-3.5" strokeWidth={2.5} /> Le plus vendu
          </span>
        ) : (
          <span className="absolute top-4 left-4 rounded-full bg-akua-ink px-3 py-1 text-[11.5px] font-bold text-akua-white">{CONDITION_LABEL[product.condition]}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="text-[21px] leading-tight font-extrabold tracking-[-0.03em]">{product.name}</h3>
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
          {(product.includes ?? []).slice(0, 4).map((inc) => (
            <li key={inc} className="flex items-center gap-2 text-[13px] text-akua-gray-500">
              <Check aria-hidden className={cn("size-3.5 shrink-0", featured ? "text-akua-gold" : "text-akua-blue")} strokeWidth={3} />
              {inc}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div>
            <p className="text-[24px] leading-none font-extrabold tracking-[-0.03em] whitespace-nowrap md:text-[26px]"><Money amount={product.price} /></p>
            {product.compareAtPrice && <p className="mt-1.5 text-[13px] text-akua-gray-500 line-through tabular-nums"><Money amount={product.compareAtPrice} /></p>}
          </div>
          <BuyNowButton product={product} />
        </div>
      </div>
    </article>
  );
  if (!featured) return card;
  return (
    <div className="h-full rounded-[30px] bg-[linear-gradient(140deg,var(--akua-gold-light),var(--akua-gold)_40%,var(--akua-gold-light)_70%,var(--akua-gold))] p-[2px] shadow-[0_30px_60px_-34px_rgb(201_162_39/0.75)] transition-transform duration-500 hover:-translate-y-1">{card}</div>
  );
}

export function PacksSection({ packs, eyebrow = "Nos packs", title = "Packs prêts à l'emploi" }: { packs: Product[]; eyebrow?: string; title?: string }) {
  return (
    <section aria-labelledby="packs" className="pt-14 md:pt-20">
      <Reveal className="container-akua">
        <SectionHeading index="02" eyebrow={eyebrow} centerMobile title={<span id="packs">{title}</span>}>
          <Link href="/packs" className={btn({ variant: "outline", size: "md" })}>
            Tous les packs <ArrowRight aria-hidden className="size-4" />
          </Link>
        </SectionHeading>
      </Reveal>
      <div className="mt-7 md:container-akua">
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
            <div className="group h-full rounded-[28px] border border-akua-gray-200 p-6 transition-all duration-300 hover:border-akua-blue hover:bg-akua-blue-100/40">
              <w.icon aria-hidden className="size-9 text-akua-ink transition-colors duration-300 group-hover:text-akua-blue" strokeWidth={1.4} />
              <p className="mt-6 text-[19px] font-extrabold tracking-[-0.02em]">{w.t}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-akua-gray-500">{w.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="mt-3 flex flex-col gap-5 overflow-hidden rounded-[28px] bg-akua-blue p-6 text-akua-white md:flex-row md:items-center md:justify-between md:p-8 [background-image:radial-gradient(60%_140%_at_100%_50%,color-mix(in_oklab,var(--akua-blue)_70%,var(--akua-white))_0%,var(--akua-blue)_55%,var(--akua-blue-600)_100%)]">
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
        <div className="grid gap-6 rounded-[28px] border border-akua-gray-200 p-6 md:p-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-12">
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
          <div className="h-full rounded-[30px] border border-akua-gray-200 p-6 md:p-9">
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
          <div className="relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[30px] bg-akua-blue-100 p-6 md:p-9">
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

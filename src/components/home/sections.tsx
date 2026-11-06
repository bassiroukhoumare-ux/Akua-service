import { ArrowRight, BadgeCheck, Check, MessageCircleMore, PackageCheck, ShieldCheck, Store, TrendingUp, Truck } from "lucide-react";
import Link from "next/link";
import { BuyNowButton } from "@/components/product/add-to-cart-button";
import { ProductCard } from "@/components/product/product-card";
import { ProductVisual } from "@/components/product/product-visual";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { btn } from "@/lib/btn";
import { getCategoryIcon } from "@/lib/icons";
import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";
import type { Category, Product } from "@/types/catalog";
import { HeroStage } from "./hero-stage";
import { MobileSlider } from "@/components/ui/mobile-slider";
import { PromoTimer } from "./promo-timer";
import { SectionHeading } from "./section-heading";

export { SectionHeading };


/* ------------------------------------------------------------------ hero */

export function HomeHero() {
  return <HeroStage />;
}

/* --------------------------------------------------- bandeau plateformes */

const PLATFORMS = ["PlayStation 5", "PS4", "Nintendo Switch 2", "Xbox", "PC", "Android", "PS3", "Xbox 360"];

export function PlatformMarquee() {
  return (
    <div aria-label="Plateformes disponibles" className="mt-8 overflow-hidden border-y border-akua-gray-200 py-5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] md:mt-14">
      <div className="flex w-max animate-[akua-marquee_38s_linear_infinite] items-center gap-10 motion-reduce:animate-none">
        {[0, 1].map((d) => (
          <ul key={d} aria-hidden={d === 1} className="flex shrink-0 items-center gap-10">
            {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
              <li key={`${d}-${i}`} className="flex items-center gap-10 text-[26px] font-extrabold tracking-[-0.03em] whitespace-nowrap text-akua-ink md:text-[34px]">
                <span className={i % 2 ? "text-transparent [-webkit-text-stroke:1.2px_var(--akua-ink)]" : ""}>{p}</span>
                <span className="size-2.5 rounded-full bg-akua-blue" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ rayons */

export function CategoryRail({ categories }: { categories: Category[]; products?: Product[] }) {
  return (
    <section id="categories" aria-labelledby="rayons" className="container-akua scroll-mt-[92px] pt-12 md:scroll-mt-28 md:pt-16">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <h2 id="rayons" className="text-[22px] font-extrabold tracking-[-0.03em] md:text-[28px]">
            Nos catégories
          </h2>
          <Link href="/boutique" className="group inline-flex items-center gap-1 text-[13.5px] font-semibold text-akua-blue">
            Tout voir <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <nav aria-label="Catégories de produits" className="mt-5 rounded-[24px] border border-akua-gray-200 bg-akua-white">
          <ul className="grid grid-cols-4 md:grid-cols-8 md:divide-x md:divide-akua-gray-200">
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <li key={c.id}>
                  <Link
                    href={`/boutique/${c.slug}`}
                    className="group flex h-full flex-col items-center justify-center gap-2 rounded-[20px] px-1 py-4 text-center transition-colors hover:bg-akua-page md:gap-2.5 md:rounded-none md:py-6 md:first:rounded-l-[23px] md:last:rounded-r-[23px]"
                  >
                    <Icon aria-hidden className="size-7 text-akua-ink transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-akua-blue md:size-8" strokeWidth={1.4} />
                    <span className="text-[12px] font-semibold tracking-[-0.01em] text-akua-ink group-hover:text-akua-blue md:text-[14px]">{c.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Reveal>
    </section>
  );
}

/* --------------------------------------------------------------- offre spéciale */

export function DealsSection({ deals }: { deals: Product[] }) {
  const promo = deals.filter((p) => p.compareAtPrice).slice(0, 4);
  if (!promo.length) return null;
  return (
    <section aria-labelledby="promo" className="container-akua pt-12 md:pt-16">
      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="promo" className="text-[34px] leading-[1.02] font-extrabold tracking-[-0.04em] md:text-[54px]">
              Offre spéciale
              <br />
              <span className="text-akua-blue">jusqu&apos;à minuit</span>
            </h2>
            <p className="mt-3 max-w-md text-[14.5px] text-akua-gray-500">Promotions exclusives, en quantité limitée. Les prix reviennent à la normale à la fin du compte à rebours.</p>
          </div>
          <PromoTimer />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-4">
          {promo.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-7 flex justify-center">
          <Link href="/boutique/promos" className={btn({ variant: "dark", size: "lg" })}>
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
          <span className="absolute top-4 left-4 rounded-full bg-akua-ink px-3 py-1 text-[11.5px] font-bold text-akua-white">{product.badges.includes("premium") ? "Premium" : "Neuf scellé"}</span>
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
            {product.compareAtPrice && <p className="text-[13px] text-akua-gray-500 line-through">{formatFCFA(product.compareAtPrice)}</p>}
            <p className="text-[28px] leading-none font-extrabold tracking-[-0.03em]">{formatFCFA(product.price)}</p>
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

export function PacksSection({ packs }: { packs: Product[] }) {
  return (
    <section aria-labelledby="packs" className="pt-14 md:pt-20">
      <Reveal className="container-akua">
        <SectionHeading index="03" eyebrow="Consoles complètes" title={<span id="packs">Packs prêts à jouer</span>}>
          <Link href="/packs" className={btn({ variant: "outline", size: "md" })}>
            Tous les packs <ArrowRight aria-hidden className="size-4" />
          </Link>
        </SectionHeading>
      </Reveal>
      <div className="mt-7 md:container-akua">
        <MobileSlider label="Packs prêts à jouer" slideClass="w-[82%] sm:w-[60%] py-1" gridClass="grid-cols-3 gap-4" speed={0.5}>
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
  { icon: BadgeCheck, t: "Neuf et scellé", d: "Chaque produit sort de son carton d'origine, garanti par AKUA Service." },
  { icon: ShieldCheck, t: "Zéro risque", d: "Vous ne payez qu'après confirmation de votre commande sur WhatsApp." },
  { icon: Truck, t: "Livraison 7 pays", d: "Togo, Bénin, Ghana, Burkina Faso, Côte d'Ivoire, Niger et Mali." },
  { icon: PackageCheck, t: "Retrait en boutique", d: "Réservez votre créneau et récupérez votre commande sur place." },
];

export function WhySection() {
  return (
    <section aria-labelledby="why" className="container-akua pt-14 md:pt-20">
      <Reveal>
        <SectionHeading index="05" eyebrow="Pourquoi AKUA Service" title={<span id="why">Achetez l&apos;esprit tranquille.</span>} />
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
              <p className="text-[22px] font-extrabold tracking-[-0.03em] md:text-[26px]">Revendeur ou salle de jeux ?</p>
              <p className="text-[14px] text-akua-white/80">Tarifs dégressifs, stock disponible et livraison multi-pays.</p>
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
  { q: "Les produits sont-ils vraiment neufs ?", a: "Oui. Nos consoles, manettes et jeux sont neufs et scellés d'origine, sauf mention « occasion » sur la fiche produit." },
  { q: "Puis-je récupérer ma commande en boutique ?", a: "Oui. Choisissez « Retrait en boutique », indiquez le jour et l'heure de passage. Vous pouvez verser un acompte pour réserver le produit." },
  { q: "Livrez-vous hors du Togo ?", a: "Nous livrons au Bénin, Ghana, Burkina Faso, Côte d'Ivoire, Niger et Mali. Les frais sont confirmés sur WhatsApp." },
];

export function FaqCta() {
  return (
    <section aria-labelledby="faq" className="container-akua pt-14 md:pt-20">
      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <div className="h-full rounded-[30px] border border-akua-gray-200 p-6 md:p-9">
            <SectionHeading index="04" eyebrow="Questions fréquentes" title={<span id="faq">On vous répond.</span>} />
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
            <p className="relative mt-3 text-[14.5px] text-akua-gray-500">Conseil, disponibilité, prix de gros : notre équipe est sur WhatsApp du lundi au samedi, de 10h à 20h.</p>
            <div className="relative mt-auto flex flex-wrap gap-2.5 pt-8">
              <a href={waLink("Bonjour AKUA Service, j'ai une question.")} target="_blank" rel="noopener" className={btn({ variant: "whatsapp", size: "lg" })}>
                <WhatsAppIcon size={19} /> Écrire sur WhatsApp
              </a>
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

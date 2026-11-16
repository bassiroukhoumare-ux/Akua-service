"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Globe2, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { discountPercent } from "@/lib/format";
import { HomeMedia } from "@/components/ui/home-media";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/catalog";

const DURATION = 5000;

/* ------------------------------------------------------------------ compte à rebours */

/** Temps restant jusqu'à minuit, heure de Lomé (UTC+0) : l'offre repart pour 24 heures chaque nuit. */
function useMidnightCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      setLeft(Math.max(0, Math.floor((next - now.getTime()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return left;
}

function Countdown() {
  const left = useMidnightCountdown();
  const parts = left == null ? ["--", "--", "--"] : [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60].map((n) => String(n).padStart(2, "0"));
  const units = ["h", "min", "s"];
  return (
    <div className="flex items-center gap-[1.2cqw]" role="timer" aria-label={left == null ? "Compte à rebours" : `Se termine dans ${parts[0]} heures ${parts[1]} minutes`}>
      <span className="text-[1.6cqw] font-medium whitespace-nowrap text-akua-gray-500">Se termine dans</span>
      <span className="flex items-center gap-[0.6cqw]">
        {parts.map((p, i) => (
          <span key={i} className="flex items-baseline gap-[0.2cqw] rounded-[0.6cqw] bg-[#0b0f19] px-[0.9cqw] py-[0.45cqw]">
            <span className="text-[2.4cqw] leading-none font-bold text-white tabular-nums">{p}</span>
            <span className="text-[1.3cqw] leading-none font-medium text-white/60">{units[i]}</span>
          </span>
        ))}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ éléments communs */

/*
 * Toutes les mesures des bannières sont en « cqw » (1 cqw = 1 % de la largeur de la bannière) :
 * l'affiche garde exactement la même composition sur ordinateur et sur téléphone, elle est
 * simplement réduite, comme une image.
 */

/** Produit présenté sur une carte blanche (rendu net sur tous les fonds), placé dans la composition. */
function Shot({ src, className, priority }: { src: string; className: string; priority?: boolean }) {
  return (
    <span className={cn("pointer-events-none absolute aspect-square rounded-[1.4cqw] bg-white shadow-[0_3cqw_5cqw_-2.6cqw_rgb(11_16_32/0.45)] ring-1 ring-[#0b1020]/5", className)}>
      <span className="absolute inset-[9%]">
        <Image src={src} alt="" fill sizes="(min-width:1024px) 280px, 35vw" priority={priority} className="object-contain" />
      </span>
    </span>
  );
}

const label = "inline-flex w-fit items-center rounded-[0.5cqw] px-[1.2cqw] py-[0.55cqw] text-[1.4cqw] leading-none font-semibold tracking-[0.14em] whitespace-nowrap uppercase";
const title = "font-num text-[4.6cqw] leading-[1.04] font-extrabold tracking-[-0.045em]";
const cta = "btn-shine inline-flex h-[4.6cqw] w-fit items-center gap-[0.9cqw] rounded-[0.8cqw] px-[2.4cqw] text-[1.7cqw] font-semibold whitespace-nowrap transition-transform active:scale-[0.98]";
const arrow = "size-[1.9cqw]";

/** Mise en page unique : texte à gauche, composition de produits à droite, sur tous les écrans. */
function Layout({ className, copy, visual, href }: { className: string; copy: React.ReactNode; visual: React.ReactNode; href: string }) {
  return (
    <div className={cn("relative flex h-full w-full overflow-hidden", className)}>
      <div className="relative z-[2] flex w-[48%] flex-col justify-center gap-[1.2cqw] pb-[1.2cqw] pl-[6.5cqw]">{copy}</div>
      {/* toute la composition est cliquable (pratique au doigt) */}
      <Link href={href} tabIndex={-1} aria-hidden className="relative block flex-1">
        {visual}
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ les 3 bannières */

function PromoSlide({ pct }: { pct: number | null }) {
  return (
    <Layout
      href="/boutique/promos"
      className="bg-[linear-gradient(100deg,#f3f6ff_0%,#e4ecff_100%)] text-[#0b1020]"
      copy={
        <>
          <span className={cn(label, "bg-akua-blue text-white")}>Black Friday</span>
          {pct ? (
            <p className="leading-none">
              <span className="block text-[2cqw] font-semibold text-akua-gray-500">Jusqu&apos;à</span>
              <span className="font-num block text-[7.4cqw] font-extrabold tracking-[-0.06em] whitespace-nowrap text-akua-blue">-{pct}&nbsp;%</span>
            </p>
          ) : (
            <p className={title}>Prix exceptionnels</p>
          )}
          <Countdown />
          <Link href="/boutique/promos" className={cn(cta, "glow-blue bg-akua-blue text-white hover:bg-akua-blue-600")}>
            Voir les offres <ArrowRight aria-hidden className={arrow} />
          </Link>
        </>
      }
      visual={
        <>
          <span aria-hidden className="absolute top-1/2 left-[46%] aspect-square h-[118%] -translate-1/2 rounded-full bg-akua-blue/[0.13]" />
          <Shot src="/categories/univers-ordinateurs.webp" priority className="top-[16%] left-[4%] h-[64%] -rotate-3" />
          <Shot src="/categories/univers-audio.webp" className="top-[9%] right-[12%] h-[40%] rotate-6" />
          <Shot src="/products/dualsense.webp" className="right-[22%] bottom-[9%] h-[34%] -rotate-6" />
        </>
      }
    />
  );
}

type Season = { label: string; title: string; cta: string; href: string };

/** Message de saison (heure de Lomé). */
function seasonFor(month: number): Season {
  if (month === 10 || month === 11) return { label: month === 11 ? "Noël" : "Fêtes de fin d'année", title: "Offrez la technologie.", cta: "Idées cadeaux", href: "/boutique" };
  if (month === 7 || month === 8) return { label: "Rentrée", title: "Prêt pour la rentrée.", cta: "S'équiper", href: "/boutique/ordinateurs-informatique" };
  if (month <= 1) return { label: "Nouvelle année", title: "Bien équipé dès janvier.", cta: "Découvrir", href: "/boutique" };
  return { label: "Nouveautés", title: "La tech du moment.", cta: "Découvrir", href: "/boutique" };
}

function SeasonSlide({ season }: { season: Season }) {
  return (
    <Layout
      href={season.href}
      className="bg-[linear-gradient(120deg,#1f5bff_0%,#1747d1_100%)] text-white"
      copy={
        <>
          <span className={cn(label, "bg-white/15 text-white ring-1 ring-white/20")}>{season.label}</span>
          <p className={title}>{season.title}</p>
          <p className="text-[1.8cqw] leading-snug text-white/80">Tablettes, audio, consoles, accessoires.</p>
          <Link href={season.href} className={cn(cta, "bg-white text-[#0b0f19] hover:bg-white/90")}>
            {season.cta} <ArrowRight aria-hidden className={arrow} />
          </Link>
        </>
      }
      visual={
        <>
          <span aria-hidden className="absolute top-1/2 left-1/2 size-[80%] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.22)_0%,transparent_65%)]" />
          <Shot src="/categories/univers-tablettes.webp" className="top-[16%] left-[4%] h-[64%] rotate-3" />
          <Shot src="/products/ds3.webp" className="top-[9%] right-[12%] h-[40%] -rotate-6" />
          <Shot src="/categories/univers-accessoires.webp" className="right-[22%] bottom-[9%] h-[34%] rotate-6" />
        </>
      }
    />
  );
}

function TrustSlide() {
  const points = [
    { icon: BadgeCheck, t: "Testés et garantis" },
    { icon: Globe2, t: "Livraison et expédition" },
    { icon: Store, t: "Retrait à Lomé" },
  ];
  return (
    <Layout
      href="/boutique"
      className="bg-[linear-gradient(100deg,#f7f8fb_0%,#eceff5_100%)] text-[#0b0f19]"
      copy={
        <>
          <span className={cn(label, "bg-[#0b0f19]/[0.06] text-[#0b0f19]")}>AKUA.SERVICE</span>
          <p className={title}>
            Testés.
            <br />
            Garantis. Livrés.
          </p>
          <Link href="/boutique" className={cn(cta, "bg-[#0b0f19] text-white hover:bg-[#1c2333]")}>
            Découvrir la boutique <ArrowRight aria-hidden className={arrow} />
          </Link>
        </>
      }
      visual={
        <>
          <Shot src="/categories/univers-electronique.webp" className="top-[16%] left-[2%] h-[64%] -rotate-3" />
          <ul className="absolute top-1/2 right-[9%] flex w-[48%] -translate-y-1/2 flex-col gap-[1.1cqw]">
            {points.map((x) => (
              <li key={x.t} className="flex items-center gap-[1.1cqw] rounded-[1.6cqw] bg-white px-[1.6cqw] py-[1.3cqw] shadow-[0_1.2cqw_3cqw_-1.8cqw_rgb(11_15_25/0.35)]">
                <x.icon aria-hidden className="size-[2.4cqw] shrink-0 text-akua-blue" strokeWidth={1.8} />
                <span className="text-[1.6cqw] leading-tight font-semibold whitespace-nowrap">{x.t}</span>
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ carrousel */

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%" }),
  center: { x: "0%" },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%" }),
};

/**
 * Bannière de l'accueil : 3 visuels qui glissent de droite à gauche toutes les 5 secondes
 * (pause au survol, flèches et points, glissement du doigt sur téléphone).
 */
/** Bannière ajoutée depuis l'espace admin (image ou vidéo au format 16:5). */
export interface HeroBanner {
  id: string;
  src: string;
  alt: string;
  href: string | null;
  media: "image" | "video";
}

function CustomSlide({ b, priority }: { b: HeroBanner; priority?: boolean }) {
  const media = <HomeMedia src={b.src} alt={b.alt} media={b.media} fit="cover" sizes="(min-width:1320px) 1256px, 100vw" priority={priority} />;
  if (!b.href) return <div className="relative h-full w-full">{media}</div>;
  const external = /^https?:\/\//.test(b.href);
  return (
    <Link href={b.href} {...(external ? { target: "_blank", rel: "noopener" } : {})} aria-label={b.alt || "Voir l'offre"} className="relative block h-full w-full">
      {media}
    </Link>
  );
}

export function HeroSlider({ deals, month, banners = [] }: { deals: Product[]; month: number; banners?: HeroBanner[] }) {
  const best = useMemo(() => Math.max(0, ...deals.map((p) => discountPercent(p.price, p.compareAtPrice) ?? 0)) || null, [deals]);
  const season = seasonFor(month);
  // visuels ajoutés dans l'admin : ils remplacent les 3 bannières automatiques
  const custom = banners.length > 0;
  const slides = custom
    ? banners.slice(0, 3).map((b, n) => ({ key: b.id, label: b.alt || `Bannière ${n + 1}`, node: <CustomSlide b={b} priority={n === 0} /> }))
    : [
        { key: "promo", label: "Black Friday", node: <PromoSlide pct={best} /> },
        { key: "saison", label: season.label, node: <SeasonSlide season={season} /> },
        { key: "confiance", label: "Testés, garantis, livrés", node: <TrustSlide /> },
      ];
  const count = slides.length;
  const [[i, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const go = useCallback((n: number, d: number) => setState([((n % count) + count) % count, d]), [count]);

  useEffect(() => {
    if (count < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => go(i + 1, 1), DURATION);
    return () => window.clearTimeout(id);
  }, [i, paused, go, count]);

  // glissement du doigt
  const start = useRef<number | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") start.current = e.clientX;
  };
  const onUp = (e: React.PointerEvent) => {
    if (start.current == null) return;
    const dx = e.clientX - start.current;
    start.current = null;
    if (count > 1 && Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  };

  return (
    <section aria-roledescription="carrousel" aria-label="À la une" className="container-akua pt-3 md:pt-5">
      <div
        className="group relative aspect-[16/5] overflow-hidden rounded-[12px] bg-akua-blue-100 [container-type:inline-size]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onPointerDown={onDown}
        onPointerUp={onUp}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={slides[i].key}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            role="group"
            aria-roledescription="bannière"
            aria-label={`${i + 1} sur ${count} : ${slides[i].label}`}
            className="absolute inset-0"
          >
            {slides[i].node}
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(i - 1, -1)}
              aria-label="Bannière précédente"
              className="glow-soft absolute top-1/2 left-3 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-akua-gray-200 bg-white text-[#0b0f19] shadow-[0_8px_20px_-10px_rgb(11_16_32/0.5)] hover:text-akua-blue md:grid"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(i + 1, 1)}
              aria-label="Bannière suivante"
              className="glow-soft absolute top-1/2 right-3 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-akua-gray-200 bg-white text-[#0b0f19] shadow-[0_8px_20px_-10px_rgb(11_16_32/0.5)] hover:text-akua-blue md:grid"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>

            {/* points : celui en cours se remplit pendant les 5 secondes */}
            <div className={cn("absolute bottom-[1.6cqw] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[0.6cqw]", custom && "rounded-full bg-[#0b0f19]/35 px-[0.9cqw] py-[0.6cqw] backdrop-blur-sm")}>
              {slides.map((s, n) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => go(n, n >= i ? 1 : -1)}
                  aria-label={`Afficher : ${s.label}`}
                  aria-current={n === i}
                  className={cn("relative h-[max(3px,0.45cqw)] overflow-hidden rounded-full bg-current transition-all", n === i ? "w-[4cqw]" : "w-[1.6cqw]", custom || i === 1 ? "text-white/45" : "text-[#0b0f19]/20")}
                >
                  {n === i && (
                    <motion.span
                      key={`${i}-${paused}`}
                      className={cn("absolute inset-y-0 left-0", custom || i === 1 ? "bg-white" : "bg-akua-blue")}
                      initial={{ width: paused ? "100%" : "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: paused ? 0 : DURATION / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Check, CheckCircle2, History, Layers, MessageCircle, Package, ShieldCheck, TrendingUp } from "lucide-react";
import type { PortalKind } from "@/config/admin-base";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Halo lumineux animé du fond (bleu AKUA très doux sur blanc). */
export function Aurora() {
  const reduce = useReducedMotion();
  const blob = (cls: string, x: number[], y: number[], d: number) => (
    <motion.div aria-hidden className={cn("absolute rounded-full blur-[90px]", cls)} animate={reduce ? undefined : { x, y }} transition={{ duration: d, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} />
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blob("-top-40 -left-32 size-[560px] bg-[#cfdcff]", [0, 80, -20], [0, 60, 30], 18)}
      {blob("top-1/3 -right-40 size-[520px] bg-[#dfe8ff]", [0, -60, 20], [0, 40, -40], 22)}
      {blob("-bottom-48 left-1/4 size-[480px] bg-[#e9e3ff]", [0, 50, -40], [0, -40, 10], 20)}
      <div className="bg-grid absolute inset-0 opacity-[0.045] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
    </div>
  );
}

function Float({ children, className, delay = 0, y = 10 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay, ease }} className={cn("absolute", className)}>
      <motion.div animate={reduce ? undefined : { y: [0, -y, 0] }} transition={{ duration: 6 + delay * 2, repeat: Infinity, ease: "easeInOut", delay }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

const card = "rounded-[22px] border border-akua-white/80 bg-akua-white/85 shadow-[0_30px_60px_-30px_rgb(11_16_32/0.35),0_1px_0_rgb(255_255_255/0.9)_inset] backdrop-blur-xl";

function Sparkline() {
  const pts = [18, 26, 22, 34, 30, 42, 38, 52, 47, 60, 56, 70];
  const w = 210;
  const h = 64;
  const step = w / (pts.length - 1);
  const path = pts.map((v, i) => `${i ? "L" : "M"}${i * step},${h - (v / 72) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="block">
      <defs>
        <linearGradient id="lv-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1f5bff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1f5bff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#lv-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.9 }} />
      <motion.path d={path} fill="none" stroke="#1f5bff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 0.5, ease }} />
    </svg>
  );
}

/** Scène de cartes flottantes (écran large uniquement). */
export function LoginScene({ kind }: { kind: PortalKind }) {
  if (kind === "team") {
    return (
      <div className="relative h-[460px] w-full max-w-[520px]">
        <Float className="top-2 left-0 w-[300px]" delay={0.15}>
          <div className={cn(card, "p-5")}>
            <p className="text-[12px] font-semibold tracking-[0.1em] text-akua-gray-500 uppercase">Vos modules</p>
            <ul className="mt-3 flex flex-col gap-2">
              {[
                { icon: Package, t: "Produits" },
                { icon: Layers, t: "Catégories" },
                { icon: BarChart3, t: "Offre spéciale" },
              ].map((m, i) => (
                <motion.li key={m.t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.12, ease }} className="flex items-center gap-3 rounded-[14px] bg-akua-page/80 px-3 py-2.5">
                  <span className="grid size-8 place-items-center rounded-[10px] bg-akua-white">
                    <m.icon aria-hidden className="size-4 text-akua-blue" strokeWidth={1.8} />
                  </span>
                  <span className="flex-1 text-[13.5px] font-semibold">{m.t}</span>
                  <Check aria-hidden className="size-4 text-[#128c4a]" strokeWidth={2.6} />
                </motion.li>
              ))}
            </ul>
          </div>
        </Float>
        <Float className="top-[200px] right-0 w-[290px]" delay={0.35} y={12}>
          <div className={cn(card, "flex items-start gap-3 p-4")}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-akua-blue text-akua-white">
              <History aria-hidden className="size-[18px]" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-[13.5px] leading-snug">
                <span className="font-semibold">Vous avez modifié</span> <span className="text-akua-gray-500">PS4 Slim Complète</span>
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-[8px] bg-akua-page px-2 py-0.5 text-[11.5px]">
                <span className="text-akua-gray-500 line-through">2</span> <span className="text-akua-gray-500">→</span> <span className="font-bold">5 en stock</span>
              </p>
            </div>
          </div>
        </Float>
        <Float className="bottom-0 left-10 w-[250px]" delay={0.55} y={8}>
          <div className={cn(card, "flex items-center gap-3 p-4")}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-akua-whatsapp/15">
              <ShieldCheck aria-hidden className="size-5 text-[#128c4a]" strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-[13.5px] font-bold">Accès personnel</p>
              <p className="text-[12px] text-akua-gray-500">Chaque action à votre nom</p>
            </div>
          </div>
        </Float>
      </div>
    );
  }
  return (
    <div className="relative h-[480px] w-full max-w-[540px]">
      <Float className="top-0 left-0 w-[320px]" delay={0.15}>
        <div className={cn(card, "p-5")}>
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-medium text-akua-gray-500">Visiteurs · 30 jours</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-akua-whatsapp/15 px-2 py-0.5 text-[11.5px] font-bold text-[#128c4a]">
              <TrendingUp aria-hidden className="size-3" strokeWidth={2.6} /> 8 %
            </span>
          </div>
          <p className="mt-1.5 text-[32px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">4 912</p>
          <div className="mt-3">
            <Sparkline />
          </div>
        </div>
      </Float>
      <Float className="top-[150px] right-0 w-[270px]" delay={0.35} y={12}>
        <div className={cn(card, "p-4")}>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-akua-whatsapp">
              <MessageCircle aria-hidden className="size-5 text-akua-white" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold">Nouvelle commande</p>
              <p className="truncate text-[12px] text-akua-gray-500">Manette PS5 · 52 000 F</p>
            </div>
          </div>
        </div>
      </Float>
      <Float className="bottom-2 left-8 w-[300px]" delay={0.55} y={9}>
        <div className={cn(card, "p-4")}>
          <p className="text-[12px] font-semibold tracking-[0.1em] text-akua-gray-500 uppercase">Équipe</p>
          <div className="mt-2.5 flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fff2cc] text-[13px] font-bold text-[#8a6a00]">AL</span>
            <p className="min-w-0 flex-1 text-[13px] leading-snug">
              <span className="font-semibold">Afi</span> <span className="text-akua-gray-500">a ajouté</span> <span className="font-semibold">Xbox Series S</span>
            </p>
            <CheckCircle2 aria-hidden className="size-5 shrink-0 text-akua-blue" strokeWidth={1.8} />
          </div>
        </div>
      </Float>
    </div>
  );
}

/** Apparition douce du formulaire. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay, ease }} className={className}>
      {children}
    </motion.div>
  );
}

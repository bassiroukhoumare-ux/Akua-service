"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { btn } from "@/lib/btn";


/** Hero : grande accroche centrée. */
export function HeroStage() {
  const word = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.05 + i * 0.08, ease: [0.22, 1, 0.36, 1] as const } }),
  };

  return (
    <section aria-label="Bienvenue" className="container-akua pt-3 md:pt-5">
      <div className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(120%_90%_at_50%_100%,var(--akua-blue-100)_0%,var(--akua-white)_62%)] ring-1 ring-akua-gray-200/70 md:rounded-[40px]">
        {/* motifs */}
        <div aria-hidden className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_50%_35%,black_15%,transparent_70%)]" />
        <div aria-hidden className="absolute top-[45%] left-1/2 h-[320px] w-[70%] -translate-x-1/2 rounded-full bg-akua-blue/15 blur-[110px]" />

        {/* accroche */}
        <div className="relative z-10 flex flex-col items-center px-5 pt-12 text-center md:pt-20">
          <h1 className="text-[42px] leading-[0.98] font-extrabold tracking-[-0.05em] text-akua-ink sm:text-[58px] md:text-[68px] lg:text-[78px]">
            {["Tout", "le", "gaming."].map((w, i) => (
              <motion.span key={w} custom={i} variants={word} initial="hidden" animate="show" className="mr-[0.22em] inline-block last:mr-0">
                {w}
              </motion.span>
            ))}
            <br />
            {["Neuf.", "Garanti.", "Livré."].map((w, i) => (
              <motion.span key={w} custom={i + 3} variants={word} initial="hidden" animate="show" className="mr-[0.22em] inline-block bg-[linear-gradient(120deg,var(--akua-blue),color-mix(in_oklab,var(--akua-blue)_55%,var(--akua-ink)))] bg-clip-text text-transparent last:mr-0">
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }} className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-akua-gray-500 md:text-[16.5px]">
            Consoles, manettes, jeux et accessoires. Commandez en quelques clics et payez après confirmation sur WhatsApp. Livraison possible ou retrait en boutique.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.5 }} className="mt-6 grid w-full max-w-[420px] grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:max-w-none">
            <Link href="#categories" className={btn({ variant: "primary", size: "lg", className: "max-sm:px-3 max-sm:text-[14px]" })}>
              <span>
                Explorer<span className="hidden sm:inline"> la boutique</span>
              </span>
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link href="/packs" className={btn({ variant: "dark", size: "lg", className: "max-sm:px-3 max-sm:text-[14px]" })}>
              <span>
                Packs<span className="hidden sm:inline"> prêts à jouer</span>
              </span>
            </Link>
          </motion.div>

          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 mb-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] font-medium text-akua-gray-500 md:mb-16">
            <li className="flex items-center gap-1.5">
              <ShieldCheck aria-hidden className="size-4 text-akua-blue" /> Produits garantis
            </li>
            <li className="flex items-center gap-1.5">
              <Truck aria-hidden className="size-4 text-akua-blue" /> Livraison possible
            </li>
          </motion.ul>
        </div>

      </div>
    </section>
  );
}

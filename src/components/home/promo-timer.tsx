"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { type DealTiming, dealEnd } from "@/lib/deals";

/** Secondes restantes avant minuit : le cycle de 24 h redémarre chaque jour, sans s'arrêter. */
function secondsLeft(timing?: DealTiming) {
  const now = new Date();
  const end = dealEnd(timing ?? { mode: "midnight", hours: 24, startedAt: "", repeat: true }, now);
  return end ? Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000)) : 0;
}

function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-grid h-[1.15em] w-[0.64em] place-items-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: "-100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const UNITS = ["h", "min", "s"];

/** Compte à rebours : uniquement des chiffres qui défilent (HH:MM:SS). */
export function PromoTimer({ timing }: { timing?: DealTiming }) {
  const [s, setS] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setS(secondsLeft(timing));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timing]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = s == null ? ["--", "--", "--"] : [pad(Math.floor(s / 3600)), pad(Math.floor((s % 3600) / 60)), pad(s % 60)];

  return (
    <span role="timer" aria-label={s == null ? "Compte à rebours" : `Fin dans ${parts[0]} heures ${parts[1]} minutes ${parts[2]} secondes`} className="inline-flex items-center gap-1 normal-case">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="font-num flex h-8 min-w-[38px] items-center justify-center rounded-[6px] bg-akua-ink px-1.5 text-[15px] leading-none font-bold tracking-normal text-akua-white tabular-nums md:h-9 md:min-w-[44px] md:text-[17px]">
            <Digit value={p[0]} />
            <Digit value={p[1]} />
          </span>
          <span className="text-[11px] font-semibold tracking-normal text-akua-gray-500">{UNITS[i]}</span>
        </span>
      ))}
    </span>
  );
}

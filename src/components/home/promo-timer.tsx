"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/** Secondes restantes avant minuit : le cycle de 24 h redémarre chaque jour, sans s'arrêter. */
function secondsLeft() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
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

/** Compte à rebours : uniquement des chiffres qui défilent (HH:MM:SS). */
export function PromoTimer() {
  const [s, setS] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setS(secondsLeft());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = s == null ? ["--", "--", "--"] : [pad(Math.floor(s / 3600)), pad(Math.floor((s % 3600) / 60)), pad(s % 60)];

  return (
    <div
      role="timer"
      aria-label={s == null ? "Compte à rebours" : `Fin dans ${parts[0]} heures ${parts[1]} minutes ${parts[2]} secondes`}
      className="flex items-center text-[54px] leading-none font-extrabold tracking-[-0.04em] text-akua-ink tabular-nums md:text-[84px]"
    >
      {parts.map((p, i) => (
        <span key={i} className="flex items-center">
          <Digit value={p[0]} />
          <Digit value={p[1]} />
          {i < 2 && <span className="mx-[0.06em] -translate-y-[0.06em] text-akua-blue">:</span>}
        </span>
      ))}
    </div>
  );
}

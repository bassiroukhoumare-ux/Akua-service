"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function remaining(): [string, string, string] {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return [pad(Math.floor(s / 3600)), pad(Math.floor((s % 3600) / 60)), pad(s % 60)];
}

function Digit({ value }: { value: string }) {
  return (
    <span className="relative grid h-7 w-[22px] place-items-center overflow-hidden rounded-md bg-akua-yellow text-[14px] font-extrabold text-akua-ink tabular-nums [perspective:200px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="block [transform-origin:50%_50%]"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Compte à rebours jusqu'à minuit, chiffres en cases jaunes (réf. 1). */
export function Countdown({ className, label = "Fin dans :" }: { className?: string; label?: string }) {
  const [t, setT] = useState<[string, string, string] | null>(null);
  useEffect(() => {
    const tick = () => setT(remaining());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  const parts = t ?? ["--", "--", "--"];
  return (
    <div className={cn("flex items-center gap-2", className)} role="timer" aria-label={t ? `Fin dans ${parts[0]} heures ${parts[1]} minutes` : "Compte à rebours"}>
      <span className="text-[13px] font-semibold text-akua-gray-500">{label}</span>
      <div className="flex items-center gap-1" aria-hidden>
        {parts.map((p, i) => (
          <span key={i} className="flex items-center gap-1">
            <Digit value={p[0]} />
            <Digit value={p[1]} />
            {i < 2 && <span className="font-extrabold text-akua-ink">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

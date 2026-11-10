"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Halo lumineux animé du fond (bleu AKUA très doux sur blanc). */
export function Aurora() {
  const reduce = useReducedMotion();
  const blob = (cls: string, x: number[], y: number[], d: number) => (
    <motion.div aria-hidden className={cn("absolute rounded-full blur-[100px]", cls)} animate={reduce ? undefined : { x, y }} transition={{ duration: d, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} />
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blob("-top-48 -left-40 size-[560px] bg-[#d6e2ff]", [0, 70, -20], [0, 50, 30], 18)}
      {blob("top-1/3 -right-48 size-[520px] bg-[#e3eaff]", [0, -60, 20], [0, 40, -40], 22)}
      {blob("-bottom-56 left-1/3 size-[480px] bg-[#ece7ff]", [0, 50, -40], [0, -40, 10], 20)}
    </div>
  );
}

/** Apparition douce du formulaire. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay, ease }} className={className}>
      {children}
    </motion.div>
  );
}

"use client";

import { useEffect } from "react";

/**
 * Lueur des cartes : note la position du curseur sur la carte survolée (variables --mx / --my),
 * le halo bleu de « .glow-card » suit alors la souris. Un seul écouteur pour tout le site.
 */
export function GlowTracker() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    const on = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = (e.target as Element | null)?.closest?.<HTMLElement>(".glow-card");
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener("pointermove", on, { passive: true });
    return () => document.removeEventListener("pointermove", on);
  }, []);
  return null;
}

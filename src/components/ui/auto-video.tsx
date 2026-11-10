"use client";

import { useEffect, useRef } from "react";

/** Vidéo d'ambiance : sans le son, en boucle, lancée automatiquement (y compris sur iPhone). */
export function AutoVideo({ src, label, className }: { src: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React n'écrit pas l'attribut « muted » dans la page : sans lui, les navigateurs bloquent la lecture automatique
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    const play = () => void v.play().catch(() => {});
    play();
    v.addEventListener("canplay", play, { once: true });
    return () => v.removeEventListener("canplay", play);
  }, [src]);
  return <video ref={ref} src={src} autoPlay muted loop playsInline preload="auto" aria-label={label} className={className} />;
}

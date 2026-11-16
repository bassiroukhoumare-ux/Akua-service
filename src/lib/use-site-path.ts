"use client";

import { usePathname } from "next/navigation";

/**
 * Adresse de la page courante, toujours sous la même forme côté serveur et côté navigateur.
 * Quand l'accueil est régénéré en ligne, le serveur peut le désigner par « /index » (ou rien) :
 * sans cette correction, le lien « Accueil » n'était pas marqué actif et la page se redessinait au chargement.
 */
export function useSitePath(): string {
  const p = usePathname();
  if (!p || p === "/index") return "/";
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

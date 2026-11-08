const fcfa = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** formatFCFA(170000) → "170 000 F" (espaces insécables). */
export function formatFCFA(amount: number): string {
  // fr-FR utilise U+202F (espace fine insécable) : on normalise en U+00A0.
  return `${fcfa.format(Math.round(amount)).replace(/ /g, " ")} F`;
}

/** Pourcentage de réduction arrondi, ex. 17 pour -17 %. */
export function discountPercent(price: number, compareAtPrice?: number): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count > 1 ? plural : singular}`;
}

/** Libellés d'état des produits (la valeur « occasion » correspond aux produits venants). */
export const CONDITION_LABEL = { neuf: "Neuf", occasion: "Venant", reconditionne: "Reconditionné" } as const;
export const PACKAGING_LABEL = { carton: "Dans son carton d'origine", "sans-carton": "Sans carton" } as const;

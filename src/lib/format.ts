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

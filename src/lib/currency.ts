// Conversion des prix : la boutique fixe ses prix en francs CFA (XOF) ;
// le visiteur peut les afficher en euros ou en dollars, à titre indicatif.

export type Currency = "XOF" | "EUR" | "USD";

export const CURRENCIES: { id: Currency; label: string; short: string }[] = [
  { id: "XOF", label: "Franc CFA", short: "FCFA" },
  { id: "EUR", label: "Euro", short: "€" },
  { id: "USD", label: "Dollar US", short: "$" },
];

/** Parité fixe officielle : 1 € = 655,957 F CFA (le franc CFA est arrimé à l'euro). */
export const XOF_PER_EUR = 655.957;

/** Taux de secours si le service de taux ne répond pas (1 $ en F CFA, ordre de grandeur récent). */
export const FALLBACK_XOF_PER_USD = 590;

export interface Rates {
  /** F CFA pour 1 dollar */
  xofPerUsd: number;
  /** date du taux (ISO) */
  date: string;
  /** taux de secours utilisé */
  fallback: boolean;
}

const fcfa = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Convertit un montant en F CFA dans la devise demandée. */
export function convert(amountXof: number, currency: Currency, rates: Rates): number {
  if (currency === "EUR") return amountXof / XOF_PER_EUR;
  if (currency === "USD") return amountXof / rates.xofPerUsd;
  return amountXof;
}

/** Affiche un montant (donné en F CFA) dans la devise choisie : « 170 000 F », « 259,16 € », « 300,88 $ ». */
export function formatMoney(amountXof: number, currency: Currency, rates: Rates): string {
  if (currency === "XOF") return `${fcfa.format(Math.round(amountXof)).replace(/ /g, " ")} F`;
  const v = convert(amountXof, currency, rates);
  // au-delà de 1 000, on arrondit à l'unité pour rester lisible
  const nf = new Intl.NumberFormat("fr-FR", { style: "currency", currency, currencyDisplay: "narrowSymbol", minimumFractionDigits: v >= 1000 ? 0 : 2, maximumFractionDigits: v >= 1000 ? 0 : 2 });
  return nf.format(v).replace(/ /g, " ");
}

// Codes promo de démonstration. Plus tard : table Supabase `promo_codes`.

export interface PromoCode {
  /** identifiant interne (espace administrateur) */
  id?: string;
  code: string;
  type: "percent" | "amount";
  value: number;
  minTotal?: number;
  label: string;
  /** désactivé depuis l'espace administrateur */
  active?: boolean;
  /** début et fin de validité (ISO) ; sans fin : valable tant qu'il est actif */
  startsAt?: string;
  endsAt?: string;
  createdBy?: string;
}

export const promoCodes: PromoCode[] = [
  { code: "AKUA10", type: "percent", value: 10, label: "-10 % sur votre commande" },
  { code: "BIENVENUE", type: "amount", value: 5000, minTotal: 50000, label: "-5 000 F dès 50 000 F d'achat" },
];

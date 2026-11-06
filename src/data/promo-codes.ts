// Codes promo de démonstration. Plus tard : table Supabase `promo_codes`.

export interface PromoCode {
  code: string;
  type: "percent" | "amount";
  value: number;
  minTotal?: number;
  label: string;
}

export const promoCodes: PromoCode[] = [
  { code: "AKUA10", type: "percent", value: 10, label: "-10 % sur votre commande" },
  { code: "BIENVENUE", type: "amount", value: 5000, minTotal: 50000, label: "-5 000 F dès 50 000 F d'achat" },
];

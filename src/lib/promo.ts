import { type PromoCode, promoCodes } from "@/data/promo-codes";
import { formatFCFA } from "@/lib/format";

export type PromoResult = { ok: true; promo: PromoCode; discount: number } | { ok: false; error: string };

/** Vérifie un code promo. Asynchrone : sera remplacé par une requête Supabase. */
export async function checkPromoCode(raw: string, subtotal: number, list: PromoCode[] = promoCodes): Promise<PromoResult> {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Saisissez un code promo." };
  const promo = list.find((p) => p.code === code);
  if (!promo || !isPromoValid(promo)) return { ok: false, error: "Ce code promo n'existe pas ou a expiré." };
  if (promo.minTotal && subtotal < promo.minTotal)
    return { ok: false, error: `Code valable dès ${formatFCFA(promo.minTotal)} d'achat.` };
  return { ok: true, promo, discount: computeDiscount(promo, subtotal) };
}

export function computeDiscount(promo: PromoCode, subtotal: number): number {
  const d = promo.type === "percent" ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return Math.min(d, subtotal);
}

/** Code actif, déjà commencé et pas encore expiré. */
export function isPromoValid(p: PromoCode, now = Date.now()) {
  if (p.active === false) return false;
  if (p.startsAt && new Date(p.startsAt).getTime() > now) return false;
  if (p.endsAt && new Date(p.endsAt).getTime() <= now) return false;
  return true;
}

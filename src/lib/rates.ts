import { FALLBACK_XOF_PER_USD, type Rates, XOF_PER_EUR } from "@/lib/currency";

/**
 * Taux du dollar, calculé à partir du taux euro → dollar du jour (le franc CFA est arrimé à l'euro).
 * Mis en cache 6 heures ; en cas d'échec, taux de secours.
 */
export async function getRates(): Promise<Rates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", { next: { revalidate: 21600 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(String(res.status));
    const j = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
    const usdPerEur = j.rates?.USD;
    if (j.result !== "success" || !usdPerEur || usdPerEur < 0.5 || usdPerEur > 2) throw new Error("taux invalide");
    return { xofPerUsd: XOF_PER_EUR / usdPerEur, date: j.time_last_update_utc ? new Date(j.time_last_update_utc).toISOString() : new Date().toISOString(), fallback: false };
  } catch {
    return { xofPerUsd: FALLBACK_XOF_PER_USD, date: new Date().toISOString(), fallback: true };
  }
}

"use client";

import { createContext, useContext } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CURRENCIES, type Currency, FALLBACK_XOF_PER_USD, formatMoney, type Rates } from "@/lib/currency";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

/** Devise choisie par le visiteur (gardée sur son appareil). */
export const useCurrency = create<{ currency: Currency; setCurrency: (c: Currency) => void }>()(
  persist((set) => ({ currency: "XOF", setCurrency: (currency) => set({ currency }) }), { name: "akua-devise" }),
);

const RatesCtx = createContext<Rates>({ xofPerUsd: FALLBACK_XOF_PER_USD, date: "", fallback: true });

export function RatesProvider({ value, children }: { value: Rates; children: React.ReactNode }) {
  return <RatesCtx.Provider value={value}>{children}</RatesCtx.Provider>;
}

export const useRates = () => useContext(RatesCtx);

/**
 * Formateur de prix dans la devise choisie. Avant le chargement complet de la page, on affiche
 * toujours les F CFA (même rendu côté serveur et navigateur).
 */
export function useMoney() {
  const hydrated = useHydrated();
  const currency = useCurrency((s) => s.currency);
  const rates = useRates();
  const cur: Currency = hydrated ? currency : "XOF";
  return (amountXof: number) => formatMoney(amountXof, cur, rates);
}

/** Prix affiché (utilisable dans les pages rendues par le serveur). */
export function Money({ amount, className }: { amount: number; className?: string }) {
  const money = useMoney();
  return <span className={className}>{money(amount)}</span>;
}

/** Sélecteur F CFA / € / $. */
export function CurrencySwitch({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const hydrated = useHydrated();
  const { currency, setCurrency } = useCurrency();
  const cur = hydrated ? currency : "XOF";
  return (
    <div role="radiogroup" aria-label="Devise d'affichage des prix" className={cn("inline-flex shrink-0 items-center rounded-full bg-akua-page p-0.5 ring-1 ring-akua-gray-200", className)}>
      {CURRENCIES.map((c) => {
        const on = cur === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            title={c.label}
            onClick={() => setCurrency(c.id)}
            className={cn(
              "rounded-full font-bold tabular-nums transition-colors",
              size === "sm" ? "h-7 min-w-8 px-2 text-[11.5px]" : "h-9 min-w-10 px-3 text-[12.5px]",
              on ? "bg-akua-ink text-akua-white shadow-sm" : "text-akua-gray-500 hover:text-akua-ink",
            )}
          >
            {c.short}
          </button>
        );
      })}
    </div>
  );
}

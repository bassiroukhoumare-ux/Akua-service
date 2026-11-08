"use client";

import { useCallback, useEffect, useState } from "react";
import type { StatsResult } from "@/lib/analytics/aggregate";
import { useAdmin } from "../actor-context";
import { type PeriodValue, periodQuery } from "../period-filter";

/** Charge les statistiques de la période (vraies visites, ou exemple tant qu'il n'y en a aucune). */
export function useStats(value: PeriodValue) {
  const { base } = useAdmin();
  const q = periodQuery(value);
  const [data, setData] = useState<StatsResult | null>(null);
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/stats?${q}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setKey(q);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [base, q]);

  useEffect(() => {
    void load();
  }, [load]);

  // vraies visites : actualisation automatique chaque minute
  useEffect(() => {
    if (!data || data.demo) return;
    const id = setInterval(() => void load(), 60_000);
    return () => clearInterval(id);
  }, [data, load]);

  /** data correspond-elle à la période affichée ? (sinon on garde l'ancienne, estompée) */
  return { data, fresh: key === q, error, loading, reload: load };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminModuleId } from "@/config/admin";

const NOTIF: AdminModuleId[] = ["orders", "reviews", "favorites", "carts", "activity"];

/**
 * Pastilles « nouveau » du menu (commandes, avis, favoris, paniers, activité de l'équipe).
 * L'onglet ouvert est marqué comme vu : sa pastille disparaît aussitôt.
 */
export function useNotifications(base: string, enabled: boolean, current?: AdminModuleId) {
  const [counts, setCounts] = useState<Partial<Record<AdminModuleId, number>>>({});
  const open = useRef(current);
  open.current = current;

  const seen = useCallback(
    (m: AdminModuleId) => {
      setCounts((c) => ({ ...c, [m]: 0 }));
      void fetch(`${base}/api/notifications`, { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ module: m }) }).catch(() => {});
    },
    [base],
  );

  const load = useCallback(async () => {
    const res = await fetch(`${base}/api/notifications`, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const data = (await res.json()) as Partial<Record<AdminModuleId, number>>;
    const cur = open.current;
    // nouveautés arrivées pendant qu'on regarde l'onglet : elles sont vues
    if (cur && NOTIF.includes(cur) && data[cur]) {
      data[cur] = 0;
      seen(cur);
    }
    setCounts(data);
  }, [base, seen]);

  useEffect(() => {
    if (!enabled) return;
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    const again = () => void load();
    window.addEventListener("akua:orders", again);
    window.addEventListener("focus", again);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("akua:orders", again);
      window.removeEventListener("focus", again);
    };
  }, [enabled, load]);

  useEffect(() => {
    if (enabled && current && NOTIF.includes(current)) seen(current);
  }, [enabled, current, seen]);

  return counts;
}

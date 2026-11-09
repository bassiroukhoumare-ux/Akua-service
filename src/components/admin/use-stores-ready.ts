"use client";

import { useEffect, useState } from "react";
import { onSaveState } from "@/lib/server-storage";
import { useAdminCatalog } from "@/store/admin-catalog";
import { useAdminHome } from "@/store/admin-home";
import { useAdminPromos } from "@/store/admin-promos";
import { useAdminSettings } from "@/store/admin-settings";

const STORES = [useAdminCatalog, useAdminHome, useAdminPromos, useAdminSettings];

/** Vrai quand les contenus de l'admin sont chargés depuis la base. */
export function useStoresReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const check = () => setReady(STORES.every((s) => s.persist.hasHydrated()));
    const unsubs = STORES.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubs.forEach((u) => u());
  }, []);
  return ready;
}

/** « Enregistrement… », « Enregistré » ou erreur, pour l'indicateur de l'admin. */
export function useSaveState() {
  const [s, setS] = useState<"idle" | "saving" | "error">("idle");
  useEffect(() => onSaveState(setS), []);
  return s;
}

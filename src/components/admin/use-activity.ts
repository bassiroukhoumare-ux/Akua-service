"use client";

import { useMemo } from "react";
import { type ActivityEntry, DEMO_ACTIVITY } from "@/lib/admin/demo";
import { useHydrated } from "@/lib/use-hydrated";
import { useAdminCatalog } from "@/store/admin-catalog";

/** Actions des équipiers : celles faites dans ce navigateur + les exemples, de la plus récente à la plus ancienne. */
export function useActivity(memberId?: string): ActivityEntry[] {
  const hydrated = useHydrated();
  const stored = useAdminCatalog((s) => s.activity);
  return useMemo(() => {
    const real: ActivityEntry[] = hydrated ? stored.map((a) => ({ ...a, at: new Date(a.at) })) : [];
    const all = [...real, ...DEMO_ACTIVITY].sort((a, b) => b.at.getTime() - a.at.getTime());
    return memberId ? all.filter((a) => a.memberId === memberId) : all;
  }, [hydrated, stored, memberId]);
}

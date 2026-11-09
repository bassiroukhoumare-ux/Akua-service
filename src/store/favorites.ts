"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { visitorId } from "@/components/analytics/visit-tracker";

interface FavoritesState {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const on = !get().ids.includes(id);
        set((s) => ({ ids: on ? [...s.ids, id] : s.ids.filter((x) => x !== id) }));
        // compté (anonymement) pour le classement des produits les plus aimés dans l'admin
        void fetch("/api/favoris", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ v: visitorId(), productId: id, on }), keepalive: true }).catch(() => {});
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: "akua-favorites" },
  ),
);

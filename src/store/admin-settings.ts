"use client";

// Paramètres de la boutique, enregistrés dans la base Neon depuis l'espace admin.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { serverStorage } from "@/lib/server-storage";
import { initialSettings, type ShopSettings } from "@/lib/shop-settings";
import { type Actor, type StoredActivity, useAdminCatalog } from "./admin-catalog";

export * from "@/lib/shop-settings";

interface AdminSettings {
  settings: ShopSettings;
  save: (s: ShopSettings, actor: Actor, detail?: string) => void;
}

export const useAdminSettings = create<AdminSettings>()(
  persist(
    (set) => ({
      settings: initialSettings,
      save: (settings, actor, detail) => {
        set({ settings });
        if (actor.kind === "team") {
          const e: StoredActivity = { id: `${Date.now().toString(36)}`, memberId: actor.id, memberName: actor.name, action: "update", module: "settings", target: "Paramètres de la boutique", detail, at: new Date().toISOString() };
          useAdminCatalog.setState((s) => ({ activity: [e, ...s.activity] }));
        }
      },
    }),
    { name: "akua-admin-settings", version: 1, storage: serverStorage },
  ),
);


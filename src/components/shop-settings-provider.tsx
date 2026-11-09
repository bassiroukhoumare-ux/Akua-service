"use client";

import { createContext, useContext } from "react";
import { initialSettings, type ShopSettings } from "@/lib/shop-settings";
import { setWhatsAppNumber } from "@/lib/whatsapp";

// Paramètres de la boutique (lus dans la base par le serveur) pour les composants du navigateur.
const Ctx = createContext<ShopSettings>(initialSettings);

export function ShopSettingsProvider({ value, children }: { value: ShopSettings; children: React.ReactNode }) {
  setWhatsAppNumber(value.whatsapp);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useShopSettings = () => useContext(Ctx);

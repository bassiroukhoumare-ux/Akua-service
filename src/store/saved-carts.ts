"use client";

// Paniers enregistrés par les clients (bouton « Enregistrer mon panier »), dans la base Neon.
// L'espace administrateur les affiche pour relancer les clients qui n'ont pas finalisé.
import { create } from "zustand";
import { portal } from "@/lib/server-storage";
import type { CartItem } from "./cart";

export type SavedCartStatus = "pending" | "contacted" | "ordered" | "lost";

export interface SavedCart {
  id: string;
  name: string;
  phone: string;
  email?: string;
  country?: string;
  city?: string;
  items: CartItem[];
  subtotal: number;
  promoCode?: string;
  status: SavedCartStatus;
  savedAt: string;
  updatedAt: string;
  contactedAt?: string;
  contactedBy?: string;
  orderedAt?: string;
}

interface SavedCartsState {
  carts: SavedCart[];
  loaded: boolean;
  /** espace admin : charge tous les paniers enregistrés */
  load: () => Promise<void>;
  /** enregistre (ou met à jour, même numéro) le panier d'un client */
  save: (c: Omit<SavedCart, "id" | "status" | "savedAt" | "updatedAt">) => Promise<boolean>;
  /** commande envoyée sur WhatsApp : le panier enregistré passe à « Commandé » */
  markOrdered: (phone: string) => void;
  setStatus: (id: string, status: SavedCartStatus, by?: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const json = { "Content-Type": "application/json" };

export const useSavedCarts = create<SavedCartsState>()((set) => ({
  carts: [],
  loaded: false,
  load: async () => {
    const base = portal();
    if (!base) return;
    const res = await fetch(`${base}/api/clients/paniers`, { cache: "no-store" }).catch(() => null);
    set({ carts: res?.ok ? ((await res.json()) as SavedCart[]) : [], loaded: true });
  },
  save: async (c) => {
    const res = await fetch("/api/paniers", { method: "POST", headers: json, body: JSON.stringify(c) }).catch(() => null);
    return !!res?.ok;
  },
  markOrdered: (phone) => {
    void fetch("/api/paniers", { method: "POST", headers: json, body: JSON.stringify({ phone, ordered: true }), keepalive: true }).catch(() => {});
  },
  setStatus: async (id, status, by) => {
    const now = new Date().toISOString();
    set((s) => ({ carts: s.carts.map((x) => (x.id === id ? { ...x, status, updatedAt: now, ...(status === "contacted" ? { contactedAt: now, contactedBy: by } : {}) } : x)) }));
    await fetch(`${portal()}/api/clients/paniers`, { method: "PATCH", headers: json, body: JSON.stringify({ id, status }) });
  },
  remove: async (id) => {
    set((s) => ({ carts: s.carts.filter((x) => x.id !== id) }));
    await fetch(`${portal()}/api/clients/paniers?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  },
}));

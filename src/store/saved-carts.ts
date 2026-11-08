"use client";

// Paniers enregistrés par les clients (bouton « Enregistrer mon panier »).
// En attendant la base de données, ils sont gardés dans ce navigateur ; l'espace
// administrateur les affiche pour relancer les clients qui n'ont pas finalisé.
import { create } from "zustand";
import { persist } from "zustand/middleware";
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

const digits = (s: string) => s.replace(/\D/g, "");

interface SavedCartsState {
  carts: SavedCart[];
  /** enregistre (ou met à jour, même numéro) le panier d'un client */
  save: (c: Omit<SavedCart, "id" | "status" | "savedAt" | "updatedAt">) => void;
  /** commande envoyée sur WhatsApp : le panier enregistré passe à « Commandé » */
  markOrdered: (phone: string) => void;
  setStatus: (id: string, status: SavedCartStatus, by?: string) => void;
  remove: (id: string) => void;
}

export const useSavedCarts = create<SavedCartsState>()(
  persist(
    (set, get) => ({
      carts: [],
      save: (c) => {
        const now = new Date().toISOString();
        const existing = get().carts.find((x) => digits(x.phone) === digits(c.phone) && x.status !== "ordered");
        if (existing) {
          set((s) => ({ carts: s.carts.map((x) => (x.id === existing.id ? { ...x, ...c, status: "pending", updatedAt: now } : x)) }));
        } else {
          const cart: SavedCart = { ...c, id: `cart-${Date.now().toString(36)}`, status: "pending", savedAt: now, updatedAt: now };
          set((s) => ({ carts: [cart, ...s.carts] }));
        }
      },
      markOrdered: (phone) => {
        const now = new Date().toISOString();
        set((s) => ({ carts: s.carts.map((x) => (digits(x.phone) === digits(phone) && x.status !== "ordered" ? { ...x, status: "ordered", orderedAt: now, updatedAt: now } : x)) }));
      },
      setStatus: (id, status, by) => {
        const now = new Date().toISOString();
        set((s) => ({ carts: s.carts.map((x) => (x.id === id ? { ...x, status, updatedAt: now, ...(status === "contacted" ? { contactedAt: now, contactedBy: by } : {}) } : x)) }));
      },
      remove: (id) => set((s) => ({ carts: s.carts.filter((x) => x.id !== id) })),
    }),
    { name: "akua-saved-carts", version: 1 },
  ),
);

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  categoryId: string;
  image?: string;
  quantity: number;
}

export interface CheckoutDraft {
  mode: "livraison" | "retrait";
  name: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  landmark: string;
  pickupDate: string;
  pickupTime: string;
  deposit: "none" | "25" | "50" | "100";
  note: string;
  promoCode: string;
}

export const EMPTY_DRAFT: CheckoutDraft = {
  mode: "livraison",
  name: "",
  phone: "",
  email: "",
  country: "Togo",
  city: "",
  address: "",
  landmark: "",
  pickupDate: "",
  pickupTime: "",
  deposit: "none",
  note: "",
  promoCode: "",
};

interface CartState {
  items: CartItem[];
  draft: CheckoutDraft;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setDraft: (data: Partial<CheckoutDraft>) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      draft: EMPTY_DRAFT,
      add: (item, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return { items: s.items.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i)) };
          }
          return { items: [...s.items, { ...item, quantity }] };
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          items: quantity <= 0 ? s.items.filter((i) => i.productId !== productId) : s.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set((s) => ({ items: [], draft: { ...s.draft, promoCode: "", note: "", pickupDate: "", pickupTime: "", deposit: "none" } })),
      setDraft: (data) => set((s) => ({ draft: { ...s.draft, ...data } })),
    }),
    {
      name: "akua-cart",
      version: 2,
      migrate: (persisted) => {
        const p = persisted as Partial<CartState>;
        return { items: p.items ?? [], draft: EMPTY_DRAFT } as CartState;
      },
    },
  ),
);

export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectTotal = (s: CartState) => s.items.reduce((n, i) => n + i.price * i.quantity, 0);

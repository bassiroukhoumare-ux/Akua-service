"use client";

import { create } from "zustand";

export interface AddedToast {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface UIState {
  searchOpen: boolean;
  menuOpen: boolean;
  /** demande d'ouverture du panneau de filtres (bouton de l'en-tête sur téléphone) */
  filtersOpen: boolean;
  cartPulse: number; // incrémenté à chaque ajout → rebond du compteur
  toast: AddedToast | null;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setFiltersOpen: (open: boolean) => void;
  notifyAdded: (t: Omit<AddedToast, "id">) => void;
  dismissToast: () => void;
}

export const useUI = create<UIState>()((set) => ({
  searchOpen: false,
  menuOpen: false,
  filtersOpen: false,
  cartPulse: 0,
  toast: null,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setFiltersOpen: (filtersOpen) => set({ filtersOpen }),
  notifyAdded: (t) => set((s) => ({ cartPulse: s.cartPulse + 1, toast: { ...t, id: Date.now() } })),
  dismissToast: () => set({ toast: null }),
}));

"use client";

import { create } from "zustand";
import { portal } from "@/lib/server-storage";
import type { Review } from "@/types/catalog";

// Avis des clients, enregistrés dans la base Neon.
// Site public : avis publiés uniquement. Espace admin : tous les avis, avec modération.
interface ReviewsState {
  reviews: Review[];
  loaded: boolean;
  load: (force?: boolean) => Promise<void>;
  addReview: (r: Omit<Review, "id" | "createdAt" | "status">) => Promise<Review>;
  /** modération depuis l'espace administrateur */
  setStatus: (id: string, status: Review["status"]) => Promise<void>;
  removeReview: (id: string) => Promise<void>;
}

let loading: Promise<void> | null = null;

export const useReviews = create<ReviewsState>()((set, get) => ({
  reviews: [],
  loaded: false,
  load: (force) => {
    if (loading && !force) return loading;
    if (get().loaded && !force) return Promise.resolve();
    const base = portal();
    loading = fetch(base ? `${base}/api/clients/avis` : "/api/avis", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((reviews: Review[]) => set({ reviews, loaded: true }))
      .catch(() => set({ loaded: true }))
      .finally(() => {
        loading = null;
      });
    return loading;
  },
  addReview: async (r) => {
    const res = await fetch("/api/avis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
    if (!res.ok) throw new Error(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "Envoi impossible");
    const review = (await res.json()) as Review;
    set((s) => ({ reviews: [review, ...s.reviews] }));
    return review;
  },
  setStatus: async (id, status) => {
    set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)) }));
    await fetch(`${portal()}/api/clients/avis`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
  },
  removeReview: async (id) => {
    set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
    await fetch(`${portal()}/api/clients/avis?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  },
}));

/** Charge les avis une fois (à appeler dans les composants qui les affichent). */
export function ensureReviews() {
  if (typeof window !== "undefined") void useReviews.getState().load();
}

export function summarize(reviews: Review[], productId: string) {
  const list = reviews.filter((r) => r.productId === productId && r.status === "publie");
  const count = list.length;
  const average = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ stars: n, count: list.filter((r) => r.rating === n).length }));
  return { list, count, average, distribution };
}

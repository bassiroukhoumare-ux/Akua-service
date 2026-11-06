"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedReviews } from "@/data/reviews";
import type { Review } from "@/types/catalog";

// Stockage provisoire des avis (navigateur du visiteur).
// À remplacer par des appels Supabase : addReview → insert, lecture → select where status = 'publie'.
interface ReviewsState {
  reviews: Review[];
  addReview: (r: Omit<Review, "id" | "createdAt" | "status">) => Review;
}

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      reviews: seedReviews,
      addReview: (r) => {
        const review: Review = { ...r, id: `rev-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), status: "publie" };
        set((s) => ({ reviews: [review, ...s.reviews] }));
        return review;
      },
    }),
    { name: "akua-reviews" },
  ),
);

export function summarize(reviews: Review[], productId: string) {
  const list = reviews.filter((r) => r.productId === productId && r.status === "publie");
  const count = list.length;
  const average = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ stars: n, count: list.filter((r) => r.rating === n).length }));
  return { list, count, average, distribution };
}

import type { Metadata } from "next";
import { ReviewsView } from "@/components/admin/clients/reviews-view";

export const metadata: Metadata = { title: "Avis" };

export default function Page() {
  return (
    <>
      <ReviewsView />
    </>
  );
}

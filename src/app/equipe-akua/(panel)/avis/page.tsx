import type { Metadata } from "next";
import { ReviewsView } from "@/components/admin/clients/reviews-view";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Avis" };

export default function Page() {
  return (
    <TeamGate module="reviews">
      <ReviewsView />
    </TeamGate>
  );
}

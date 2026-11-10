import type { Metadata } from "next";
import { TeamDashboard } from "@/components/admin/team-dashboard";
import { requireMember } from "@/lib/admin/current-member";

export const metadata: Metadata = { title: "Mon espace" };

export default async function TeamHome() {
  const member = await requireMember();
  return <TeamDashboard name={member.name} memberId={member.id} />;
}

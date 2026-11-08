import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/admin/coming-soon";
import { Denied } from "@/components/admin/denied";
import { ADMIN_MODULES, TEAM_BASE } from "@/config/admin";
import { requireMember } from "@/lib/admin/current-member";

const bySlug = (slug: string) => ADMIN_MODULES.find((m) => m.slug === slug && slug);

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const m = bySlug((await params).section);
  return { title: m?.label ?? "Introuvable" };
}

export default async function TeamSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const member = await requireMember();
  const m = bySlug((await params).section);
  if (!m) notFound();
  // module non attribué (ou réservé au propriétaire) : accès refusé
  if (m.ownerOnly || !member.modules.includes(m.id)) return <Denied />;
  return <ComingSoon module={m} base={TEAM_BASE} />;
}

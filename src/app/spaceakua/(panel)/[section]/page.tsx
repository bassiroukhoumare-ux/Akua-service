import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/admin/coming-soon";
import { ADMIN_BASE, ADMIN_MODULES } from "@/config/admin";

const bySlug = (slug: string) => ADMIN_MODULES.find((m) => m.slug === slug && slug);

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const m = bySlug((await params).section);
  return { title: m?.label ?? "Introuvable" };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const m = bySlug((await params).section);
  if (!m) notFound();
  return <ComingSoon module={m} base={ADMIN_BASE} />;
}

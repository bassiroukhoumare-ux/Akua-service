import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/admin/login-screen";
import { TEAM_BASE } from "@/config/admin-base";
import { readSession, SESSION } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

export default async function TeamLoginPage() {
  if (await readSession("team", (await cookies()).get(SESSION.team.cookie)?.value)) redirect(TEAM_BASE);
  return <LoginScreen kind="team" />;
}

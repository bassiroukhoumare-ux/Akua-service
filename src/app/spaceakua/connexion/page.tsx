import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/admin/login-screen";
import { ADMIN_BASE } from "@/config/admin-base";
import { readSession, SESSION } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

export default async function OwnerLoginPage() {
  if (await readSession("owner", (await cookies()).get(SESSION.owner.cookie)?.value)) redirect(ADMIN_BASE);
  return <LoginScreen kind="owner" />;
}

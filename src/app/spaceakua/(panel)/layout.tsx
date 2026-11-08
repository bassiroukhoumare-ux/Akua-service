import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { ADMIN_BASE } from "@/config/admin-base";
import { readSession, SESSION } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // double verrou : le middleware filtre déjà, on revérifie côté serveur
  const user = await readSession("owner", (await cookies()).get(SESSION.owner.cookie)?.value);
  if (!user) redirect(`${ADMIN_BASE}/connexion`);
  return (
    <AdminShell kind="owner" user={{ name: "Propriétaire", role: "Accès complet" }} actor={{ id: "proprietaire", name: "Propriétaire", kind: "owner" }}>
      {children}
    </AdminShell>
  );
}

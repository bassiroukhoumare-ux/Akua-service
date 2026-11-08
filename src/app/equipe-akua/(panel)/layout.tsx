import { AdminShell } from "@/components/admin/shell";
import { requireMember } from "@/lib/admin/current-member";

export const dynamic = "force-dynamic";

export default async function TeamPanelLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember();
  const n = member.modules.length;
  return (
    <AdminShell
      kind="team"
      user={{
        name: member.name,
        role: `${n} module${n > 1 ? "s" : ""} attribué${n > 1 ? "s" : ""}`,
      }}
      actor={{ id: member.id, name: member.name, kind: "team" }}
      allowed={member.modules}
    >
      {children}
    </AdminShell>
  );
}

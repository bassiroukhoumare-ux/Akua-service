import type { AdminModuleId } from "@/config/admin";
import { requireMember } from "@/lib/admin/current-member";
import { Denied } from "./denied";

/** Portail équipe : n'affiche la page que si le module a été attribué à l'équipier. */
export async function TeamGate({ module, children }: { module: AdminModuleId; children: React.ReactNode }) {
  const member = await requireMember();
  return member.modules.includes(module) ? <>{children}</> : <Denied />;
}

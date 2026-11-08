import { handleLogin, handleLogout } from "@/lib/admin/login-route";
import { checkMemberCredentials } from "@/lib/admin/team-auth";

// Portail des équipiers : numéro WhatsApp + mot de passe.
export async function POST(req: Request) {
  return handleLogin(req, "team", (b) => checkMemberCredentials(b.identifier ?? "", b.password ?? "")?.id ?? null, "Numéro ou mot de passe incorrect.");
}

export function DELETE() {
  return handleLogout("team");
}

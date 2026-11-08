import { handleLogin, handleLogout } from "@/lib/admin/login-route";
import { checkOwnerPassword, OWNER_ID } from "@/lib/admin/session";

// Portail du propriétaire : mot de passe seul.
export async function POST(req: Request) {
  return handleLogin(req, "owner", (b) => (checkOwnerPassword(b.password ?? "") ? OWNER_ID : null), "Mot de passe incorrect.");
}

export function DELETE() {
  return handleLogout("owner");
}

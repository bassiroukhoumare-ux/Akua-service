import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TEAM_BASE } from "@/config/admin-base";
import { readSession, SESSION } from "./session";
import { findMember } from "./team-auth";

/** Équipier connecté (portail équipe) ; renvoie vers la connexion sinon. */
export async function requireMember() {
  const id = await readSession("team", (await cookies()).get(SESSION.team.cookie)?.value);
  const member = id ? await findMember(id) : undefined;
  if (!member) redirect(`${TEAM_BASE}/connexion`);
  return member;
}

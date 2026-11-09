import { cookies } from "next/headers";
import type { PortalKind } from "@/config/admin-base";
import { readSession, SESSION } from "./session";
import { findMember } from "./team-auth";

/** Nom de la personne connectée à ce portail (null si personne). */
export async function portalUser(kind: PortalKind): Promise<string | null> {
  const id = await readSession(kind, (await cookies()).get(SESSION[kind].cookie)?.value);
  if (!id) return null;
  if (kind === "owner") return "Propriétaire";
  const m = await findMember(id);
  return m && !m.mustChange ? m.name : null;
}

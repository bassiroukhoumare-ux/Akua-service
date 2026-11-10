import { cookies } from "next/headers";
import type { PortalKind } from "@/config/admin-base";
import type { Perms } from "@/config/permissions";
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

/** Personne connectée et ses droits (perms absent : propriétaire, tous les droits). */
export async function portalMember(kind: PortalKind): Promise<{ name: string; perms?: Perms } | null> {
  const id = await readSession(kind, (await cookies()).get(SESSION[kind].cookie)?.value);
  if (!id) return null;
  if (kind === "owner") return { name: "Propriétaire" };
  const m = await findMember(id);
  return m && !m.mustChange ? { name: m.name, perms: m.perms } : null;
}

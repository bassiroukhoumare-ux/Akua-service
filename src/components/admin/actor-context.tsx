"use client";

import { createContext, useContext } from "react";
import type { AdminModuleId } from "@/config/admin";
import { can, type Perms } from "@/config/permissions";
import type { Actor } from "@/store/admin-catalog";

interface AdminCtx {
  actor: Actor;
  /** adresse du portail courant (/spaceakua ou /equipe-akua) */
  base: string;
  /** droits de l'équipier (absent : propriétaire, tous les droits) */
  perms?: Perms;
}

const Ctx = createContext<AdminCtx>({ actor: { id: "proprietaire", name: "Propriétaire", kind: "owner" }, base: "/spaceakua" });

export function AdminProvider({ actor, base, perms, children }: AdminCtx & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ actor, base, perms }}>{children}</Ctx.Provider>;
}

/** Peut-on faire cette action ? (le propriétaire peut tout faire) */
export function useCan() {
  const { perms } = useContext(Ctx);
  return (m: AdminModuleId, action = "view") => can(perms, m, action);
}

/** Qui agit (propriétaire ou équipier) et dans quel portail. */
export const useAdmin = () => useContext(Ctx);

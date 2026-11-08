"use client";

import { createContext, useContext } from "react";
import type { Actor } from "@/store/admin-catalog";

interface AdminCtx {
  actor: Actor;
  /** adresse du portail courant (/spaceakua ou /equipe-akua) */
  base: string;
}

const Ctx = createContext<AdminCtx>({ actor: { id: "proprietaire", name: "Propriétaire", kind: "owner" }, base: "/spaceakua" });

export function AdminProvider({ actor, base, children }: AdminCtx & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ actor, base }}>{children}</Ctx.Provider>;
}

/** Qui agit (propriétaire ou équipier) et dans quel portail. */
export const useAdmin = () => useContext(Ctx);

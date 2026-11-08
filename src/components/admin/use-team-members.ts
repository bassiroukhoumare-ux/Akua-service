"use client";

import { useEffect, useState } from "react";
import type { PublicMember } from "@/lib/admin/team-store";
import { useAdmin } from "./actor-context";

/** Équipiers enregistrés (portail du propriétaire uniquement). */
export function useTeamMembers() {
  const { base, actor } = useAdmin();
  const [members, setMembers] = useState<PublicMember[]>([]);
  useEffect(() => {
    if (actor.kind !== "owner") return;
    let on = true;
    fetch(`${base}/api/equipe`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: PublicMember[]) => on && setMembers(list))
      .catch(() => {});
    return () => {
      on = false;
    };
  }, [base, actor.kind]);
  return members;
}

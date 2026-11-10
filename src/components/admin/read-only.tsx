"use client";

import { Lock } from "lucide-react";
import type { AdminModuleId } from "@/config/admin";
import { PERMISSIONS } from "@/config/permissions";
import { useAdmin } from "./actor-context";

/** Bandeau pour l'équipier : ce qu'il peut faire, et ce qui reste réservé au responsable. */
export function ReadOnlyNotice({ module }: { module: AdminModuleId }) {
  const { perms } = useAdmin();
  if (!perms) return null;
  const mine = perms[module] ?? [];
  const defs = (PERMISSIONS[module] ?? []).filter((d) => d.id !== "view");
  const denied = defs.filter((d) => !mine.includes(d.id));
  if (!denied.length) return null;
  const allowed = defs.filter((d) => mine.includes(d.id));
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-akua-gray-200 bg-akua-white px-4 py-3 text-[13.5px]">
      <Lock aria-hidden className="mt-0.5 size-[18px] shrink-0 text-akua-gray-500" strokeWidth={1.8} />
      <p>
        <span className="font-semibold">{allowed.length ? "Accès limité." : "Lecture seule."}</span>{" "}
        <span className="text-akua-gray-500">
          {allowed.length ? `Vous pouvez : ${allowed.map((d) => d.label.toLowerCase()).join(", ")}. ` : "Vous pouvez consulter cette page. "}
          Réservé au responsable : {denied.map((d) => d.label.toLowerCase()).join(", ")}.
        </span>
      </p>
    </div>
  );
}

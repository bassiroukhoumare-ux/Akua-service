"use client";

import { useState } from "react";
import { DEMO_TEAM } from "@/lib/admin/demo";
import { useActivity } from "./use-activity";
import { cn } from "@/lib/utils";
import { ActivityFeed } from "./activity-feed";
import { DemoNotice, PageHeader, Panel } from "./ui";

/** Vue du propriétaire : tout ce que font les équipiers, filtrable par personne. */
export function ActivityView() {
  const members = DEMO_TEAM.filter((m) => !m.owner);
  const [who, setWho] = useState<string>("all");
  const all = useActivity();
  const entries = who === "all" ? all : all.filter((e) => e.memberId === who);
  const count = (id: string) => all.filter((e) => e.memberId === id).length;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title="Activité de l'équipe" description="Chaque ajout, modification ou suppression faite par un équipier est enregistrée ici, avec son nom, la date et l'heure." />
      <DemoNotice>Les actions affichées sont des exemples. Dès que la base de données sera branchée, chaque action réelle de vos équipiers apparaîtra ici automatiquement.</DemoNotice>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {[{ id: "all", name: "Toute l'équipe", n: all.length }, ...members.map((m) => ({ id: m.id, name: m.name, n: count(m.id) }))].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setWho(f.id)}
            aria-pressed={who === f.id}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-colors",
              who === f.id ? "bg-akua-ink text-akua-white" : "bg-akua-white text-akua-ink ring-1 ring-akua-gray-200 hover:ring-akua-ink",
            )}
          >
            {f.name}
            <span className={cn("rounded-full px-1.5 text-[11.5px] tabular-nums", who === f.id ? "bg-akua-white/15" : "bg-akua-page text-akua-gray-500")}>{f.n}</span>
          </button>
        ))}
      </div>

      <Panel>
        <ActivityFeed entries={entries} members={DEMO_TEAM} />
      </Panel>
    </div>
  );
}

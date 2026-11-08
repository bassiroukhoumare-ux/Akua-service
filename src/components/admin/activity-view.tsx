"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ActivityFeed, MemberAvatar } from "./activity-feed";
import { type PeriodValue, PeriodFilter, periodBounds } from "./period-filter";
import { PageHeader, Panel } from "./ui";
import { useActivity } from "./use-activity";
import { useTeamMembers } from "./use-team-members";

/** Vue du propriétaire : tout ce que font les équipiers, filtrable par personne et par date. */
export function ActivityView() {
  const team = useTeamMembers();
  const [who, setWho] = useState<string>("all");
  const [period, setPeriod] = useState<PeriodValue>({ kind: "preset", id: "mois" });
  const all = useActivity();
  const { from, to } = periodBounds(period);
  const inPeriod = useMemo(() => all.filter((e) => e.at.getTime() >= from && e.at.getTime() < to), [all, from, to]);
  const entries = who === "all" ? inPeriod : inPeriod.filter((e) => e.memberId === who);

  // équipiers enregistrés + anciens auteurs encore présents dans le journal
  const people = useMemo(() => {
    const map = new Map(team.map((m) => [m.id, m.name]));
    for (const e of all) if (!map.has(e.memberId)) map.set(e.memberId, e.memberName ?? "Équipier supprimé");
    return [...map.entries()].map(([id, name]) => ({ id, name, n: inPeriod.filter((e) => e.memberId === id).length }));
  }, [team, all, inPeriod]);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title="Activité de l'équipe" description="Chaque ajout, modification ou suppression faite par un équipier est enregistrée ici, avec son nom, la date et l'heure." actions={<PeriodFilter value={period} onChange={setPeriod} />} />

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {[{ id: "all", name: "Toute l'équipe", n: inPeriod.length }, ...people].map((f) => {
          const on = who === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setWho(f.id)}
              aria-pressed={on}
              className={cn(
                "flex h-11 shrink-0 items-center gap-2 rounded-full pr-3 text-[13.5px] font-semibold transition-all",
                f.id === "all" ? "pl-4" : "pl-1.5",
                on ? "bg-akua-ink text-akua-white shadow-[0_8px_18px_-10px_rgb(11_16_32/0.6)]" : "bg-akua-white text-akua-ink ring-1 ring-akua-gray-200 hover:ring-akua-ink/50",
              )}
            >
              {f.id !== "all" && <MemberAvatar id={f.id} name={f.name} className="size-8 text-[11px]" />}
              {f.name}
              <span className={cn("rounded-full px-1.5 text-[11.5px] tabular-nums", on ? "bg-akua-white/15" : "bg-akua-page text-akua-gray-500")}>{f.n}</span>
            </button>
          );
        })}
      </div>

      <Panel bodyClassName="p-4 md:p-7">
        <ActivityFeed entries={entries} members={people} empty="Aucune action sur cette période. Choisissez d'autres dates ou un autre équipier." />
      </Panel>
    </div>
  );
}

"use client";

import { ArrowRight, History } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ADMIN_MODULES } from "@/config/admin";
import { type ActivityAction, type ActivityEntry, timeAgo } from "@/lib/admin/demo";
import { cn } from "@/lib/utils";
import { ACTION_META, ActivityFeed, MemberAvatar } from "./activity-feed";
import { formatNumber } from "./ui";

const ORDER: ActivityAction[] = ["create", "update", "delete", "publish"];

/** Tableau de bord : qui a fait quoi sur la période, par équipier et en détail. */
export function TeamActivityPanel({ entries, members, href, periodText }: { entries: ActivityEntry[]; members: { id: string; name: string; lastSeen?: string }[]; href: string; periodText: string }) {
  const [who, setWho] = useState("all");

  const people = useMemo(() => {
    const map = new Map<string, { id: string; name: string; n: number; last?: Date; byAction: Partial<Record<ActivityAction, number>>; modules: Set<string>; lastSeen?: string }>();
    for (const m of members) map.set(m.id, { id: m.id, name: m.name, n: 0, byAction: {}, modules: new Set(), lastSeen: m.lastSeen });
    for (const e of entries) {
      const p = map.get(e.memberId) ?? { id: e.memberId, name: e.memberName ?? "Équipier supprimé", n: 0, byAction: {}, modules: new Set<string>() };
      p.n++;
      p.byAction[e.action] = (p.byAction[e.action] ?? 0) + 1;
      p.modules.add(e.module);
      if (!p.last || e.at > p.last) p.last = e.at;
      map.set(e.memberId, p);
    }
    return [...map.values()].sort((a, b) => b.n - a.n || (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0));
  }, [entries, members]);

  const counts = useMemo(() => {
    const c: Partial<Record<ActivityAction, number>> = {};
    for (const e of entries) c[e.action] = (c[e.action] ?? 0) + 1;
    return c;
  }, [entries]);

  const topModule = useMemo(() => {
    const c = new Map<string, number>();
    for (const e of entries) c.set(e.module, (c.get(e.module) ?? 0) + 1);
    const best = [...c.entries()].sort((a, b) => b[1] - a[1])[0];
    return best ? { mod: ADMIN_MODULES.find((m) => m.id === best[0]), n: best[1] } : null;
  }, [entries]);

  const shown = who === "all" ? entries : entries.filter((e) => e.memberId === who);
  const max = Math.max(1, ...people.map((p) => p.n));

  return (
    <section className="overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white">
      <header className="flex flex-col gap-4 border-b border-akua-gray-200 px-5 pt-5 pb-5 md:flex-row md:items-end md:justify-between md:px-7 md:pt-6">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-akua-ink text-akua-white">
            <History aria-hidden className="size-5" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[18px] font-extrabold tracking-[-0.02em]">Activité de l&apos;équipe</h2>
            <p className="mt-0.5 text-[13px] text-akua-gray-500">Qui a fait quoi, quand et sur quel élément · {periodText}</p>
          </div>
        </div>
        <Link href={href} className="inline-flex h-10 items-center gap-1.5 self-start rounded-full bg-akua-page px-4 text-[13px] font-semibold transition-colors hover:bg-akua-ink hover:text-akua-white md:self-auto">
          Journal complet <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </header>

      {/* résumé */}
      <div className="grid grid-cols-2 border-b border-akua-gray-200 md:grid-cols-5">
        <div className="col-span-2 border-b border-akua-gray-200 px-5 py-4 md:col-span-1 md:border-r md:border-b-0 md:px-7">
          <p className="text-[12.5px] font-medium text-akua-gray-500">Actions</p>
          <p className="mt-1 text-[28px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">{formatNumber(entries.length)}</p>
          <p className="mt-1.5 truncate text-[12px] text-akua-gray-500">{topModule?.mod ? `Surtout : ${topModule.mod.label}` : "Aucune sur la période"}</p>
        </div>
        {ORDER.map((a, i) => {
          const m = ACTION_META[a];
          return (
            <div key={a} className={cn("px-5 py-4 md:px-6", i % 2 === 0 && "border-r border-akua-gray-200", i < 2 && "border-b border-akua-gray-200 md:border-b-0", "md:border-r md:last:border-r-0")}>
              <p className="flex items-center gap-2 text-[12.5px] font-medium text-akua-gray-500">
                <span className={cn("grid size-5 place-items-center rounded-full", m.tone)}>
                  <m.icon aria-hidden className="size-2.5" strokeWidth={3} />
                </span>
                {m.label}
              </p>
              <p className="mt-1.5 text-[22px] leading-none font-bold tabular-nums">{counts[a] ?? 0}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* équipiers */}
        <div className="border-b border-akua-gray-200 p-3 lg:border-r lg:border-b-0 lg:p-4">
          <p className="px-2 pt-1 pb-2 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Par équipier</p>
          <ul className="flex flex-col gap-1">
            <li>
              <button
                type="button"
                onClick={() => setWho("all")}
                aria-pressed={who === "all"}
                className={cn("flex w-full items-center gap-3 rounded-[18px] p-2.5 text-left transition-colors", who === "all" ? "bg-akua-ink text-akua-white" : "hover:bg-akua-page")}
              >
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-[12px] font-bold", who === "all" ? "bg-akua-white/15" : "bg-akua-page")}>{people.length}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">Toute l&apos;équipe</span>
                  <span className={cn("block text-[12px]", who === "all" ? "text-akua-white/65" : "text-akua-gray-500")}>
                    {entries.length} action{entries.length > 1 ? "s" : ""}
                  </span>
                </span>
              </button>
            </li>
            {people.map((p) => {
              const on = who === p.id;
              const online = p.lastSeen && Date.now() - Date.parse(p.lastSeen) < 15 * 60_000;
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => setWho(on ? "all" : p.id)} aria-pressed={on} className={cn("flex w-full items-center gap-3 rounded-[18px] p-2.5 text-left transition-colors", on ? "bg-akua-blue-100/70 ring-1 ring-akua-blue/30" : "hover:bg-akua-page")}>
                    <span className="relative">
                      <MemberAvatar id={p.id} name={p.name} />
                      {online && <span aria-label="En ligne" className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-akua-whatsapp ring-2 ring-akua-white" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[14px] font-semibold">{p.name}</span>
                        <span className="shrink-0 text-[13px] font-bold tabular-nums">{p.n}</span>
                      </span>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-akua-page">
                        <span className="flex h-full" style={{ width: `${(p.n / max) * 100}%` }}>
                          {ORDER.map((a) => (p.byAction[a] ? <span key={a} className={cn("h-full", ACTION_META[a].dot)} style={{ width: `${(p.byAction[a]! / p.n) * 100}%` }} /> : null))}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-[11.5px] text-akua-gray-500">{p.last ? `Dernière action ${timeAgo(p.last)}` : p.lastSeen ? `Aucune action · vu ${timeAgo(new Date(p.lastSeen))}` : "Aucune action sur la période"}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* détail */}
        <div className="min-w-0 p-4 md:p-6">
          <div className="max-h-[520px] overflow-y-auto overscroll-contain pr-1">
            <ActivityFeed entries={shown.slice(0, 12)} members={members} empty="Aucune action sur cette période." />
          </div>
          {shown.length > 12 && (
            <Link href={href} className="mt-4 flex h-11 items-center justify-center gap-1.5 rounded-full border border-akua-gray-200 text-[13.5px] font-semibold transition-colors hover:border-akua-ink">
              Voir les {shown.length - 12} autres actions <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

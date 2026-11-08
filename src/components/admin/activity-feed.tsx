import { Pencil, Plus, Reply, Send, Trash2 } from "lucide-react";
import { ADMIN_MODULES } from "@/config/admin";
import { ACTION_LABEL, ACTION_LABEL_YOU, type ActivityAction, type ActivityEntry, dayTitle, formatHour, type TeamMember } from "@/lib/admin/demo";
import { cn } from "@/lib/utils";

const ICON: Record<ActivityAction, { icon: typeof Plus; tone: string }> = {
  create: { icon: Plus, tone: "bg-akua-blue-100 text-akua-blue" },
  update: { icon: Pencil, tone: "bg-akua-page text-akua-ink" },
  delete: { icon: Trash2, tone: "bg-akua-red/10 text-akua-red" },
  publish: { icon: Send, tone: "bg-akua-whatsapp/12 text-[#128c4a]" },
  reply: { icon: Reply, tone: "bg-akua-page text-akua-ink" },
};

/**
 * Journal d'activité, regroupé par jour.
 * `members` fourni : affiche l'auteur (vue du propriétaire) ; sinon « Vous » (vue de l'équipier).
 */
export function ActivityFeed({ entries, members, grouped = true }: { entries: ActivityEntry[]; members?: TeamMember[]; grouped?: boolean }) {
  if (!entries.length) {
    return <p className="py-10 text-center text-[14px] text-akua-gray-500">Aucune activité pour le moment.</p>;
  }
  const sorted = [...entries].sort((a, b) => b.at.getTime() - a.at.getTime());
  const days = grouped
    ? sorted.reduce<{ title: string; items: ActivityEntry[] }[]>((acc, e) => {
        const t = dayTitle(e.at);
        const last = acc[acc.length - 1];
        if (last?.title === t) last.items.push(e);
        else acc.push({ title: t, items: [e] });
        return acc;
      }, [])
    : [{ title: "", items: sorted }];

  return (
    <div className="flex flex-col gap-6">
      {days.map((day) => (
        <section key={day.title || "all"}>
          {day.title && <h3 className="mb-2 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">{day.title}</h3>}
          <ol className="flex flex-col">
            {day.items.map((e, i) => {
              const a = ICON[e.action];
              const who = members?.find((m) => m.id === e.memberId);
              const mod = ADMIN_MODULES.find((m) => m.id === e.module);
              return (
                <li key={e.id} className="relative flex gap-3.5 pb-4 last:pb-0">
                  {i < day.items.length - 1 && <span aria-hidden className="absolute top-10 bottom-0 left-[17px] w-px bg-akua-gray-200" />}
                  <span className={cn("relative grid size-9 shrink-0 place-items-center rounded-full", a.tone)}>
                    <a.icon aria-hidden className="size-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-[14px] leading-snug">
                      <span className="font-semibold">{members ? (who?.name ?? e.memberName ?? "Équipier supprimé") : "Vous"}</span>{" "}
                      <span className="text-akua-gray-500">{members ? ACTION_LABEL[e.action] : ACTION_LABEL_YOU[e.action]}</span> <span className="font-semibold">{e.target}</span>
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-akua-gray-500">
                      <span className="tabular-nums">{formatHour(e.at)}</span>
                      {mod && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-akua-page px-2 py-0.5 font-medium text-akua-ink">
                          <mod.icon aria-hidden className="size-3" strokeWidth={2} /> {mod.label}
                        </span>
                      )}
                      {e.detail && <span>{e.detail}</span>}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

"use client";

import { ArrowRight, ArrowUpRight, Pencil, Plus, Reply, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { ADMIN_MODULES } from "@/config/admin";
import { ACTION_LABEL, ACTION_LABEL_YOU, type ActivityAction, type ActivityEntry, dayTitle, formatHour, timeAgo } from "@/lib/admin/demo";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { useAdminPromos } from "@/store/admin-promos";
import { useAdmin } from "./actor-context";

export const ACTION_META: Record<ActivityAction, { icon: typeof Plus; tone: string; dot: string; label: string }> = {
  create: { icon: Plus, tone: "bg-akua-blue text-akua-white", dot: "bg-akua-blue", label: "Ajouts" },
  update: { icon: Pencil, tone: "bg-akua-ink text-akua-white", dot: "bg-akua-ink", label: "Modifications" },
  delete: { icon: Trash2, tone: "bg-akua-red text-akua-white", dot: "bg-akua-red", label: "Suppressions" },
  publish: { icon: Send, tone: "bg-[#128c4a] text-akua-white", dot: "bg-[#128c4a]", label: "Publications" },
  reply: { icon: Reply, tone: "bg-akua-gray-500 text-akua-white", dot: "bg-akua-gray-500", label: "Réponses" },
};

const AVATAR_TONES = ["bg-akua-blue-100 text-akua-blue", "bg-[#fff2cc] text-[#8a6a00]", "bg-akua-whatsapp/15 text-[#0f7a40]", "bg-[#ffe4e8] text-[#b0182b]", "bg-[#ece8ff] text-[#5530d9]"];

export const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** Pastille avec les initiales, couleur stable pour chaque équipier. */
export function MemberAvatar({ id, name, className }: { id: string; name: string; className?: string }) {
  const n = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-bold tracking-tight", AVATAR_TONES[n % AVATAR_TONES.length], className)}>{initials(name) || "?"}</span>;
}

const PAGE: Partial<Record<string, string>> = { home: "accueil", deals: "offre-speciale", promos: "codes-promo", settings: "parametres", reviews: "avis", carts: "paniers", favorites: "favoris", categories: "categories", products: "produits", stats: "statistiques" };

/** Lien vers l'élément concerné par une action (produit, catégorie, code promo, page de réglages…). */
export function useActivityLink() {
  const { base } = useAdmin();
  const products = useAdminCatalog((s) => s.products);
  const categories = useAdminCatalog((s) => s.categories);
  const codes = useAdminPromos((s) => s.codes);
  return (e: ActivityEntry): { href: string; label: string; gone?: boolean } | null => {
    const page = PAGE[e.module];
    if (!page) return null;
    const list = `${base}/${page}`;
    if (e.module === "products") {
      const p = products.find((x) => x.id === e.targetId) ?? products.find((x) => x.name === e.target);
      return p ? { href: `${base}/produits/${p.id}`, label: "Voir le produit" } : { href: list, label: "Produit supprimé · voir les produits", gone: true };
    }
    if (e.module === "categories") {
      const c = categories.find((x) => x.id === e.targetId) ?? categories.find((x) => x.name === e.target);
      return c ? { href: `${list}#cat-${c.id}`, label: "Voir la catégorie" } : { href: list, label: "Catégorie supprimée · voir les catégories", gone: true };
    }
    if (e.module === "promos" && e.target.startsWith("Code ")) {
      const c = codes.find((x) => x.id === e.targetId) ?? codes.find((x) => `Code ${x.code}` === e.target);
      return c ? { href: `${list}#code-${c.id}`, label: "Voir le code" } : { href: list, label: "Code supprimé · voir les codes", gone: true };
    }
    const labels: Record<string, string> = { home: "Voir l'accueil", deals: "Voir l'offre spéciale", promos: "Voir les codes promo", settings: "Voir les paramètres", reviews: "Voir les avis", carts: "Voir les paniers", favorites: "Voir les favoris" };
    return { href: list, label: labels[e.module] ?? "Ouvrir" };
  };
}

/** « prix : 85 000 F → 70 000 F » devient une comparaison avant / après. */
export function Detail({ text }: { text: string }) {
  const m = text.match(/^(?:([^:]{1,40}) : )?(.+?) → (.+)$/);
  if (!m) return <span className="text-[12.5px] text-akua-gray-500">{text}</span>;
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-[10px] bg-akua-page px-2 py-1 text-[12px]">
      {m[1] && <span className="font-semibold text-akua-gray-500 first-letter:uppercase">{m[1]}</span>}
      <span className="text-akua-gray-500 line-through decoration-akua-gray-500/50">{m[2]}</span>
      <ArrowRight aria-hidden className="size-3 text-akua-gray-500" />
      <span className="font-bold text-akua-ink">{m[3]}</span>
    </span>
  );
}

/**
 * Journal d'activité, regroupé par jour.
 * `members` fourni : affiche l'auteur (vue du propriétaire) ; sinon « Vous » (vue de l'équipier).
 */
export function ActivityFeed({ entries, members, grouped = true, empty }: { entries: ActivityEntry[]; members?: { id: string; name: string }[]; grouped?: boolean; empty?: string }) {
  const linkOf = useActivityLink();
  if (!entries.length) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-akua-page">
          <Pencil aria-hidden className="size-5 text-akua-gray-500" strokeWidth={1.7} />
        </span>
        <p className="mt-3 text-[14.5px] font-semibold">Aucune activité</p>
        <p className="mt-0.5 text-[13px] text-akua-gray-500">{empty ?? "Les actions de l'équipe apparaîtront ici."}</p>
      </div>
    );
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
    <div className="flex flex-col gap-7">
      {days.map((day) => (
        <section key={day.title || "all"}>
          {day.title && (
            <h3 className="mb-3 flex items-center gap-3 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">
              {day.title}
              <span className="h-px flex-1 bg-akua-gray-200" />
              <span className="font-semibold tracking-normal normal-case">
                {day.items.length} action{day.items.length > 1 ? "s" : ""}
              </span>
            </h3>
          )}
          <ol className="flex flex-col">
            {day.items.map((e, i) => {
              const a = ACTION_META[e.action];
              const name = members ? (members.find((m) => m.id === e.memberId)?.name ?? e.memberName ?? "Équipier supprimé") : "Vous";
              const mod = ADMIN_MODULES.find((m) => m.id === e.module);
              const link = linkOf(e);
              return (
                <li key={e.id} className="group relative flex gap-3.5 pb-5 last:pb-0">
                  {i < day.items.length - 1 && <span aria-hidden className="absolute top-12 bottom-1 left-[19px] w-px bg-akua-gray-200" />}
                  <span className="relative h-fit">
                    <MemberAvatar id={e.memberId} name={members ? name : (e.memberName ?? "Vous")} />
                    <span className={cn("absolute -right-1 -bottom-1 grid size-[18px] place-items-center rounded-full ring-2 ring-akua-white", a.tone)}>
                      <a.icon aria-hidden className="size-2.5" strokeWidth={3} />
                    </span>
                  </span>
                  <div className="min-w-0 flex-1 rounded-[18px] px-3 py-2 transition-colors group-hover:bg-akua-page/70 md:-mx-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-[14px] leading-snug">
                        <span className="font-semibold">{name}</span> <span className="text-akua-gray-500">{members ? ACTION_LABEL[e.action] : ACTION_LABEL_YOU[e.action]}</span> {link && !link.gone ? (
                          <Link href={link.href} className="font-semibold break-words underline-offset-4 transition-colors hover:text-akua-blue hover:underline">
                            {e.target}
                          </Link>
                        ) : (
                          <span className="font-semibold break-words">{e.target}</span>
                        )}
                      </p>
                      <time dateTime={e.at.toISOString()} title={timeAgo(e.at)} className="shrink-0 pt-0.5 text-[12px] font-medium text-akua-gray-500 tabular-nums">
                        {formatHour(e.at)}
                      </time>
                    </div>
                    {(mod || e.detail) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {mod && (
                          <span className="inline-flex h-6 items-center gap-1 rounded-full border border-akua-gray-200 bg-akua-white px-2 text-[11.5px] font-semibold text-akua-ink">
                            <mod.icon aria-hidden className="size-3 text-akua-gray-500" strokeWidth={2} /> {mod.label}
                          </span>
                        )}
                        {e.detail && <Detail text={e.detail} />}
                      </div>
                    )}
                    {link && (
                      <Link
                        href={link.href}
                        className={cn(
                          "mt-2 inline-flex h-8 items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold transition-colors",
                          link.gone ? "bg-akua-page text-akua-gray-500 hover:text-akua-ink" : "bg-akua-blue-100 text-akua-blue hover:bg-akua-blue hover:text-akua-white",
                        )}
                      >
                        {link.label} <ArrowUpRight aria-hidden className="size-3.5" />
                      </Link>
                    )}
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

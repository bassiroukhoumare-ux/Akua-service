"use client";

// Codes promo et bannière d'annonce (espace administrateur, étape design).
// Gardés dans ce navigateur en attendant la base de données : le panier de ce même
// navigateur accepte déjà ces codes, et la bannière s'affiche sur le site.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { serverStorage } from "@/lib/server-storage";
import { type PromoCode, promoCodes as seed } from "@/data/promo-codes";
import { formatFCFA } from "@/lib/format";
import { type Actor, type StoredActivity, useAdminCatalog } from "./admin-catalog";

export type AnnouncementTheme = "blue" | "dark" | "gold";
export interface Announcement {
  enabled: boolean;
  /** code promo mis en avant (null : simple message) */
  codeId: string | null;
  message: string;
  theme: AnnouncementTheme;
  /** affiche le temps restant avant la fin du code */
  countdown: boolean;
  /** lien facultatif au clic sur le message */
  link: string;
}

interface AdminPromos {
  codes: PromoCode[];
  announcement: Announcement;
  saveCode: (c: PromoCode, actor: Actor) => void;
  deleteCode: (id: string, actor: Actor) => void;
  toggleCode: (id: string, actor: Actor) => void;
  saveAnnouncement: (a: Announcement, actor: Actor) => void;
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const newPromoId = () => `promo-${uid()}`;

function log(actor: Actor, action: StoredActivity["action"], target: string, detail?: string, targetId?: string) {
  if (actor.kind !== "team") return;
  const e: StoredActivity = { id: uid(), memberId: actor.id, memberName: actor.name, action, module: "promos", target, targetId, detail, at: new Date().toISOString() };
  useAdminCatalog.setState((s) => ({ activity: [e, ...s.activity] }));
}

/** Libellé lisible d'un code : « -20 % sur votre commande », « -5 000 F dès 50 000 F d'achat ». */
export function promoLabel(p: Pick<PromoCode, "type" | "value" | "minTotal">) {
  const off = p.type === "percent" ? `-${p.value} %` : `-${formatFCFA(p.value)}`;
  return p.minTotal ? `${off} dès ${formatFCFA(p.minTotal)} d'achat` : `${off} sur votre commande`;
}

export type PromoStatus = "active" | "scheduled" | "expired" | "disabled";
export function promoStatus(p: PromoCode, now = Date.now()): PromoStatus {
  if (p.active === false) return "disabled";
  if (p.startsAt && new Date(p.startsAt).getTime() > now) return "scheduled";
  if (p.endsAt && new Date(p.endsAt).getTime() <= now) return "expired";
  return "active";
}

const initialCodes: PromoCode[] = seed.map((p, i) => ({ ...p, id: `promo-seed-${i}`, active: true }));

export const useAdminPromos = create<AdminPromos>()(
  persist(
    (set, get) => ({
      codes: initialCodes,
      announcement: { enabled: false, codeId: initialCodes[0]?.id ?? null, message: "Utilisez le code {CODE} et profitez de {REMISE}", theme: "blue", countdown: true, link: "/boutique" },
      saveCode: (c, actor) => {
        const exists = get().codes.some((x) => x.id === c.id);
        set((s) => ({ codes: exists ? s.codes.map((x) => (x.id === c.id ? c : x)) : [c, ...s.codes] }));
        log(actor, exists ? "update" : "create", `Code ${c.code}`, promoLabel(c), c.id);
      },
      deleteCode: (id, actor) => {
        const c = get().codes.find((x) => x.id === id);
        set((s) => ({
          codes: s.codes.filter((x) => x.id !== id),
          // la bannière liée à ce code redevient un simple message
          announcement: s.announcement.codeId === id ? { ...s.announcement, codeId: null, enabled: false } : s.announcement,
        }));
        if (c) log(actor, "delete", `Code ${c.code}`, undefined, c.id);
      },
      toggleCode: (id, actor) => {
        const c = get().codes.find((x) => x.id === id);
        set((s) => ({ codes: s.codes.map((x) => (x.id === id ? { ...x, active: x.active === false } : x)) }));
        if (c) log(actor, "update", `Code ${c.code}`, c.active === false ? "activé" : "désactivé", c.id);
      },
      saveAnnouncement: (a, actor) => {
        set({ announcement: a });
        log(actor, a.enabled ? "publish" : "update", "Bannière d'annonce", a.enabled ? "affichée" : "masquée");
      },
    }),
    { name: "akua-admin-promos", version: 1, storage: serverStorage },
  ),
);

/** Remplace {CODE} et {REMISE} dans le message de la bannière. */
export function fillMessage(message: string, code?: PromoCode | null) {
  return message.replaceAll("{CODE}", code?.code ?? "").replaceAll("{REMISE}", code ? promoLabel(code).replace(" sur votre commande", "").replace(/^-/, "-") : "");
}

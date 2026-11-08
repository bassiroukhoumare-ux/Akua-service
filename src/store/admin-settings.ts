"use client";

// Paramètres de la boutique (espace administrateur, étape design).
// Gardés dans ce navigateur en attendant la base de données.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADDRESS, DELIVERY_COUNTRIES, FACEBOOK_URL, MAPS_URL, SHOP_COORDS, SITE_NAME, SITE_TAGLINE, TIKTOK_URL, WHATSAPP_DISPLAY } from "@/config/site";
import { type Actor, type StoredActivity, useAdminCatalog } from "./admin-catalog";

export type SocialNetwork = "facebook" | "instagram" | "tiktok" | "youtube" | "x" | "snapchat" | "linkedin" | "telegram" | "other";
export interface SocialLink {
  id: string;
  network: SocialNetwork;
  /** nom affiché (obligatoire pour « Autre ») */
  label: string;
  url: string;
}

export interface DayHours {
  /** 0 = dimanche … 6 = samedi (comme Date.getDay) */
  day: number;
  open: boolean;
  from: string;
  to: string;
}

export interface ShopSettings {
  name: string;
  tagline: string;
  address: string;
  email: string;
  whatsapp: string;
  mapsLink: string;
  lat: number;
  lng: number;
  hours: DayHours[];
  socials: SocialLink[];
  delivery: { code: string; name: string; enabled: boolean }[];
  /** ajoute « et autres pays » après la liste */
  deliveryOthers: boolean;
}

export const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
/** ordre d'affichage : lundi → dimanche */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const initialSettings: ShopSettings = {
  name: SITE_NAME,
  tagline: SITE_TAGLINE,
  address: ADDRESS,
  email: "",
  whatsapp: WHATSAPP_DISPLAY,
  mapsLink: MAPS_URL,
  lat: SHOP_COORDS.lat,
  lng: SHOP_COORDS.lng,
  hours: WEEK_ORDER.map((day) => ({ day, open: day !== 0, from: "10:00", to: "20:00" })),
  socials: [
    { id: "so-facebook", network: "facebook", label: "Facebook", url: FACEBOOK_URL },
    { id: "so-tiktok", network: "tiktok", label: "TikTok", url: TIKTOK_URL },
    { id: "so-instagram", network: "instagram", label: "Instagram", url: "" },
  ],
  delivery: DELIVERY_COUNTRIES.map((c) => ({ code: c.code, name: c.name, enabled: true })),
  deliveryOthers: true,
};

interface AdminSettings {
  settings: ShopSettings;
  save: (s: ShopSettings, actor: Actor, detail?: string) => void;
}

export const useAdminSettings = create<AdminSettings>()(
  persist(
    (set) => ({
      settings: initialSettings,
      save: (settings, actor, detail) => {
        set({ settings });
        if (actor.kind === "team") {
          const e: StoredActivity = { id: `${Date.now().toString(36)}`, memberId: actor.id, memberName: actor.name, action: "update", module: "settings", target: "Paramètres de la boutique", detail, at: new Date().toISOString() };
          useAdminCatalog.setState((s) => ({ activity: [e, ...s.activity] }));
        }
      },
    }),
    { name: "akua-admin-settings", version: 1 },
  ),
);

/* ----------------------------------------------------------------- outils */

const hh = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
};

/** Regroupe les jours consécutifs identiques : « Lundi – Samedi : 10h – 20h », « Dimanche : Fermé ». */
export function summarizeHours(hours: DayHours[]) {
  const ordered = WEEK_ORDER.map((d) => hours.find((h) => h.day === d)!).filter(Boolean);
  const key = (h: DayHours) => (h.open ? `${h.from}-${h.to}` : "closed");
  const groups: { days: string; hours: string }[] = [];
  let start = 0;
  for (let i = 1; i <= ordered.length; i++) {
    if (i === ordered.length || key(ordered[i]) !== key(ordered[start])) {
      const a = DAY_NAMES[ordered[start].day];
      const b = DAY_NAMES[ordered[i - 1].day];
      groups.push({ days: start === i - 1 ? a : `${a} – ${b}`, hours: ordered[start].open ? `${hh(ordered[start].from)} – ${hh(ordered[start].to)}` : "Fermé" });
      start = i;
    }
  }
  return groups;
}

/** La boutique est-elle ouverte à cet instant (heure de l'appareil) ? */
export function isOpenNow(hours: DayHours[], d = new Date()) {
  const h = hours.find((x) => x.day === d.getDay());
  if (!h?.open) return false;
  const now = d.getHours() * 60 + d.getMinutes();
  const [fh, fm] = h.from.split(":").map(Number);
  const [th, tm] = h.to.split(":").map(Number);
  return now >= fh * 60 + fm && now < th * 60 + tm;
}

/** Extrait la position d'un lien Google Maps complet (ou de coordonnées collées telles quelles). */
export function coordsFromText(text: string): { lat: number; lng: number } | null {
  const t = decodeURIComponent(text);
  const pats = [/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&](?:q|query|ll|destination|center)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/, /^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/];
  for (const p of pats) {
    const m = t.match(p);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

export const mapsEmbedUrl = (lat: number, lng: number) => `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${lat},${lng}!6i15!3m1!1sfr!5m1!1sfr`;
export const mapsDirectionsUrl = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

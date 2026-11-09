"use client";

// Accueil et offre spéciale (espace administrateur, étape design).
// Comme le catalogue, ces réglages sont gardés dans ce navigateur en attendant la base de données.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { serverStorage } from "@/lib/server-storage";
import { dealEnd } from "@/lib/deals";
import { HOME_BANNER, HOME_VISUAL } from "@/config/home-visual";
import { PROMO_VIDEO_CARDS } from "@/config/promo-video";
import { products } from "@/data/products";
import type { ActivityAction } from "@/lib/admin/demo";
import type { AdminModuleId } from "@/config/admin";
import { type Actor, type StoredActivity, useAdminCatalog } from "./admin-catalog";

/** Emplacements d'image de l'accueil et leur format imposé. */
export type SlotId = "poster" | "banner";
export const SLOTS: Record<SlotId, { label: string; ratio: number; ratioLabel: string; width: number; height: number; hint: string }> = {
  poster: { label: "Affiche portrait", ratio: 4 / 5, ratioLabel: "4:5", width: 1200, height: 1500, hint: "À droite des catégories sur ordinateur, sous la bannière sur mobile." },
  banner: { label: "Bannière horizontale", ratio: 3, ratioLabel: "3:1", width: 1500, height: 500, hint: "Sous les catégories sur ordinateur, en haut de l'accueil sur mobile." },
};

export type LinkKind = "category" | "product" | "page" | "url" | "none";
export interface Slide {
  id: string;
  image: string;
  alt: string;
  linkKind: LinkKind;
  /** slug de catégorie, slug de produit, chemin de page ou adresse complète */
  link: string;
  active: boolean;
}

export type HomeSectionId = "platforms" | "deals" | "catalogue" | "packs" | "faq";
export interface HomeSection {
  id: HomeSectionId;
  visible: boolean;
  eyebrow?: string;
  title?: string;
}

export type DealMode = "midnight" | "duration";
export interface DealsConfig {
  enabled: boolean;
  /** « midnight » : se termine chaque soir à minuit ; « duration » : durée choisie à partir du lancement */
  mode: DealMode;
  hours: number;
  startedAt: string;
  /** relancer automatiquement une nouvelle période à la fin */
  repeat: boolean;
  title: string;
  highlight: string;
  text: string;
  productIds: string[];
  /** deux cartes vidéo : gauche et droite, chacune avec une ou plusieurs vidéos qui s'enchaînent */
  videos: [string[], string[]];
}

export const MAX_DEAL_PRODUCTS = 4;

interface AdminHome {
  slides: Record<SlotId, Slide[]>;
  sections: HomeSection[];
  deals: DealsConfig;
  saveSlide: (slot: SlotId, s: Slide, actor: Actor) => void;
  deleteSlide: (slot: SlotId, id: string, actor: Actor) => void;
  moveSlide: (slot: SlotId, id: string, dir: -1 | 1) => void;
  toggleSlide: (slot: SlotId, id: string, actor: Actor) => void;
  updateSection: (id: HomeSectionId, patch: Partial<HomeSection>, actor: Actor) => void;
  updateDeals: (patch: Partial<DealsConfig>, actor: Actor, detail?: string) => void;
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const newSlideId = () => `s-${uid()}`;

/** journal partagé avec le catalogue (une seule page « Activité de l'équipe ») */
function log(actor: Actor, action: ActivityAction, module: AdminModuleId, target: string, detail?: string) {
  if (actor.kind !== "team") return;
  const entry: StoredActivity = { id: uid(), memberId: actor.id, memberName: actor.name, action, module, target, detail, at: new Date().toISOString() };
  useAdminCatalog.setState((s) => ({ activity: [entry, ...s.activity] }));
}

const initialDeals: DealsConfig = {
  enabled: true,
  mode: "midnight",
  hours: 24,
  startedAt: new Date().toISOString(),
  repeat: true,
  title: "Offre spéciale",
  highlight: "jusqu'à minuit",
  text: "Promotions exclusives, en quantité limitée. Les prix reviennent à la normale à la fin du compte à rebours.",
  productIds: products
    .filter((p) => p.isDealOfDay && p.compareAtPrice)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_DEAL_PRODUCTS)
    .map((p) => p.id),
  videos: [PROMO_VIDEO_CARDS[0], PROMO_VIDEO_CARDS[1]],
};

export const HOME_SECTION_META: Record<HomeSectionId, { label: string; description: string; editable?: boolean }> = {
  platforms: { label: "Bandeau des plateformes", description: "Logos PS5, PS4, Switch, Xbox… qui défilent sous les catégories." },
  deals: { label: "Offre spéciale", description: "Compte à rebours, produits en promo et vidéos TikTok." },
  catalogue: { label: "Nos produits disponibles", description: "Le catalogue avec ses onglets (Consoles, Manettes, Jeux…).", editable: true },
  packs: { label: "Packs prêts à jouer", description: "Les consoles complètes, le plus vendu mis en avant.", editable: true },
  faq: { label: "Questions fréquentes et contact", description: "Les questions fréquentes et le bloc « Écrivez-nous ».", editable: true },
};

const initialSections: HomeSection[] = [
  { id: "platforms", visible: true },
  { id: "deals", visible: true },
  { id: "catalogue", visible: true, eyebrow: "Catalogue", title: "Nos produits disponibles." },
  { id: "packs", visible: true, eyebrow: "Consoles complètes", title: "Packs prêts à jouer" },
  { id: "faq", visible: true, eyebrow: "Questions fréquentes", title: "On vous répond." },
];

const initialSlides: Record<SlotId, Slide[]> = {
  poster: [{ id: "s-poster-1", image: HOME_VISUAL.src, alt: HOME_VISUAL.alt, linkKind: "category", link: "consoles", active: true }],
  banner: [{ id: "s-banner-1", image: HOME_BANNER.src, alt: HOME_BANNER.alt, linkKind: "page", link: "/boutique", active: true }],
};

const slotName = (slot: SlotId) => (slot === "poster" ? "Affiche portrait" : "Bannière horizontale");

export const useAdminHome = create<AdminHome>()(
  persist(
    (set, get) => ({
      slides: initialSlides,
      sections: initialSections,
      deals: initialDeals,
      saveSlide: (slot, s, actor) => {
        const exists = get().slides[slot].some((x) => x.id === s.id);
        set((st) => ({ slides: { ...st.slides, [slot]: exists ? st.slides[slot].map((x) => (x.id === s.id ? s : x)) : [...st.slides[slot], s] } }));
        log(actor, exists ? "update" : "create", "home", slotName(slot), s.alt || undefined);
      },
      deleteSlide: (slot, id, actor) => {
        set((st) => ({ slides: { ...st.slides, [slot]: st.slides[slot].filter((x) => x.id !== id) } }));
        log(actor, "delete", "home", slotName(slot));
      },
      moveSlide: (slot, id, dir) => {
        const list = [...get().slides[slot]];
        const i = list.findIndex((x) => x.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        set((st) => ({ slides: { ...st.slides, [slot]: list } }));
      },
      toggleSlide: (slot, id, actor) => {
        const s = get().slides[slot].find((x) => x.id === id);
        set((st) => ({ slides: { ...st.slides, [slot]: st.slides[slot].map((x) => (x.id === id ? { ...x, active: !x.active } : x)) } }));
        if (s) log(actor, "update", "home", slotName(slot), s.active ? "désactivée" : "activée");
      },
      updateSection: (id, patch, actor) => {
        set((st) => ({ sections: st.sections.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
        const detail = patch.visible === undefined ? "textes modifiés" : patch.visible ? "affichée" : "masquée";
        log(actor, "update", "home", `Section « ${HOME_SECTION_META[id].label} »`, detail);
      },
      updateDeals: (patch, actor, detail) => {
        set((st) => ({ deals: { ...st.deals, ...patch } }));
        log(actor, "update", "deals", "Offre spéciale", detail);
      },
    }),
    { name: "akua-admin-home", version: 1, storage: serverStorage },
  ),
);

/* --------------------------------------------------------- compte à rebours */

/** Date de fin de l'offre en cours (gère « minuit » et la relance automatique). */
export { dealEnd };

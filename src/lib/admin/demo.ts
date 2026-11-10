// Données de DÉMONSTRATION de l'espace administrateur (étape design).
// Elles seront remplacées par les vraies données une fois la base de données branchée.
import type { AdminModuleId } from "@/config/admin";
import { products } from "@/data/products";
import type { SavedCart } from "@/store/saved-carts";
import type { Review } from "@/types/catalog";

/** générateur pseudo-aléatoire déterministe : mêmes chiffres à chaque affichage */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export type Period = "7j" | "30j" | "12m";

export interface VisitPoint {
  label: string;
  /** libellé complet pour l'infobulle */
  full: string;
  visitors: number;
}

const DAY = 864e5;
const fmtDay = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const fmtFull = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const fmtMonth = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const fmtMonthFull = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export function demoVisits(period: Period, now = new Date()): VisitPoint[] {
  const r = rng(period === "12m" ? 7 : 42);
  if (period === "12m") {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return { label: fmtMonth.format(d).replace(".", ""), full: fmtMonthFull.format(d), visitors: Math.round(2400 + i * 260 + r() * 900) };
    });
  }
  const n = period === "7j" ? 7 : 30;
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getTime() - (n - 1 - i) * DAY);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    return { label: fmtDay.format(d).replace(".", ""), full: fmtFull.format(d), visitors: Math.round(110 + i * 2.2 + r() * 70 + (weekend ? 45 : 0)) };
  });
}

export const DEMO_KPIS: Record<Period, { visitors: number; pageviews: number; orders: number; carts: number; delta: { visitors: number; pageviews: number; orders: number; carts: number } }> = {
  "7j": { visitors: 1184, pageviews: 4630, orders: 38, carts: 9, delta: { visitors: 12, pageviews: 9, orders: 18, carts: -3 } },
  "30j": { visitors: 4912, pageviews: 19240, orders: 151, carts: 34, delta: { visitors: 8, pageviews: 6, orders: 11, carts: 4 } },
  "12m": { visitors: 46380, pageviews: 182900, orders: 1420, carts: 312, delta: { visitors: 64, pageviews: 58, orders: 47, carts: 21 } },
};

export const DEMO_COUNTRIES = [
  { code: "TG", name: "Togo", share: 58 },
  { code: "BJ", name: "Bénin", share: 14 },
  { code: "CI", name: "Côte d'Ivoire", share: 9 },
  { code: "GH", name: "Ghana", share: 7 },
  { code: "BF", name: "Burkina Faso", share: 5 },
  { code: "", name: "Autres pays", share: 7 },
];

export const DEMO_SOURCES = [
  { id: "whatsapp", name: "WhatsApp", share: 34 },
  { id: "tiktok", name: "TikTok", share: 27 },
  { id: "google", name: "Google", share: 18 },
  { id: "facebook", name: "Facebook", share: 12 },
  { id: "direct", name: "Accès direct", share: 9 },
];

export const DEMO_TOP_FAVORITES = products.slice(0, 5).map((p, i) => ({ product: p, count: [64, 51, 38, 29, 22][i] }));

const ago = (min: number) => new Date(Date.now() - min * 60_000);

export const DEMO_REVIEWS = [
  { id: "r1", name: "Kossi Mensah", country: "Togo", rating: 5, product: products[0], comment: "Console en parfait état, livrée rapidement à Lomé. Je recommande.", at: ago(42) },
  { id: "r2", name: "Aïcha Diallo", country: "Bénin", rating: 4, product: products[3], comment: "Très bonne manette, emballage soigné. Livraison à Cotonou en 2 jours.", at: ago(60 * 5) },
  { id: "r3", name: "Yao Koffi", country: "Côte d'Ivoire", rating: 5, product: products[2], comment: "Service sérieux, réponse rapide sur WhatsApp.", at: ago(60 * 26) },
];

export const DEMO_CARTS = [
  { id: "c1", name: "Edem Agbeko", phone: "+228 90 12 34 56", items: 2, total: 215000, at: ago(18) },
  { id: "c2", name: "Fatou Sow", phone: "+221 77 456 78 90", items: 1, total: 45000, at: ago(60 * 3) },
  { id: "c3", name: "Komla Adjo", phone: "+228 92 45 67 89", items: 3, total: 98000, at: ago(60 * 20) },
];

/* ------------------------------------------------------------------ équipe */

export type MemberStatus = "active" | "pending" | "disabled";

export interface TeamMember {
  id: string;
  name: string;
  /** identifiant de connexion : numéro WhatsApp ou nom d'utilisateur */
  identifier: string;
  owner?: boolean;
  modules: AdminModuleId[];
  status: MemberStatus;
  lastSeen?: Date;
  createdAt: Date;
}

export const DEMO_TEAM: TeamMember[] = [
  { id: "m0", name: "Propriétaire AKUA Service", identifier: "Connexion par mot de passe seul", owner: true, modules: [], status: "active", lastSeen: ago(1), createdAt: ago(60 * 24 * 90) },
  { id: "m1", name: "Afi Lawson", identifier: "+228 91 23 45 67", modules: ["products", "categories", "deals"], status: "active", lastSeen: ago(60 * 2), createdAt: ago(60 * 24 * 30) },
  { id: "m2", name: "Kodjo Amegah", identifier: "+228 99 87 65 43", modules: ["reviews", "carts", "favorites"], status: "pending", createdAt: ago(60 * 24 * 2) },
];

/** mot de passe provisoire lisible (sans caractères ambigus) */
export function tempPassword() {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const buf = new Uint32Array(10);
  crypto.getRandomValues(buf);
  const s = Array.from(buf, (n) => abc[n % abc.length]).join("");
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}

export function timeAgo(d: Date) {
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  return j === 1 ? "hier" : `il y a ${j} jours`;
}

/* -------------------------------------------------------- activité équipe */

export type ActivityAction = "create" | "update" | "delete" | "publish" | "reply";

export interface ActivityEntry {
  id: string;
  /** identifiant de l'élément concerné (produit, catégorie, code promo…), pour y accéder en un clic */
  targetId?: string;
  memberId: string;
  action: ActivityAction;
  module: AdminModuleId;
  /** élément concerné (produit, catégorie, code promo…) */
  target: string;
  /** précision : « prix : 85 000 F → 70 000 F » */
  detail?: string;
  at: Date;
  /** nom enregistré au moment de l'action (si l'équipier a été supprimé depuis) */
  memberName?: string;
}

export const DEMO_ACTIVITY: ActivityEntry[] = [
  { id: "a1", memberId: "m1", action: "create", module: "products", target: "Manette PS5 DualSense Midnight Black", detail: "4 photos · 52 000 F", at: ago(25) },
  { id: "a2", memberId: "m1", action: "update", module: "products", target: "Xbox 360 complète", detail: "prix : 85 000 F → 70 000 F", at: ago(70) },
  { id: "a3", memberId: "m1", action: "update", module: "deals", target: "Offre spéciale", detail: "PS3 Slim complète ajoutée", at: ago(60 * 3) },
  { id: "a4", memberId: "m1", action: "create", module: "categories", target: "Accessoires PC", detail: "icône : clavier", at: ago(60 * 26) },
  { id: "a5", memberId: "m1", action: "delete", module: "products", target: "Câble HDMI 1 m", at: ago(60 * 30) },
  { id: "a6", memberId: "m1", action: "update", module: "products", target: "PS4 Slim Complète", detail: "stock : 2 → 5", at: ago(60 * 50) },
];

/** formulation pour l'équipier lui-même : « Vous avez ajouté… » */
export const ACTION_LABEL_YOU: Record<ActivityAction, string> = {
  create: "avez ajouté",
  update: "avez modifié",
  delete: "avez supprimé",
  publish: "avez publié",
  reply: "avez répondu à",
};

export const ACTION_LABEL: Record<ActivityAction, string> = {
  create: "a ajouté",
  update: "a modifié",
  delete: "a supprimé",
  publish: "a publié",
  reply: "a répondu à",
};

const fmtDayTitle = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const fmtHour = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
export const formatHour = (d: Date) => fmtHour.format(d);

/** « Aujourd'hui », « Hier » ou « lundi 3 novembre » */
export function dayTitle(d: Date) {
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 864e5);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  const t = fmtDayTitle.format(d);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* --------------------------------------- avis et paniers (format complet) */


const iso = (min: number) => ago(min).toISOString();
const item = (i: number, quantity = 1) => {
  const p = products[i];
  return { productId: p.id, slug: p.slug, name: p.name, price: p.price, categoryId: p.categoryId, image: p.images[0], quantity };
};

export const DEMO_REVIEW_ITEMS: Review[] = [
  { id: "demo-r1", productId: products[0].id, firstName: "Kossi", lastName: "Mensah", country: "Togo", email: "kossi.mensah@exemple.com", rating: 5, comment: "Console en parfait état, livrée rapidement à Lomé. Les 10 jeux étaient bien installés. Je recommande AKUA Service.", createdAt: iso(42), status: "publie" },
  { id: "demo-r2", productId: products[3].id, firstName: "Aïcha", lastName: "Diallo", country: "Bénin", email: "aicha.d@exemple.com", rating: 4, comment: "Très bonne manette, emballage soigné. Livraison à Cotonou en 2 jours.", createdAt: iso(60 * 5), status: "publie" },
  { id: "demo-r3", productId: products[2].id, firstName: "Yao", lastName: "Koffi", country: "Côte d'Ivoire", email: "yao.koffi@exemple.com", rating: 5, comment: "Service sérieux, réponse rapide sur WhatsApp.", createdAt: iso(60 * 26), status: "publie" },
  { id: "demo-r4", productId: products[5].id, firstName: "Mawuli", lastName: "Agbo", country: "Togo", email: "mawuli@exemple.com", rating: 2, comment: "Le produit est bien mais j'ai attendu plus longtemps que prévu pour le retrait.", createdAt: iso(60 * 50), status: "masque" },
];

export const DEMO_SAVED_CARTS: SavedCart[] = [
  { id: "demo-c1", name: "Edem Agbeko", phone: "+228 90 12 34 56", email: "edem@exemple.com", country: "Togo", city: "Lomé", items: [item(0), item(3)], subtotal: products[0].price + products[3].price, status: "pending", savedAt: iso(18), updatedAt: iso(18) },
  { id: "demo-c2", name: "Fatou Sow", phone: "+221 77 456 78 90", country: "Sénégal", items: [item(3)], subtotal: products[3].price, status: "contacted", savedAt: iso(60 * 3), updatedAt: iso(60), contactedAt: iso(60), contactedBy: "Afi Lawson" },
  { id: "demo-c3", name: "Komla Adjo", phone: "+228 92 45 67 89", country: "Togo", city: "Kpalimé", items: [item(5, 2), item(7)], subtotal: products[5].price * 2 + products[7].price, status: "ordered", savedAt: iso(60 * 20), updatedAt: iso(60 * 19), orderedAt: iso(60 * 19) },
];

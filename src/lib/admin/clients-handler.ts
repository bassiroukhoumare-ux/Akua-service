import { NextResponse } from "next/server";
import type { PortalKind } from "@/config/admin-base";
import { deleteCart, deleteOrder, deleteReview, favoriteCounts, listCarts, listOrders, listReviews, type OrderStatus, pendingOrders, promoUsage, setCartStatus, setOrderStatus, setReviewStatus } from "@/lib/customers";
import { can } from "@/config/permissions";
import { portalMember } from "./portal-user";

// Espace admin : avis, paniers et favoris des clients (lecture, modération, suivi).
const deny = () => NextResponse.json({ error: "Accès refusé" }, { status: 403 });
const NS = { headers: { "Cache-Control": "no-store" } };

// module et droit nécessaires pour chaque lecture
const VIEW: Record<string, "reviews" | "carts" | "favorites" | "promos" | "orders"> = { avis: "reviews", paniers: "carts", favoris: "favorites", promos: "promos", "commandes-attente": "orders" };

export async function clientsGet(kind: PortalKind, what: string, req?: Request) {
  const me = await portalMember(kind);
  const code = new URL(req?.url ?? "http://x").searchParams.get("code") ?? undefined;
  // les commandes : module Commandes, ou Codes promo pour la liste d'un code
  const need = what === "commandes" ? (code ? "promos" : "orders") : VIEW[what];
  if (!me || (need && !can(me.perms, need))) return deny();
  if (what === "commandes-attente") return NextResponse.json({ pending: await pendingOrders() }, NS);
  if (what === "avis") return NextResponse.json(await listReviews(true), NS);
  if (what === "paniers") return NextResponse.json(await listCarts(), NS);
  if (what === "favoris") return NextResponse.json(await favoriteCounts(), NS);
  if (what === "promos") return NextResponse.json(await promoUsage(), NS);
  if (what === "commandes") return NextResponse.json(await listOrders(code), NS);
  return NextResponse.json({ error: "Inconnu" }, { status: 404 });
}

export async function clientsPatch(kind: PortalKind, what: string, req: Request) {
  const me = await portalMember(kind);
  if (!me || (what === "avis" && !can(me.perms, "reviews", "moderate")) || (what === "paniers" && !can(me.perms, "carts", "manage")) || (what === "commandes" && !can(me.perms, "orders", "manage"))) return deny();
  const who = me.name;
  const b = (await req.json().catch(() => ({}))) as { id?: string; status?: string; stockDeducted?: boolean };
  if (!b.id) return NextResponse.json({ error: "Élément manquant" }, { status: 400 });
  if (what === "avis" && (b.status === "publie" || b.status === "masque")) await setReviewStatus(b.id, b.status);
  else if (what === "paniers" && ["pending", "contacted", "ordered", "lost"].includes(b.status ?? "")) await setCartStatus(b.id, b.status as "pending", who);
  else if (what === "commandes" && ["pending", "sold", "unsold"].includes(b.status ?? "")) await setOrderStatus(b.id, b.status as OrderStatus, who, typeof b.stockDeducted === "boolean" ? b.stockDeducted : undefined);
  else return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function clientsDelete(kind: PortalKind, what: string, req: Request) {
  const me = await portalMember(kind);
  if (!me || (what === "avis" && !can(me.perms, "reviews", "delete")) || (what === "paniers" && !can(me.perms, "carts", "delete")) || (what === "commandes" && !can(me.perms, "orders", "delete"))) return deny();
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (what === "avis") await deleteReview(id);
  else if (what === "paniers") await deleteCart(id);
  else if (what === "commandes") await deleteOrder(id);
  else return NextResponse.json({ error: "Inconnu" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

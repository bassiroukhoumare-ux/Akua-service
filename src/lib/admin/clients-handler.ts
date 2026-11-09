import { NextResponse } from "next/server";
import type { PortalKind } from "@/config/admin-base";
import { deleteCart, deleteReview, favoriteCounts, listCarts, listReviews, setCartStatus, setReviewStatus } from "@/lib/customers";
import { portalUser } from "./portal-user";

// Espace admin : avis, paniers et favoris des clients (lecture, modération, suivi).
const deny = () => NextResponse.json({ error: "Accès refusé" }, { status: 403 });
const NS = { headers: { "Cache-Control": "no-store" } };

export async function clientsGet(kind: PortalKind, what: string) {
  if (!(await portalUser(kind))) return deny();
  if (what === "avis") return NextResponse.json(await listReviews(true), NS);
  if (what === "paniers") return NextResponse.json(await listCarts(), NS);
  if (what === "favoris") return NextResponse.json(await favoriteCounts(), NS);
  return NextResponse.json({ error: "Inconnu" }, { status: 404 });
}

export async function clientsPatch(kind: PortalKind, what: string, req: Request) {
  const who = await portalUser(kind);
  if (!who) return deny();
  const b = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!b.id) return NextResponse.json({ error: "Élément manquant" }, { status: 400 });
  if (what === "avis" && (b.status === "publie" || b.status === "masque")) await setReviewStatus(b.id, b.status);
  else if (what === "paniers" && ["pending", "contacted", "ordered", "lost"].includes(b.status ?? "")) await setCartStatus(b.id, b.status as "pending", who);
  else return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function clientsDelete(kind: PortalKind, what: string, req: Request) {
  if (!(await portalUser(kind))) return deny();
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (what === "avis") await deleteReview(id);
  else if (what === "paniers") await deleteCart(id);
  else return NextResponse.json({ error: "Inconnu" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

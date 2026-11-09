// Données laissées par les clients (avis, paniers enregistrés, favoris), dans la base Neon.
import { db } from "@/lib/db";
import type { SavedCart, SavedCartStatus } from "@/store/saved-carts";
import type { Review } from "@/types/catalog";

const digits = (s: string) => s.replace(/\D/g, "");
const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ------------------------------------------------------------------ avis */

export async function listReviews(all: boolean): Promise<Review[]> {
  const rows = (all ? await db()`select data from reviews order by created_at desc` : await db()`select data from reviews where status = 'publie' order by created_at desc`) as { data: Review }[];
  // l'e-mail n'est jamais envoyé au site public
  return rows.map((r) => (all ? r.data : { ...r.data, email: "" }));
}

export async function addReview(r: Omit<Review, "id" | "createdAt" | "status">): Promise<Review> {
  const review: Review = { ...r, id: uid("rev"), createdAt: new Date().toISOString(), status: "publie" };
  await db()`insert into reviews (id, product_id, status, data, created_at) values (${review.id}, ${review.productId}, ${review.status}, ${JSON.stringify(review)}, ${review.createdAt})`;
  return review;
}

export async function setReviewStatus(id: string, status: Review["status"]) {
  await db()`update reviews set status = ${status}, data = jsonb_set(data, '{status}', to_jsonb(${status}::text)) where id = ${id}`;
}

export async function deleteReview(id: string) {
  await db()`delete from reviews where id = ${id}`;
}

/* --------------------------------------------------------- paniers enregistrés */

export async function listCarts(): Promise<SavedCart[]> {
  return ((await db()`select data from saved_carts order by updated_at desc`) as { data: SavedCart }[]).map((r) => r.data);
}

/** Enregistre (ou met à jour, même numéro) le panier d'un client. */
export async function saveCart(c: Omit<SavedCart, "id" | "status" | "savedAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const d = digits(c.phone);
  const rows = (await db()`select data from saved_carts where phone_digits = ${d} and status <> 'ordered' order by updated_at desc limit 1`) as { data: SavedCart }[];
  const cart: SavedCart = rows[0] ? { ...rows[0].data, ...c, status: "pending", updatedAt: now } : { ...c, id: uid("cart"), status: "pending", savedAt: now, updatedAt: now };
  await db()`insert into saved_carts (id, phone_digits, status, data, saved_at, updated_at) values (${cart.id}, ${d}, ${cart.status}, ${JSON.stringify(cart)}, ${cart.savedAt}, ${now})
    on conflict (id) do update set status = excluded.status, data = excluded.data, updated_at = excluded.updated_at`;
}

/** Commande envoyée sur WhatsApp : le panier enregistré passe à « Commandé ». */
export async function markCartOrdered(phone: string) {
  const now = new Date().toISOString();
  const rows = (await db()`select data from saved_carts where phone_digits = ${digits(phone)} and status <> 'ordered'`) as { data: SavedCart }[];
  for (const { data } of rows) {
    const c: SavedCart = { ...data, status: "ordered", orderedAt: now, updatedAt: now };
    await db()`update saved_carts set status = 'ordered', data = ${JSON.stringify(c)}, updated_at = ${now} where id = ${c.id}`;
  }
}

export async function setCartStatus(id: string, status: SavedCartStatus, by?: string) {
  const now = new Date().toISOString();
  const rows = (await db()`select data from saved_carts where id = ${id}`) as { data: SavedCart }[];
  if (!rows[0]) return;
  const c: SavedCart = { ...rows[0].data, status, updatedAt: now, ...(status === "contacted" ? { contactedAt: now, contactedBy: by } : {}) };
  await db()`update saved_carts set status = ${status}, data = ${JSON.stringify(c)}, updated_at = ${now} where id = ${id}`;
}

export async function deleteCart(id: string) {
  await db()`delete from saved_carts where id = ${id}`;
}

/* ---------------------------------------------------------------- favoris */

export async function setFavorite(visitor: string, productId: string, on: boolean) {
  if (on) await db()`insert into favorites (visitor, product_id) values (${visitor}, ${productId}) on conflict do nothing`;
  else await db()`delete from favorites where visitor = ${visitor} and product_id = ${productId}`;
}

export async function favoriteCounts(): Promise<Record<string, number>> {
  const rows = (await db()`select product_id, count(*)::int as n from favorites group by product_id`) as { product_id: string; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.product_id, r.n]));
}

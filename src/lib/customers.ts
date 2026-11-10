// Données laissées par les clients (avis, paniers enregistrés, favoris), dans la base Neon.
import { db } from "@/lib/db";
import { REF_TOKEN } from "@/lib/order-ref";
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

/* -------------------------------------------------------------- commandes */

export interface OrderRecord {
  id: string;
  ref: string;
  createdAt: string;
  customer: { name: string; phone: string; email?: string };
  mode: "livraison" | "retrait";
  delivery?: { country: string; city: string; address: string; landmark?: string };
  pickup?: { date: string; time: string; deposit?: number; depositLabel?: string };
  items: { productId: string; slug?: string; image?: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  promo?: { code: string; discount: number };
  total: number;
  note?: string;
  /** message exact envoyé sur WhatsApp */
  message?: string;
  /** suivi : en attente, vendue, non vendue */
  status?: OrderStatus;
  statusBy?: string;
  statusAt?: string;
  /** stock déjà retiré pour cette vente */
  stockDeducted?: boolean;
}

export type OrderStatus = "pending" | "sold" | "unsold";


/** Numéro suivant : CMD-AKUA-0001, CMD-AKUA-0002… (attribué par la base : jamais de doublon). */
async function nextOrderRef() {
  const [r] = (await db()`select nextval('order_number_seq')::int as n`) as { n: number }[];
  return `CMD-AKUA-${String(r.n).padStart(4, "0")}`;
}

/** Commande envoyée sur WhatsApp depuis le panier : numérotée puis enregistrée « en attente ». */
export async function addOrder(o: Omit<OrderRecord, "id" | "createdAt" | "ref">) {
  const ref = await nextOrderRef();
  const order: OrderRecord = { ...o, ref, message: o.message?.split(REF_TOKEN).join(ref), id: uid("cmd"), createdAt: new Date().toISOString() };
  await db()`insert into orders (id, ref, promo_code, data, created_at) values (${order.id}, ${order.ref}, ${order.promo?.code ?? null}, ${JSON.stringify(order)}, ${order.createdAt})`;
  return order;
}

type OrderRow = { data: OrderRecord; status: OrderStatus; status_by: string | null; status_at: string | Date | null };
const withStatus = (r: OrderRow): OrderRecord => ({ ...r.data, status: r.status, statusBy: r.status_by ?? undefined, statusAt: r.status_at ? new Date(r.status_at).toISOString() : undefined });

export async function listOrders(promoCode?: string): Promise<OrderRecord[]> {
  const rows = (promoCode
    ? await db()`select data, status, status_by, status_at from orders where promo_code = ${promoCode} order by created_at desc limit 500`
    : await db()`select data, status, status_by, status_at from orders order by created_at desc limit 1000`) as OrderRow[];
  return rows.map(withStatus);
}

export async function pendingOrders(): Promise<number> {
  const [r] = (await db()`select count(*)::int as n from orders where status = 'pending'`) as { n: number }[];
  return r?.n ?? 0;
}

/** Change le statut d'une commande (et note si le stock a été retiré). */
export async function setOrderStatus(id: string, status: OrderStatus, by: string, stockDeducted?: boolean) {
  await db()`update orders set status = ${status}, status_by = ${by}, status_at = now(),
    data = case when ${stockDeducted ?? null}::boolean is null then data else jsonb_set(data, '{stockDeducted}', to_jsonb(${stockDeducted ?? false}::boolean)) end
    where id = ${id}`;
}

export async function deleteOrder(id: string) {
  await db()`delete from orders where id = ${id}`;
}

/** Utilisation de chaque code : nombre de commandes, remise accordée, montant des commandes. */
export async function promoUsage(): Promise<Record<string, { uses: number; discount: number; total: number; last: string }>> {
  const rows = (await db()`select promo_code as code, count(*)::int as uses,
      coalesce(sum((data->'promo'->>'discount')::numeric), 0)::float as discount,
      coalesce(sum((data->>'total')::numeric), 0)::float as total,
      max(created_at) as last
    from orders where promo_code is not null group by promo_code`) as { code: string; uses: number; discount: number; total: number; last: string | Date }[];
  return Object.fromEntries(rows.map((r) => [r.code, { uses: r.uses, discount: r.discount, total: r.total, last: new Date(r.last).toISOString() }]));
}

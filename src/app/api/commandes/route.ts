import { after, NextResponse } from "next/server";
import { formatFCFA } from "@/lib/format";
import { clip, pushToOwner } from "@/lib/push";
import { addOrder, type OrderRecord } from "@/lib/customers";

// Enregistre une commande au moment où le client l'envoie sur WhatsApp.
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : 0);

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const c = (b.customer ?? {}) as Record<string, unknown>;
  const phone = str(c.phone, 40);
  const items = Array.isArray(b.items) ? b.items.slice(0, 80) : [];
  if (phone.replace(/\D/g, "").length < 8 || !items.length) return NextResponse.json({ error: "Commande incomplète." }, { status: 400 });
  const promo = b.promo as { code?: unknown; discount?: unknown } | undefined;
  const d = (b.delivery ?? null) as Record<string, unknown> | null;
  const pk = (b.pickup ?? null) as Record<string, unknown> | null;
  const order: Omit<OrderRecord, "id" | "createdAt" | "ref"> = {
    customer: { name: str(c.name, 80), phone, email: str(c.email, 120) || undefined },
    mode: b.mode === "retrait" ? "retrait" : "livraison",
    delivery: d ? { country: str(d.country, 60), city: str(d.city, 60), address: str(d.address, 200), landmark: str(d.landmark, 200) || undefined } : undefined,
    pickup: pk ? { date: str(pk.date, 20), time: str(pk.time, 20), deposit: num(pk.deposit) || undefined, depositLabel: str(pk.depositLabel, 40) || undefined } : undefined,
    items: items.map((x) => {
      const i = x as Record<string, unknown>;
      return { productId: str(i.productId, 80), slug: str(i.slug, 120) || undefined, image: /^(\/|https?:\/\/)/.test(str(i.image, 300)) ? str(i.image, 300) : undefined, name: str(i.name, 160), price: num(i.price), quantity: Math.max(1, num(i.quantity)) };
    }),
    message: str(b.message, 6000) || undefined,
    subtotal: num(b.subtotal),
    promo: promo && typeof promo.code === "string" && promo.code ? { code: str(promo.code, 40).toUpperCase(), discount: num(promo.discount) } : undefined,
    total: num(b.total),
    note: str(b.note, 500) || undefined,
  };
  try {
    const saved = await addOrder(order);
    // notification au propriétaire, envoyée après la réponse (le client n'attend pas)
    after(async () => {
      const first = saved.items[0];
      const more = saved.items.length > 1 ? ` + ${saved.items.length - 1} autre${saved.items.length > 2 ? "s" : ""}` : "";
      await pushToOwner("orders", {
        title: `Nouvelle commande ${saved.ref}`,
        body: clip(`${saved.customer.name || "Un client"} · ${first ? `${first.quantity} x ${first.name}` : ""}${more} · ${formatFCFA(saved.total)} · ${saved.mode === "retrait" ? "retrait en boutique" : "livraison"}. Touchez pour la voir.`, 180),
        url: "/spaceakua/commandes",
        tag: `cmd-${saved.ref}`,
      }).catch(() => 0);
    });
    return NextResponse.json({ ok: true, ref: saved.ref });
  } catch {
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { markCartOrdered, saveCart } from "@/lib/customers";

// Panier enregistré par un client (« Enregistrer mon panier »), ou commande envoyée (ordered: true).
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const phone = typeof b.phone === "string" ? b.phone.slice(0, 40) : "";
  if (phone.replace(/\D/g, "").length < 8) return NextResponse.json({ error: "Numéro invalide." }, { status: 400 });
  try {
    if (b.ordered) {
      await markCartOrdered(phone);
      return NextResponse.json({ ok: true });
    }
    const name = typeof b.name === "string" ? b.name.trim().slice(0, 80) : "";
    const items = Array.isArray(b.items) ? b.items.slice(0, 60) : [];
    if (name.length < 2 || !items.length) return NextResponse.json({ error: "Panier incomplet." }, { status: 400 });
    await saveCart({
      name,
      phone,
      email: typeof b.email === "string" && b.email ? b.email.slice(0, 120) : undefined,
      country: typeof b.country === "string" && b.country ? b.country.slice(0, 60) : undefined,
      city: typeof b.city === "string" && b.city ? b.city.slice(0, 60) : undefined,
      items,
      subtotal: Number(b.subtotal) || 0,
      promoCode: typeof b.promoCode === "string" && b.promoCode ? b.promoCode.slice(0, 40) : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}

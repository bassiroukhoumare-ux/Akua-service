import { NextResponse } from "next/server";
import { setFavorite } from "@/lib/customers";

// Ajout / retrait d'un favori (visiteur anonyme), pour le classement des produits les plus aimés.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { v?: string; productId?: string; on?: boolean };
  if (!b.v || !/^[a-z0-9]{8,32}$/.test(b.v) || !b.productId || b.productId.length > 80) return new NextResponse(null, { status: 400 });
  try {
    await setFavorite(b.v, b.productId, !!b.on);
  } catch {
    /* ignoré */
  }
  return new NextResponse(null, { status: 204 });
}

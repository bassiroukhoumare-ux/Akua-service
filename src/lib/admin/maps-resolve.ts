import { NextResponse } from "next/server";

const ALLOWED = /^(maps\.app\.goo\.gl|goo\.gl|(www\.)?google\.[a-z.]+|maps\.google\.[a-z.]+)$/;

/**
 * Suit un lien Google Maps court (maps.app.goo.gl/…) jusqu'à l'adresse complète,
 * qui contient la position de l'épingle. Uniquement des adresses Google Maps.
 */
export async function resolveMapsLink(req: Request) {
  const raw = new URL(req.url).searchParams.get("url") ?? "";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
  }
  if (url.protocol !== "https:" || !ALLOWED.test(url.hostname)) {
    return NextResponse.json({ error: "Collez un lien Google Maps." }, { status: 400 });
  }
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (AKUA Service)" }, signal: AbortSignal.timeout(8000) });
    const final = new URL(res.url);
    if (!ALLOWED.test(final.hostname)) return NextResponse.json({ error: "Lien non reconnu." }, { status: 400 });
    return NextResponse.json({ url: res.url });
  } catch {
    return NextResponse.json({ error: "Impossible d'ouvrir ce lien pour le moment." }, { status: 502 });
  }
}

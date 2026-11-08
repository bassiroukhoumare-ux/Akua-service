import { type NextRequest, NextResponse } from "next/server";
import { appendVisit } from "@/lib/analytics/store";
import { deviceFromUA, isBot, SOURCE_IDS, type SourceId } from "@/lib/analytics/sources";

// Compteur de visites du site public (envoyé par navigator.sendBeacon à chaque page vue).
// Le pays vient de l'hébergeur (en-tête géographique), jamais d'une donnée saisie par le visiteur.
const ID = /^[a-z0-9]{8,32}$/;

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua)) return new NextResponse(null, { status: 204 });
  let body: { v?: string; s?: string; p?: string; src?: string; e?: string };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const { v, s, p, src, e } = body;
  if (!v || !s || !ID.test(v) || !ID.test(s) || typeof p !== "string" || !p.startsWith("/") || p.length > 200) return new NextResponse(null, { status: 400 });
  const country = (req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? "").toUpperCase();
  try {
    await appendVisit({
      t: Date.now(),
      v,
      s,
      p: p.split(/[?#]/)[0],
      src: SOURCE_IDS.includes(src as SourceId) ? (src as SourceId) : "direct",
      c: /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : "",
      d: deviceFromUA(ua),
      ...(e === "order" ? { e: "order" as const } : {}),
    });
  } catch {
    // stockage indisponible : la visite n'est pas comptée, le site continue normalement
  }
  return new NextResponse(null, { status: 204 });
}

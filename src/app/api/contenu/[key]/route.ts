import { NextResponse } from "next/server";
import { isContentKey, publicView, readState } from "@/lib/content";

// Contenus publics du site (catalogue, accueil, promos, paramètres), sans le journal de l'équipe.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isContentKey(key)) return NextResponse.json({ error: "Inconnu" }, { status: 404 });
  const v = publicView(key, await readState<Record<string, unknown>>(key));
  return NextResponse.json({ value: v }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=300" } });
}

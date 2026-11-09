import { NextResponse } from "next/server";
import { saveImage } from "@/lib/admin/images";
import { portalUser } from "@/lib/admin/portal-user";

// Envoi d'une photo depuis l'espace admin : rangée dans la base, adresse publique en retour.
export async function POST(req: Request) {
  if (!(await portalUser("owner"))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const { data } = (await req.json().catch(() => ({}))) as { data?: string };
  try {
    return NextResponse.json({ url: await saveImage(data ?? "") });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

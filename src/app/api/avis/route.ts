import { NextResponse } from "next/server";
import { addReview, listReviews } from "@/lib/customers";

// Avis des clients : lecture des avis publiés, dépôt d'un nouvel avis.
export async function GET() {
  try {
    return NextResponse.json(await listReviews(false), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([]);
  }
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const rating = Number(b.rating);
  const r = { productId: str(b.productId, 80), firstName: str(b.firstName, 60), lastName: str(b.lastName, 60), country: str(b.country, 60), email: str(b.email, 120), comment: str(b.comment, 2000), rating: rating as 1 | 2 | 3 | 4 | 5 };
  if (!r.productId || r.firstName.length < 2 || r.comment.length < 10 || !(rating >= 1 && rating <= 5 && Number.isInteger(rating))) return NextResponse.json({ error: "Avis incomplet." }, { status: 400 });
  try {
    return NextResponse.json(await addReview(r));
  } catch {
    return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 });
  }
}

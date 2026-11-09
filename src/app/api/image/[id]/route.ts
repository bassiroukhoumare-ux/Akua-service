import { db } from "@/lib/db";

// Photos envoyées depuis l'espace admin (produits, bannières…).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{32}$/.test(id)) return new Response("Introuvable", { status: 404 });
  const rows = (await db()`select mime, b64 from images where id = ${id}`) as { mime: string; b64: string }[];
  if (!rows[0]) return new Response("Introuvable", { status: 404 });
  return new Response(Buffer.from(rows[0].b64, "base64"), { headers: { "Content-Type": rows[0].mime, "Cache-Control": "public, max-age=31536000, immutable" } });
}

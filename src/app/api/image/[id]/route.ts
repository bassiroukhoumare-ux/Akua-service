import { db } from "@/lib/db";

// une image ne change jamais (son adresse dépend de son contenu) : elle est gardée en mémoire après la première lecture
const memory = new Map<string, { mime: string; body: Buffer }>();
const MEMORY_MAX = 60;

// Photos envoyées depuis l'espace admin (produits, bannières…).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{32}$/.test(id)) return new Response("Introuvable", { status: 404 });
  let hit = memory.get(id);
  if (!hit) {
    const rows = (await db()`select mime, b64 from images where id = ${id}`) as { mime: string; b64: string }[];
    if (!rows[0]) return new Response("Introuvable", { status: 404 });
    hit = { mime: rows[0].mime, body: Buffer.from(rows[0].b64, "base64") };
    if (memory.size >= MEMORY_MAX) memory.delete(memory.keys().next().value as string);
    memory.set(id, hit);
  }
  return new Response(new Uint8Array(hit.body), { headers: { "Content-Type": hit.mime, "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable" } });
}

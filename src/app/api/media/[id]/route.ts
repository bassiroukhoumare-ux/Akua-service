import { CHUNK } from "@/lib/admin/media";
import { db } from "@/lib/db";

// Lecture d'une vidéo importée depuis l'admin, par plages d'octets (lecture progressive, iPhone compris).
// Chaque réponse est limitée à ~3 Mo : le navigateur demande la suite au fil de la lecture.
const MAX_PART = 3_000_000;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) return new Response("Introuvable", { status: 404 });
  const sql = db();
  const [m] = (await sql`select mime, size::bigint as size from media where id = ${id} and complete`) as { mime: string; size: string | number }[];
  if (!m) return new Response("Introuvable", { status: 404 });
  const size = Number(m.size);
  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  let start = range?.[1] ? Number(range[1]) : 0;
  let end = range?.[2] ? Number(range[2]) : size - 1;
  if (range && !range[1] && range[2]) {
    start = Math.max(0, size - Number(range[2]));
    end = size - 1;
  }
  if (start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  end = Math.min(end, size - 1, start + MAX_PART - 1);
  const first = Math.floor(start / CHUNK);
  const last = Math.floor(end / CHUNK);
  const rows = (await sql`select idx, b64 from media_chunks where media_id = ${id} and idx between ${first} and ${last} order by idx`) as { idx: number; b64: string }[];
  const buf = Buffer.concat(rows.map((r) => Buffer.from(r.b64, "base64")));
  const part = buf.subarray(start - first * CHUNK, end - first * CHUNK + 1);
  return new Response(part, {
    status: 206,
    headers: {
      "Content-Type": m.mime,
      "Content-Length": String(part.length),
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

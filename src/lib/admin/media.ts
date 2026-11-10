// Vidéos importées depuis l'admin, rangées dans Neon par morceaux (Vercel limite chaque envoi à ~4,5 Mo).
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import type { PortalKind } from "@/config/admin-base";
import { db } from "@/lib/db";
import { portalUser } from "./portal-user";

/** taille d'un morceau (octets) — l'envoi encodé reste sous la limite de Vercel */
export const CHUNK = 2_500_000;
export const MAX_VIDEO = 60 * 1024 * 1024;
const VIDEO = /^video\/(mp4|webm|quicktime|ogg)$/;

/** Envoi en 3 temps : start → chunk (×n) → finish. */
export async function mediaUpload(kind: PortalKind, req: Request) {
  if (!(await portalUser(kind))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as { action?: string; id?: string; mime?: string; size?: number; idx?: number; data?: string };
  const sql = db();
  if (b.action === "start") {
    const size = Number(b.size);
    if (!b.mime || !VIDEO.test(b.mime)) return NextResponse.json({ error: "Format vidéo non pris en charge (MP4 ou WebM conseillé)." }, { status: 400 });
    if (!(size > 0) || size > MAX_VIDEO) return NextResponse.json({ error: "Vidéo trop lourde : 60 Mo maximum." }, { status: 400 });
    const id = randomBytes(12).toString("hex");
    await sql`insert into media (id, mime, size, chunks) values (${id}, ${b.mime}, ${size}, ${Math.ceil(size / CHUNK)})`;
    return NextResponse.json({ id, chunk: CHUNK });
  }
  const id = String(b.id ?? "");
  if (!/^[a-f0-9]{24}$/.test(id)) return NextResponse.json({ error: "Envoi inconnu" }, { status: 400 });
  if (b.action === "chunk") {
    const idx = Number(b.idx);
    if (!Number.isInteger(idx) || idx < 0 || !b.data || b.data.length > CHUNK * 1.4) return NextResponse.json({ error: "Morceau invalide" }, { status: 400 });
    await sql`insert into media_chunks (media_id, idx, b64) values (${id}, ${idx}, ${b.data}) on conflict (media_id, idx) do update set b64 = excluded.b64`;
    return NextResponse.json({ ok: true });
  }
  if (b.action === "finish") {
    const [m] = (await sql`select chunks from media where id = ${id}`) as { chunks: number }[];
    const [{ n }] = (await sql`select count(*)::int as n from media_chunks where media_id = ${id}`) as { n: number }[];
    if (!m || n !== m.chunks) return NextResponse.json({ error: "Envoi incomplet, recommencez." }, { status: 400 });
    await sql`update media set complete = true where id = ${id}`;
    return NextResponse.json({ url: `/api/media/${id}` });
  }
  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}

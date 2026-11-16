import { createHash } from "node:crypto";
import { db } from "@/lib/db";

const MAX = 6 * 1024 * 1024;
/** largeur maximale gardée : au-delà, l'image est réduite (une bannière fait 1920 px de large) */
const MAX_WIDTH = 1920;

/**
 * Allège une image avant de la ranger : WebP, 1920 px de large au plus.
 * Une image lourde (PNG de plusieurs Mo) mettait plusieurs secondes à sortir de la base
 * et ne s'affichait pas sur le site. En cas d'échec, l'image est gardée telle quelle.
 */
async function lighten(mime: string, b64: string): Promise<{ mime: string; b64: string }> {
  if (!/^image\/(png|jpe?g|webp)$/.test(mime)) return { mime, b64 };
  try {
    const sharp = (await import("sharp")).default;
    const out = await sharp(Buffer.from(b64, "base64")).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    const next = out.toString("base64");
    return next.length < b64.length ? { mime: "image/webp", b64: next } : { mime, b64 };
  } catch {
    return { mime, b64 };
  }
}

/** Range une image (adresse data:…) dans la base et renvoie son adresse publique. */
export async function saveImage(dataUrl: string): Promise<string> {
  const m = dataUrl.match(/^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new Error("Image illisible");
  if (m[2].length * 0.75 > MAX) throw new Error("Image trop lourde");
  const { mime, b64 } = await lighten(m[1], m[2]);
  const id = createHash("sha256").update(b64).digest("hex").slice(0, 32);
  await db()`insert into images (id, mime, b64) values (${id}, ${mime}, ${b64}) on conflict (id) do nothing`;
  return `/api/image/${id}`;
}

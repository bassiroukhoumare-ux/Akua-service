import { createHash } from "node:crypto";
import { db } from "@/lib/db";

const MAX = 6 * 1024 * 1024;

/** Range une image (adresse data:…) dans la base et renvoie son adresse publique. */
export async function saveImage(dataUrl: string): Promise<string> {
  const m = dataUrl.match(/^data:(image\/[a-z+.-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new Error("Image illisible");
  const [, mime, b64] = m;
  if (b64.length * 0.75 > MAX) throw new Error("Image trop lourde");
  const id = createHash("sha256").update(b64).digest("hex").slice(0, 32);
  await db()`insert into images (id, mime, b64) values (${id}, ${mime}, ${b64}) on conflict (id) do nothing`;
  return `/api/image/${id}`;
}

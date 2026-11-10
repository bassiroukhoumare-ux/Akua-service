import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import type { PortalKind } from "@/config/admin-base";
import { CONTENT_TAG, isContentKey, readStateRaw, writeState } from "@/lib/content";
import { checkChange } from "./perm-guard";
import { portalMember, portalUser } from "./portal-user";
import { saveImage } from "./images";

const deny = () => NextResponse.json({ error: "Accès refusé" }, { status: 403 });

export async function getState(kind: PortalKind, key: string) {
  if (!(await portalUser(kind))) return deny();
  if (!isContentKey(key)) return NextResponse.json({ error: "Inconnu" }, { status: 404 });
  return NextResponse.json({ value: await readStateRaw(key) }, { headers: { "Cache-Control": "no-store" } });
}

const DATA_URL = /"data:image\/[a-z+.-]+;base64,[A-Za-z0-9+/=]+"/g;

export async function putState(kind: PortalKind, key: string, req: Request) {
  const me = await portalMember(kind);
  if (!me) return deny();
  const who = me.name;
  if (!isContentKey(key)) return NextResponse.json({ error: "Inconnu" }, { status: 404 });
  let text = await req.text();
  // sécurité : une image restée en texte est rangée à part, le contenu reste léger
  const found = text.match(DATA_URL);
  if (found) for (const d of new Set(found)) text = text.split(d).join(JSON.stringify(await saveImage(JSON.parse(d))));
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Contenu illisible" }, { status: 400 });
  }
  if (!value || typeof value !== "object" || !("state" in value)) return NextResponse.json({ error: "Contenu illisible" }, { status: 400 });
  // équipier : chaque changement doit correspondre à un droit qu'il possède
  const refused = checkChange(key, await readStateRaw<Record<string, unknown>>(key), value as { state?: Record<string, unknown> }, me.perms);
  if (refused) return NextResponse.json({ error: refused }, { status: 403 });
  await writeState(key, value, who);
  revalidateTag(CONTENT_TAG);
  return NextResponse.json({ ok: true });
}

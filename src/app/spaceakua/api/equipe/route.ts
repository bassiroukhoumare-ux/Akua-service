import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cleanPerms, modulesOf } from "@/config/permissions";
import { readSession, SESSION } from "@/lib/admin/session";
import { hashPassword, readTeam, sameIdentifier, type StoredMember, tempPassword, toPublic, updateTeam } from "@/lib/admin/team-store";

// Gestion des équipiers : réservée au propriétaire.
export const dynamic = "force-dynamic";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function owner() {
  return !!(await readSession("owner", (await cookies()).get(SESSION.owner.cookie)?.value));
}

function clean(b: { name?: unknown; identifier?: unknown; perms?: unknown }) {
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 80) : "";
  const identifier = typeof b.identifier === "string" ? b.identifier.trim().slice(0, 40) : "";
  const perms = cleanPerms(b.perms);
  const modules = modulesOf(perms);
  if (name.length < 2) return { error: "Indiquez le nom de l'équipier." };
  if (identifier.replace(/\D/g, "").length < 8 && identifier.length < 3) return { error: "Indiquez son numéro WhatsApp." };
  if (!modules.length) return { error: "Choisissez au moins un module." };
  return { name, identifier, modules, perms };
}

export async function GET() {
  if (!(await owner())) return fail("Accès refusé", 403);
  return NextResponse.json((await readTeam()).map(toPublic));
}

/** Création : renvoie le mot de passe provisoire (affiché une seule fois). */
export async function POST(req: Request) {
  if (!(await owner())) return fail("Accès refusé", 403);
  const b = await req.json().catch(() => ({}));
  const c = clean(b);
  if ("error" in c) return fail(c.error!);
  const password = tempPassword();
  const res = await updateTeam((list) => {
    if (list.some((m) => sameIdentifier(m.identifier, c.identifier))) return null;
    const m: StoredMember = { id: `m${Date.now().toString(36)}`, ...c, status: "pending", secret: hashPassword(password), mustChange: true, createdAt: new Date().toISOString() };
    list.push(m);
    return m;
  });
  if (!res) return fail("Ce numéro est déjà utilisé par un autre équipier.", 409);
  return NextResponse.json({ member: toPublic(res), password });
}

/** Modification : nom, numéro, droits, activation ; ou nouveau mot de passe provisoire (reset: true). */
export async function PATCH(req: Request) {
  if (!(await owner())) return fail("Accès refusé", 403);
  const b = await req.json().catch(() => ({}));
  const id = typeof b.id === "string" ? b.id : "";
  let password: string | undefined;
  let error = "";
  const res = await updateTeam((list) => {
    const m = list.find((x) => x.id === id);
    if (!m) return (error = "Équipier introuvable."), null;
    if (b.reset) {
      password = tempPassword();
      m.secret = hashPassword(password);
      m.mustChange = true;
      if (m.status !== "disabled") m.status = "pending";
    } else if (b.status === "active" || b.status === "disabled") {
      m.status = b.status === "active" ? (m.mustChange ? "pending" : "active") : "disabled";
    } else {
      const c = clean(b);
      if ("error" in c) return (error = c.error!), null;
      if (list.some((x) => x.id !== id && sameIdentifier(x.identifier, c.identifier))) return (error = "Ce numéro est déjà utilisé par un autre équipier."), null;
      Object.assign(m, c);
    }
    return m;
  });
  if (!res) return fail(error || "Modification impossible.");
  return NextResponse.json({ member: toPublic(res), password });
}

export async function DELETE(req: Request) {
  if (!(await owner())) return fail("Accès refusé", 403);
  const id = new URL(req.url).searchParams.get("id") ?? "";
  await updateTeam((list) => {
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) list.splice(i, 1);
  });
  return NextResponse.json({ ok: true });
}

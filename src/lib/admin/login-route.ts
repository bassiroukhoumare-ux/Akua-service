import { NextResponse } from "next/server";
import type { PortalKind } from "@/config/admin-base";
import { PORTAL_BASE } from "@/config/admin-base";
import { createSession, SESSION, SESSION_DAYS } from "./session";

// Protection contre les essais en rafale (par adresse et par portail, en mémoire).
const attempts = new Map<string, { n: number; until: number }>();

type Body = { identifier?: string; password?: string; remember?: boolean; suite?: string };

/** Lecture du formulaire : JSON (page normale) ou envoi classique (navigateur où le script n'a pas pu se lancer). */
async function readBody(req: Request): Promise<{ body: Body; form: boolean }> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
    const f = await req.formData().catch(() => null);
    const v = (k: string) => (typeof f?.get(k) === "string" ? String(f.get(k)) : undefined);
    return { body: { identifier: v("identifier"), password: v("password"), remember: true, suite: v("suite") }, form: true };
  }
  return { body: ((await req.json().catch(() => ({}))) as Body) ?? {}, form: false };
}

/**
 * Traite une demande de connexion pour un portail : `check` renvoie l'identifiant de session
 * si les informations sont correctes, sinon null.
 */
export async function handleLogin(req: Request, kind: PortalKind, check: (b: Body) => string | null | Promise<string | null>, wrong: string) {
  const ip = `${kind}:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"}`;
  const base = PORTAL_BASE[kind];
  const { body, form } = await readBody(req);
  // envoi classique : on revient sur la page de connexion avec le message, ou on entre dans l'espace
  const back = (error: string) => {
    const u = new URL(`${base}/connexion`, req.url);
    u.searchParams.set("erreur", error);
    if (body.suite?.startsWith(base)) u.searchParams.set("suite", body.suite);
    return NextResponse.redirect(u, 303);
  };
  const a = attempts.get(ip);
  if (a && a.until > Date.now()) {
    const msg = "Trop de tentatives. Réessayez dans quelques minutes.";
    return form ? back(msg) : NextResponse.json({ error: msg }, { status: 429 });
  }
  body.password = body.password?.trim();
  body.identifier = body.identifier?.trim();
  // délai constant : ne révèle rien sur la validité
  await new Promise((r) => setTimeout(r, 400));
  const user = await check(body);
  if (!user) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(ip, { n, until: n >= 5 ? Date.now() + 5 * 60_000 : 0 });
    return form ? back(wrong) : NextResponse.json({ error: wrong }, { status: 401 });
  }
  attempts.delete(ip);
  const res = form ? NextResponse.redirect(new URL(body.suite?.startsWith(base) ? body.suite : base, req.url), 303) : NextResponse.json({ ok: true });
  res.cookies.set(SESSION[kind].cookie, await createSession(kind, user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: SESSION[kind].path,
    ...(body.remember ? { maxAge: SESSION_DAYS * 86400 } : {}),
  });
  return res;
}

export function handleLogout(kind: PortalKind) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION[kind].cookie, "", { path: SESSION[kind].path, maxAge: 0 });
  return res;
}

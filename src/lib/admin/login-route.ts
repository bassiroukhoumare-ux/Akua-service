import { NextResponse } from "next/server";
import type { PortalKind } from "@/config/admin-base";
import { createSession, SESSION, SESSION_DAYS } from "./session";

// Protection contre les essais en rafale (par adresse et par portail, en mémoire).
const attempts = new Map<string, { n: number; until: number }>();

type Body = { identifier?: string; password?: string; remember?: boolean };

/**
 * Traite une demande de connexion pour un portail : `check` renvoie l'identifiant de session
 * si les informations sont correctes, sinon null.
 */
export async function handleLogin(req: Request, kind: PortalKind, check: (b: Body) => string | null | Promise<string | null>, wrong: string) {
  const ip = `${kind}:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"}`;
  const a = attempts.get(ip);
  if (a && a.until > Date.now()) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans quelques minutes." }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as Body;
  // délai constant : ne révèle rien sur la validité
  await new Promise((r) => setTimeout(r, 400));
  const user = await check(body);
  if (!user) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(ip, { n, until: n >= 5 ? Date.now() + 5 * 60_000 : 0 });
    return NextResponse.json({ error: wrong }, { status: 401 });
  }
  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
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

import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, type PortalKind, TEAM_BASE } from "@/config/admin-base";
import { readSession, SESSION } from "@/lib/admin/session";

// Deux portails verrouillés et indépendants : propriétaire (/spaceakua) et équipiers (/equipe-akua).
// Sans session valide pour CE portail, retour à sa propre page de connexion.
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const kind: PortalKind = pathname === TEAM_BASE || pathname.startsWith(`${TEAM_BASE}/`) ? "team" : "owner";
  const base = kind === "team" ? TEAM_BASE : ADMIN_BASE;
  if (pathname.startsWith(`${base}/connexion`) || pathname.startsWith(`${base}/api/session`)) return NextResponse.next();
  const user = await readSession(kind, req.cookies.get(SESSION[kind].cookie)?.value);
  if (user) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  const url = req.nextUrl.clone();
  url.pathname = `${base}/connexion`;
  url.search = pathname === base ? "" : `?suite=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/spaceakua", "/spaceakua/:path*", "/equipe-akua", "/equipe-akua/:path*"] };

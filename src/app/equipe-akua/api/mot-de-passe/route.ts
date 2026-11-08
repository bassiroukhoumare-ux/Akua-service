import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readSession, SESSION } from "@/lib/admin/session";
import { hashPassword, updateTeam, verifyPassword } from "@/lib/admin/team-store";

// L'équipier remplace son mot de passe (provisoire ou non) par un mot de passe personnel.
export async function POST(req: Request) {
  const id = await readSession("team", (await cookies()).get(SESSION.team.cookie)?.value);
  if (!id) return NextResponse.json({ error: "Session expirée. Reconnectez-vous." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { current?: string; next?: string };
  const next = b.next ?? "";
  if (next.length < 8 || !/[a-zA-Z]/.test(next) || !/\d/.test(next)) return NextResponse.json({ error: "Le nouveau mot de passe ne respecte pas les règles." }, { status: 400 });
  await new Promise((r) => setTimeout(r, 300));
  let error = "";
  await updateTeam((list) => {
    const m = list.find((x) => x.id === id && x.status !== "disabled");
    if (!m) return void (error = "Compte introuvable.");
    if (!verifyPassword(b.current ?? "", m.secret)) return void (error = "Le mot de passe actuel est incorrect.");
    if (verifyPassword(next, m.secret)) return void (error = "Choisissez un mot de passe différent de l'actuel.");
    m.secret = hashPassword(next);
    m.mustChange = false;
    m.status = "active";
    m.passwordChangedAt = new Date().toISOString();
  });
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

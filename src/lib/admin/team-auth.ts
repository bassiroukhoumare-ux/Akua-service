// Connexion des équipiers. En attendant la base de données, un compte de démonstration
// (défini dans .env.local) permet de tester le portail équipe.
import { DEMO_TEAM, type TeamMember } from "./demo";
import { same } from "./session";

const digits = (s: string) => s.replace(/\D/g, "");

export function findMember(id: string): TeamMember | undefined {
  return DEMO_TEAM.find((m) => m.id === id && !m.owner && m.status !== "disabled");
}

/** Renvoie l'équipier si l'identifiant (numéro WhatsApp) et le mot de passe sont corrects. */
export function checkMemberCredentials(identifier: string, password: string): TeamMember | null {
  const pw = process.env.TEAM_DEMO_PASSWORD ?? "";
  const d = digits(identifier);
  if (!pw || d.length < 8) return null;
  const member = DEMO_TEAM.find((m) => !m.owner && m.status === "active" && digits(m.identifier).endsWith(d.slice(-8)));
  return member && same(password, pw) ? member : null;
}

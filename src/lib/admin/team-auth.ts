// Connexion des équipiers : numéro WhatsApp (ou identifiant) + mot de passe, vérifiés dans le registre.
import { type PublicMember, readTeam, sameIdentifier, toPublic, updateTeam, verifyPassword } from "./team-store";

/** Équipier actif (ou en attente de son premier mot de passe) ; undefined s'il est désactivé ou supprimé. */
export async function findMember(id: string): Promise<PublicMember | undefined> {
  const m = (await readTeam()).find((x) => x.id === id && x.status !== "disabled");
  return m ? toPublic(m) : undefined;
}

/** Renvoie l'équipier si l'identifiant et le mot de passe sont corrects. */
export async function checkMemberCredentials(identifier: string, password: string): Promise<PublicMember | null> {
  if (!identifier.trim() || !password) return null;
  const list = await readTeam();
  const m = list.find((x) => x.status !== "disabled" && sameIdentifier(x.identifier, identifier));
  if (!m || !verifyPassword(password, m.secret)) return null;
  await updateTeam((l) => {
    const x = l.find((y) => y.id === m.id);
    if (x) x.lastSeen = new Date().toISOString();
  });
  return toPublic(m);
}

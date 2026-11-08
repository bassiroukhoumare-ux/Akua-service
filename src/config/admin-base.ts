/** Portail du propriétaire (verrouillé, mot de passe seul). */
export const ADMIN_BASE = "/spaceakua";
/** Portail des équipiers : adresse distincte, qui ne révèle pas celle du propriétaire. */
export const TEAM_BASE = "/equipe-akua";

export type PortalKind = "owner" | "team";
export const PORTAL_BASE: Record<PortalKind, string> = { owner: ADMIN_BASE, team: TEAM_BASE };

"use client";

// Stockage des magasins de l'admin dans la base Neon (au lieu du navigateur).
// - Dans l'espace admin ou équipe : lecture et enregistrement via l'API du portail.
// - Sur le site public : lecture seule des contenus publiés.
// - Première ouverture : si la base est vide mais que ce navigateur contient des réglages
//   faits avant le branchement, ils sont repris et envoyés une fois dans la base.
import { createJSONStorage, type StateStorage } from "zustand/middleware";
import { ADMIN_BASE, TEAM_BASE } from "@/config/admin-base";

/** Portail de l'admin ouvert dans cette page (null sur le site public). */
export function portal(): string | null {
  if (typeof window === "undefined") return null;
  const p = location.pathname;
  if (p === TEAM_BASE || p.startsWith(`${TEAM_BASE}/`)) return TEAM_BASE;
  if (p === ADMIN_BASE || p.startsWith(`${ADMIN_BASE}/`)) return ADMIN_BASE;
  return null;
}

const DATA_URL = /"data:image\/[a-z+.-]+;base64,[A-Za-z0-9+/=]+"/g;
/** images déjà envoyées : même photo → même adresse, pas de nouvel envoi */
const uploaded = new Map<string, string>();

async function extractImages(base: string, text: string) {
  const found = text.match(DATA_URL);
  if (!found) return text;
  for (const quoted of new Set(found)) {
    const data = JSON.parse(quoted) as string;
    let url = uploaded.get(data);
    if (!url) {
      const res = await fetch(`${base}/api/images`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
      if (!res.ok) throw new Error("Envoi de l'image impossible");
      url = ((await res.json()) as { url: string }).url;
      uploaded.set(data, url);
    }
    text = text.split(quoted).join(JSON.stringify(url));
  }
  return text;
}

// un seul envoi à la fois par contenu ; si plusieurs modifications s'enchaînent, seule la dernière part
const pending = new Map<string, string>();
const running = new Set<string>();

/** état des enregistrements, pour afficher « Enregistrement… » / erreur dans l'admin */
type SaveState = "idle" | "saving" | "error";
let saveState: SaveState = "idle";
const listeners = new Set<(s: SaveState) => void>();
function setSave(s: SaveState) {
  saveState = s;
  listeners.forEach((l) => l(s));
}
export const getSaveState = () => saveState;
export function onSaveState(l: (s: SaveState) => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

async function flush(base: string, name: string) {
  if (running.has(name)) return;
  running.add(name);
  setSave("saving");
  try {
    while (pending.has(name)) {
      const value = pending.get(name)!;
      pending.delete(name);
      const body = await extractImages(base, value);
      const res = await fetch(`${base}/api/state/${name}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body, keepalive: body.length < 60_000 });
      if (!res.ok) throw new Error(String(res.status));
    }
    setSave(running.size > 1 ? "saving" : "idle");
  } catch {
    setSave("error");
  } finally {
    running.delete(name);
  }
}

const raw: StateStorage = {
  async getItem(name) {
    if (typeof window === "undefined") return null;
    const base = portal();
    try {
      const res = await fetch(base ? `${base}/api/state/${name}` : `/api/contenu/${name}`, { cache: "no-store" });
      const { value } = (await res.json()) as { value: unknown };
      if (value) return JSON.stringify(value);
    } catch {
      return null;
    }
    // base encore vide : reprise des réglages faits dans ce navigateur avant le branchement
    if (base) {
      const local = localStorage.getItem(name);
      if (local) {
        pending.set(name, local);
        void flush(base, name);
        return local;
      }
    }
    return null;
  },
  async setItem(name, value) {
    const base = typeof window !== "undefined" ? portal() : null;
    if (!base) return; // site public : lecture seule
    pending.set(name, value);
    await flush(base, name);
  },
  async removeItem() {},
};

export const serverStorage = createJSONStorage(() => raw);

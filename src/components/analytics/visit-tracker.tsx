"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { classifySource, type SourceId } from "@/lib/analytics/sources";

const SESSION_IDLE = 30 * 60_000;
const rid = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);

function visitorId() {
  try {
    let id = localStorage.getItem("akua-vid");
    if (!id || !/^[a-z0-9]{8,32}$/.test(id)) {
      id = rid();
      localStorage.setItem("akua-vid", id);
    }
    return id;
  } catch {
    return rid();
  }
}

/** Session de visite : la provenance est lue à l'arrivée et gardée pour les pages suivantes. */
function session(): { id: string; src: SourceId } {
  const now = Date.now();
  try {
    const prev = JSON.parse(sessionStorage.getItem("akua-sid") ?? "null") as { id: string; src: SourceId; last: number } | null;
    const qs = new URLSearchParams(location.search);
    const utm = qs.get("utm_source") ?? qs.get("ref");
    // nouvelle session : première page, 30 min d'inactivité, ou arrivée par un nouveau lien de suivi
    if (prev && now - prev.last < SESSION_IDLE && !utm) {
      sessionStorage.setItem("akua-sid", JSON.stringify({ ...prev, last: now }));
      return prev;
    }
    const next = { id: rid(), src: classifySource(utm, document.referrer, location.hostname), last: now };
    sessionStorage.setItem("akua-sid", JSON.stringify(next));
    return next;
  } catch {
    return { id: rid(), src: "direct" };
  }
}

/** Compte chaque page vue du site public (anonyme : aucun nom, numéro ni adresse IP enregistré). */
export function VisitTracker() {
  const path = usePathname();
  const last = useRef("");

  useEffect(() => {
    if (!path || last.current === path) return;
    last.current = path;
    const s = session();
    const body = JSON.stringify({ v: visitorId(), s: s.id, p: path, src: s.src });
    try {
      if (!navigator.sendBeacon?.("/api/visite", new Blob([body], { type: "application/json" }))) {
        void fetch("/api/visite", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
      }
    } catch {
      /* hors ligne : ignoré */
    }
  }, [path]);

  return null;
}

// Fin de l'offre spéciale (utilisé par l'admin et par le compte à rebours du site).
export interface DealTiming {
  /** « midnight » : se termine chaque soir à minuit ; « duration » : durée choisie à partir du lancement */
  mode: "midnight" | "duration";
  hours: number;
  startedAt: string;
  repeat: boolean;
}

/** Date de fin de l'offre en cours (gère « minuit » et la relance automatique) ; null si terminée. */
export function dealEnd(d: DealTiming, now = new Date()): Date | null {
  if (d.mode === "midnight") {
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    return end;
  }
  const start = new Date(d.startedAt).getTime();
  const len = Math.max(1, d.hours) * 3600_000;
  if (Number.isNaN(start)) return null;
  if (now.getTime() < start + len) return new Date(start + len);
  if (!d.repeat) return null; // terminée
  const cycles = Math.floor((now.getTime() - start) / len) + 1;
  return new Date(start + cycles * len);
}

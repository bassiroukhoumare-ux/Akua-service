"use client";

import { Check, Copy, TicketPercent, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { PromoCode } from "@/data/promo-codes";
import { isPromoValid } from "@/lib/promo";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { type Announcement, fillMessage, useAdminPromos } from "@/store/admin-promos";

const THEME = {
  blue: { bar: "bg-akua-blue text-akua-white", chip: "bg-akua-white/15 ring-akua-white/35 hover:bg-akua-white/25", muted: "text-akua-white/75" },
  dark: { bar: "bg-akua-ink text-akua-white", chip: "bg-akua-white/10 ring-akua-white/25 hover:bg-akua-white/20", muted: "text-akua-white/65" },
  gold: { bar: "bg-[linear-gradient(90deg,var(--akua-gold-light),var(--akua-gold))] text-akua-ink", chip: "bg-akua-white/45 ring-akua-ink/15 hover:bg-akua-white/70", muted: "text-akua-ink/70" },
} as const;

const pad = (n: number) => String(n).padStart(2, "0");

function Remaining({ end, className }: { end: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((new Date(end).getTime() - now) / 1000));
  const d = Math.floor(s / 86400);
  return (
    <span className={cn("shrink-0 font-semibold tabular-nums", className)}>
      Fin dans {d > 0 ? `${d}j ` : ""}
      {pad(Math.floor((s % 86400) / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}
    </span>
  );
}

/** Rendu de la bannière (site public et aperçu dans l'espace administrateur). */
export function AnnouncementView({ a, code, onClose, preview }: { a: Announcement; code: PromoCode | null; onClose?: () => void; preview?: boolean }) {
  const [copied, setCopied] = useState(false);
  const t = THEME[a.theme];
  const text = fillMessage(a.message, code);
  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const message = <span className="min-w-0 text-balance">{text}</span>;
  return (
    <div role="region" aria-label="Annonce" className={cn("relative", t.bar)}>
      <div className="mx-auto flex min-h-11 max-w-[1320px] items-center justify-center gap-x-3 gap-y-1 py-2 pr-11 pl-4 text-center text-[12.5px] font-medium sm:text-[13.5px] md:pl-11">
        <TicketPercent aria-hidden className="hidden size-[18px] shrink-0 sm:block" strokeWidth={1.8} />
        <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {a.link && !preview ? (
            <Link href={a.link} className="underline-offset-4 hover:underline">
              {message}
            </Link>
          ) : (
            message
          )}
          {code && (
            <button type="button" onClick={copy} className={cn("inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold tracking-[0.06em] ring-1 transition-colors", t.chip)}>
              {code.code}
              {copied ? <Check aria-hidden className="size-3.5" strokeWidth={3} /> : <Copy aria-hidden className="size-3.5" />}
              <span className="sr-only">{copied ? "Code copié" : "Copier le code"}</span>
            </button>
          )}
          {a.countdown && code?.endsAt && <Remaining end={code.endsAt} className={t.muted} />}
        </span>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Fermer l'annonce" className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full opacity-80 transition-opacity hover:opacity-100">
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

/** Bannière d'annonce en haut du site, réglée depuis l'espace administrateur. */
export function AnnouncementBar() {
  const hydrated = useHydrated();
  const a = useAdminPromos((s) => s.announcement);
  const codes = useAdminPromos((s) => s.codes);
  const code = a.codeId ? (codes.find((c) => c.id === a.codeId) ?? null) : null;
  const key = `akua-annonce-${a.codeId ?? ""}-${a.message}`;
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    try {
      setClosed(sessionStorage.getItem(key) === "1");
    } catch {}
  }, [key]);

  if (!hydrated || !a.enabled || closed) return null;
  if (a.codeId && (!code || !isPromoValid(code))) return null; // code expiré ou désactivé : la bannière disparaît
  return (
    <AnnouncementView
      a={a}
      code={code}
      onClose={() => {
        setClosed(true);
        try {
          sessionStorage.setItem(key, "1");
        } catch {}
      }}
    />
  );
}

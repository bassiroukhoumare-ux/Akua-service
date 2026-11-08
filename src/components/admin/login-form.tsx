"use client";

import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PORTAL_BASE, type PortalKind } from "@/config/admin-base";
import { btn } from "@/lib/btn";
import { cn } from "@/lib/utils";

/** Formulaire de connexion d'un portail : mot de passe seul (propriétaire) ou numéro + mot de passe (équipier). */
export function LoginForm({ kind }: { kind: PortalKind }) {
  const base = PORTAL_BASE[kind];
  const team = kind === "team";
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || (team && !identifier.trim())) {
      setError(team ? "Saisissez votre numéro WhatsApp et votre mot de passe." : "Saisissez votre mot de passe.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch(`${base}/api/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: team ? identifier : "", password, remember }),
    }).catch(() => null);
    if (!res?.ok) {
      const data = (await res?.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Connexion impossible. Vérifiez votre connexion internet.");
      setBusy(false);
      return;
    }
    const next = params.get("suite");
    router.replace(next && next.startsWith(base) ? next : base);
    router.refresh();
  }

  const field =
    "h-[52px] w-full rounded-2xl border bg-akua-white pr-4 pl-11 text-[16px] text-akua-ink outline-none transition-colors placeholder:text-akua-gray-500 focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10 sm:text-[15px]";
  const border = error ? "border-akua-red/60" : "border-akua-gray-200";

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="flex items-start gap-2.5 rounded-2xl bg-akua-red/8 px-4 py-3 text-[13.5px] font-medium text-akua-red">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}
      {team && (
        <div>
          <label htmlFor="login-id" className="mb-1.5 block text-[13.5px] font-medium">
            Numéro WhatsApp
          </label>
          <div className="relative">
            <Phone aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-akua-gray-500" strokeWidth={1.8} />
            <input
              id="login-id"
              type="tel"
              inputMode="tel"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              autoFocus
              placeholder="+228 90 00 00 00"
              className={cn(field, border)}
            />
          </div>
        </div>
      )}
      <div>
        <label htmlFor="login-pw" className="mb-1.5 block text-[13.5px] font-medium">
          Mot de passe
        </label>
        <div className="relative">
          <Lock aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-akua-gray-500" strokeWidth={1.8} />
          <input
            id="login-pw"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus={!team}
            placeholder="Votre mot de passe"
            className={cn(field, "pr-12", border)}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-akua-gray-500 transition-colors hover:bg-akua-page hover:text-akua-ink"
          >
            {show ? <EyeOff aria-hidden className="size-[18px]" /> : <Eye aria-hidden className="size-[18px]" />}
          </button>
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] select-none">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 rounded accent-[var(--akua-blue)]" />
        Rester connecté 7 jours sur cet appareil
      </label>
      <button type="submit" disabled={busy} className={btn({ variant: "primary", size: "lg", className: "mt-1 w-full" })}>
        {busy ? "Connexion…" : "Se connecter"} {!busy && <ArrowRight aria-hidden className="size-4" />}
      </button>
    </form>
  );
}

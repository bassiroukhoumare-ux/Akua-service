"use client";

import { Check, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btn } from "@/lib/btn";
import { cn } from "@/lib/utils";

const RULES = [
  { t: "8 caractères minimum", ok: (p: string) => p.length >= 8 },
  { t: "Au moins une lettre", ok: (p: string) => /[a-zA-Z]/.test(p) },
  { t: "Au moins un chiffre", ok: (p: string) => /\d/.test(p) },
];

/** Choix d'un mot de passe personnel (remplace le mot de passe provisoire). */
export function PasswordForm({ first = false }: { first?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const valid = RULES.every((r) => r.ok(pw));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cur) return setError(first ? "Saisissez le mot de passe provisoire reçu sur WhatsApp." : "Saisissez votre mot de passe actuel.");
    if (!valid) return setError("Le nouveau mot de passe ne respecte pas les règles.");
    if (pw !== confirm) return setError("Les deux mots de passe ne sont pas identiques.");
    setError("");
    setBusy(true);
    const res = await fetch("/equipe-akua/api/mot-de-passe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: cur, next: pw }) }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      const data = (await res?.json().catch(() => null)) as { error?: string } | null;
      return setError(data?.error ?? "Enregistrement impossible. Vérifiez votre connexion internet.");
    }
    setDone(true);
    if (first) window.setTimeout(() => router.refresh(), 1400);
  }

  const field = "h-12 w-full rounded-2xl border border-akua-gray-200 bg-akua-white px-4 text-[16px] outline-none transition-colors focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10 sm:text-[15px]";

  if (done) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <CheckCircle2 aria-hidden className="size-12 text-[#128c4a]" strokeWidth={1.5} />
        <p className="mt-3 text-[18px] font-extrabold">Mot de passe enregistré</p>
        <p className="mt-1 max-w-sm text-[14px] text-akua-gray-500">
          {first ? "Votre espace s'ouvre…" : "Utilisez-le dès votre prochaine connexion. Il n'est connu que de vous."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-2xl bg-akua-red/8 px-4 py-3 text-[13.5px] font-medium text-akua-red">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="pw-cur" className="mb-1.5 block text-[13.5px] font-medium">
          {first ? "Mot de passe provisoire (reçu sur WhatsApp)" : "Mot de passe actuel"}
        </label>
        <input id="pw-cur" type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" className={field} />
      </div>
      <div>
        <label htmlFor="pw-new" className="mb-1.5 block text-[13.5px] font-medium">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <input id="pw-new" type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" className={cn(field, "pr-12")} />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Masquer" : "Afficher"}
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-page"
          >
            {show ? <EyeOff aria-hidden className="size-[18px]" /> : <Eye aria-hidden className="size-[18px]" />}
          </button>
        </div>
        <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
          {RULES.map((r) => {
            const ok = r.ok(pw);
            return (
              <li key={r.t} className={cn("flex items-center gap-1.5 text-[12.5px] transition-colors", ok ? "text-[#128c4a]" : "text-akua-gray-500")}>
                <span className={cn("grid size-4 place-items-center rounded-full", ok ? "bg-akua-whatsapp/15" : "bg-akua-page")}>{ok && <Check aria-hidden className="size-3" strokeWidth={3} />}</span>
                {r.t}
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <label htmlFor="pw-confirm" className="mb-1.5 block text-[13.5px] font-medium">
          Confirmer le nouveau mot de passe
        </label>
        <input id="pw-confirm" type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={field} />
      </div>
      <button type="submit" disabled={busy} className={btn({ variant: "primary", size: "md", className: "mt-1 self-start" })}>
        {busy ? "Enregistrement…" : "Enregistrer mon mot de passe"}
      </button>
    </form>
  );
}

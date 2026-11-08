"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const inputCls = (err?: string) =>
  cn(
    "h-12 w-full rounded-2xl border bg-akua-white px-4 text-[16px] text-akua-ink outline-none transition-colors placeholder:text-akua-gray-500 focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10 sm:text-[15px]",
    err ? "border-akua-red" : "border-akua-gray-200 hover:border-akua-gray-500/40",
  );

export function Field({ id, label, hint, error, optional, className, children }: { id?: string; label: string; hint?: React.ReactNode; error?: string; optional?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-[13.5px] font-medium text-akua-ink">
        {label}
        {optional && <span className="text-[12px] font-normal text-akua-gray-500">Facultatif</span>}
      </label>
      {children}
      {error ? (
        <p id={id ? `${id}-err` : undefined} role="alert" className="mt-1.5 text-[12.5px] font-medium text-akua-red">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[12.5px] text-akua-gray-500">{hint}</p>
      )}
    </div>
  );
}

/** Interrupteur oui / non, avec titre et explication. */
export function Toggle({ checked, onChange, label, description, icon: Icon }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3.5 rounded-[18px] border p-3.5 transition-colors", checked ? "border-akua-blue/40 bg-akua-blue-100/40" : "border-akua-gray-200 hover:border-akua-gray-500/40")}>
      {Icon && (
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl transition-colors", checked ? "bg-akua-white text-akua-blue" : "bg-akua-page text-akua-ink")}>
          <Icon className="size-5" strokeWidth={1.7} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-[12.5px] leading-snug text-akua-gray-500">{description}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-akua-blue/25",
          checked ? "bg-akua-blue" : "bg-akua-gray-200",
        )}
      >
        <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-akua-white shadow transition-transform duration-200", checked && "translate-x-5")} />
      </span>
    </label>
  );
}

/** Choix unique sous forme de pastilles. */
export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> }[]; className?: string }) {
  return (
    <div role="radiogroup" className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors",
              on ? "border-akua-ink bg-akua-ink text-akua-white" : "border-akua-gray-200 bg-akua-white text-akua-ink hover:border-akua-ink",
            )}
          >
            {o.icon && <o.icon className="size-4" strokeWidth={1.9} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Liste d'éléments libres (contenu du pack, compatibilité…) avec suggestions en un clic. */
export function TagInput({ id, value, onChange, placeholder, suggestions = [], ordered }: { id?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; suggestions?: string[]; ordered?: boolean }) {
  const [draft, setDraft] = useState("");
  const add = (t: string) => {
    const v = t.trim();
    if (!v || value.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...value, v]);
  };
  const rest = suggestions.filter((s) => !value.some((x) => x.toLowerCase() === s.toLowerCase()));
  return (
    <div>
      {value.length > 0 && (
        <ul className={cn("mb-2.5 flex gap-2", ordered ? "flex-col" : "flex-wrap")}>
          {value.map((t, i) => (
            <li
              key={t}
              className={cn(
                "flex items-center gap-2 bg-akua-page text-[14px] font-medium",
                ordered ? "min-h-11 rounded-[14px] py-2 pr-2 pl-3.5" : "h-9 rounded-full pr-1.5 pl-3.5",
              )}
            >
              {ordered && <span className="w-5 shrink-0 text-[12.5px] font-bold text-akua-gray-500 tabular-nums">{i + 1}.</span>}
              <span className="min-w-0 flex-1">{t}</span>
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Retirer « ${t} »`} className="grid size-7 shrink-0 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-white hover:text-akua-red">
                <X aria-hidden className="size-3.5" strokeWidth={2.4} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
              setDraft("");
            }
          }}
          placeholder={placeholder}
          className={inputCls()}
        />
        <button
          type="button"
          onClick={() => {
            add(draft);
            setDraft("");
          }}
          disabled={!draft.trim()}
          aria-label="Ajouter"
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-akua-ink text-akua-white transition-opacity disabled:opacity-30"
        >
          <Plus aria-hidden className="size-5" />
        </button>
      </div>
      {rest.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {rest.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-akua-gray-200 px-3 text-[12.5px] font-medium text-akua-gray-500 transition-colors hover:border-akua-blue hover:text-akua-blue">
              <Plus aria-hidden className="size-3" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Champ prix en F CFA : chiffres uniquement, séparateur de milliers à l'affichage. */
export function PriceInput({ id, value, onChange, error, placeholder }: { id?: string; value: number | undefined; onChange: (v: number | undefined) => void; error?: string; placeholder?: string }) {
  const shown = value === undefined ? "" : new Intl.NumberFormat("fr-FR").format(value).replace(/ | /g, " ");
  return (
    <div className="relative">
      <input
        id={id}
        inputMode="numeric"
        value={shown}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, "").slice(0, 9);
          onChange(d ? Number(d) : undefined);
        }}
        placeholder={placeholder ?? "0"}
        aria-invalid={!!error || undefined}
        className={cn(inputCls(error), "pr-16 font-semibold tabular-nums")}
      />
      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[13.5px] font-semibold text-akua-gray-500">F CFA</span>
    </div>
  );
}

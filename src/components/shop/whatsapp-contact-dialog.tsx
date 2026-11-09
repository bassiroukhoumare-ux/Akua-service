"use client";

import { Send, X } from "lucide-react";
import { useState } from "react";
import { allCountryOptions } from "@/components/ui/country-options";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SearchSelect } from "@/components/ui/search-select";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { useShopSettings } from "@/components/shop-settings-provider";
import { btn } from "@/lib/btn";
import { cn } from "@/lib/utils";
import { buildContactLink } from "@/lib/whatsapp";

const OTHER = "__autre__";
const COUNTRY_OPTIONS = allCountryOptions(OTHER);

type Form = { firstName: string; lastName: string; country: string; otherCountry: string; phone: string; message: string };
type Errors = Partial<Record<keyof Form, string>>;
const EMPTY: Form = { firstName: "", lastName: "", country: "Togo", otherCountry: "", phone: "", message: "" };

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.firstName.trim().length < 2) e.firstName = "Indiquez votre prénom.";
  if (f.lastName.trim().length < 2) e.lastName = "Indiquez votre nom.";
  if (!f.country) e.country = "Choisissez votre pays.";
  else if (f.country === OTHER && f.otherCountry.trim().length < 2) e.otherCountry = "Écrivez le nom de votre pays.";
  if (f.phone.replace(/\D/g, "").length < 8) e.phone = "Numéro invalide (8 chiffres minimum).";
  if (f.message.trim().length < 5) e.message = "Écrivez votre message.";
  return e;
}

const field = (err?: string) =>
  cn(
    "h-12 w-full rounded-2xl border bg-akua-white px-4 text-[16px] text-akua-ink outline-none transition-colors placeholder:text-akua-gray-500 focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10 sm:text-[15px]",
    err ? "border-akua-red" : "border-akua-gray-200 hover:border-akua-gray-500/40",
  );

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13.5px] font-medium text-akua-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-[12.5px] font-medium text-akua-red">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Bouton « Écrire sur WhatsApp » : ouvre une fenêtre où le visiteur donne ses coordonnées
 * et son message, puis envoie le tout, bien structuré, au numéro WhatsApp de la boutique.
 */
export function WhatsAppContactButton({
  className,
  label = "Écrire sur WhatsApp",
  children,
  "aria-label": ariaLabel,
}: {
  className?: string;
  label?: string;
  /** contenu personnalisé du bouton (ex. logo seul pour le bouton flottant) */
  children?: React.ReactNode;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const { whatsapp } = useShopSettings();
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };
  const up = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value);
  const err = (k: keyof Form) => ({ "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `wa-${k}-err` : undefined });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`wa-${first}`)?.focus();
      return;
    }
    const link = buildContactLink({
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      country: f.country === OTHER ? f.otherCountry.trim() : f.country,
      phone: f.phone.trim(),
      message: f.message.trim(),
    });
    window.open(link, "_blank", "noopener");
    setOpen(false);
    setF(EMPTY);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={ariaLabel} aria-haspopup="dialog" className={className ?? btn({ variant: "whatsapp", size: "lg" })}>
        {children ?? (
          <>
            <WhatsAppIcon size={19} /> {label}
          </>
        )}
      </button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setErrors({});
        }}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
          className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[560px] flex-col sm:max-w-[560px] gap-0 overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white p-0 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0"
        >
          {/* en-tête */}
          <div className="relative flex items-start gap-3.5 bg-akua-whatsapp px-5 py-5 text-akua-white sm:px-7 sm:py-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-akua-white/15 ring-1 ring-akua-white/25">
              <WhatsAppIcon size={24} />
            </span>
            <div className="min-w-0 flex-1 pr-8">
              <DialogTitle className="text-[19px] leading-tight font-extrabold tracking-[-0.02em] sm:text-[21px]">Écrivez-nous sur WhatsApp</DialogTitle>
              <DialogDescription className="mt-1 text-[13.5px] text-akua-white/85">Votre message sera envoyé au {whatsapp}. Nous vous répondons dans les meilleurs délais.</DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-akua-white/15 text-akua-white transition-colors hover:bg-akua-white/25"
            >
              <X aria-hidden className="size-[18px]" />
            </button>
          </div>

          <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain px-5 py-5 sm:grid-cols-2 sm:px-7 sm:py-6">
              <Field id="wa-firstName" label="Prénom" error={errors.firstName}>
                <input id="wa-firstName" value={f.firstName} onChange={up("firstName")} autoComplete="given-name" placeholder="Ex. Kossi" className={field(errors.firstName)} {...err("firstName")} />
              </Field>
              <Field id="wa-lastName" label="Nom" error={errors.lastName}>
                <input id="wa-lastName" value={f.lastName} onChange={up("lastName")} autoComplete="family-name" placeholder="Ex. Mensah" className={field(errors.lastName)} {...err("lastName")} />
              </Field>
              <Field id="wa-country" label="Pays" error={errors.country}>
                <SearchSelect
                  id="wa-country"
                  value={f.country}
                  onChange={(v) => set("country", v)}
                  options={COUNTRY_OPTIONS}
                  placeholder="Choisir…"
                  searchPlaceholder="Rechercher un pays…"
                  emptyText="Pays introuvable : choisissez « Autre pays » en bas de la liste."
                  invalid={!!errors.country}
                />
              </Field>
              <Field id="wa-phone" label="Téléphone" error={errors.phone}>
                <input id="wa-phone" type="tel" inputMode="tel" value={f.phone} onChange={up("phone")} autoComplete="tel" placeholder="+228 90 00 00 00" className={field(errors.phone)} {...err("phone")} />
              </Field>
              {f.country === OTHER && (
                <Field id="wa-otherCountry" label="Nom de votre pays" error={errors.otherCountry} className="sm:col-span-2">
                  <input id="wa-otherCountry" value={f.otherCountry} onChange={up("otherCountry")} autoFocus autoComplete="country-name" placeholder="Ex. Sénégal, Nigeria, France…" className={field(errors.otherCountry)} {...err("otherCountry")} />
                </Field>
              )}
              <Field id="wa-message" label="Votre message" error={errors.message} className="sm:col-span-2">
                <textarea
                  id="wa-message"
                  value={f.message}
                  onChange={up("message")}
                  rows={4}
                  placeholder="Produit recherché, question sur une commande, disponibilité…"
                  className={cn(field(errors.message), "h-auto resize-none py-3 leading-relaxed")}
                  {...err("message")}
                />
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-2.5 border-t border-akua-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <button type="button" onClick={() => setOpen(false)} className={btn({ variant: "outline", size: "md", className: "sm:w-auto" })}>
                Annuler
              </button>
              <button type="submit" className={btn({ variant: "whatsapp", size: "md", className: "sm:w-auto" })}>
                Envoyer sur WhatsApp <Send aria-hidden className="size-4" />
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

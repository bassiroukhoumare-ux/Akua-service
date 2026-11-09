"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MessageSquarePlus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { allCountryOptions } from "@/components/ui/country-options";
import { SearchSelect } from "@/components/ui/search-select";
import { btn } from "@/lib/btn";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { ensureReviews, summarize, useReviews } from "@/store/reviews";
import type { Review } from "@/types/catalog";
import { Stars } from "./rating-stars";

type Form = { firstName: string; lastName: string; country: string; otherCountry: string; email: string; rating: number; comment: string };
type Errors = Partial<Record<keyof Form, string>>;
const OTHER = "__autre__";
const COUNTRY_OPTIONS = allCountryOptions(OTHER);
const EMPTY: Form = { firstName: "", lastName: "", country: "", otherCountry: "", email: "", rating: 0, comment: "" };

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.firstName.trim().length < 2) e.firstName = "Indiquez votre prénom.";
  if (f.lastName.trim().length < 2) e.lastName = "Indiquez votre nom.";
  if (!f.country) e.country = "Choisissez votre pays.";
  else if (f.country === OTHER && f.otherCountry.trim().length < 2) e.otherCountry = "Écrivez le nom de votre pays.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Adresse e-mail invalide.";
  if (!f.rating) e.rating = "Choisissez une note.";
  if (f.comment.trim().length < 10) e.comment = "Votre avis doit faire au moins 10 caractères.";
  return e;
}

const field = (err?: string) =>
  cn(
    "h-12 w-full rounded-2xl border bg-akua-white px-4 text-[15px] outline-none transition-colors placeholder:text-akua-gray-500 focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10",
    err ? "border-akua-red" : "border-akua-gray-200",
  );

function ReviewItem({ r }: { r: Review }) {
  const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(r.createdAt));
  return (
    <li className="rounded-[22px] border border-akua-gray-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-akua-blue-100 text-[14px] font-bold text-akua-blue">
            {r.firstName[0]?.toUpperCase()}
            {r.lastName[0]?.toUpperCase()}
          </span>
          <div>
            <p className="text-[14.5px] font-semibold">
              {r.firstName} {r.lastName[0]?.toUpperCase()}.
            </p>
            <p className="text-[12.5px] text-akua-gray-500">
              {r.country} · {date}
            </p>
          </div>
        </div>
        <Stars value={r.rating} />
      </div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-akua-ink">{r.comment}</p>
    </li>
  );
}

export function ReviewsSection({ productId, productName }: { productId: string; productName: string }) {
  const hydrated = useHydrated();
  const reviews = useReviews((s) => s.reviews);
  const addReview = useReviews((s) => s.addReview);
  const { list, count, average, distribution } = summarize(hydrated ? reviews : [], productId);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [hover, setHover] = useState(0);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  useEffect(() => ensureReviews(), []);

  const up = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`rv-${first}`)?.focus();
      return;
    }
    setSending(true);
    setSendError("");
    try {
      await addReview({
      productId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      country: form.country === OTHER ? form.otherCountry.trim() : form.country,
      email: form.email.trim(),
      rating: form.rating as Review["rating"],
      comment: form.comment.trim(),
      });
    } catch {
      setSending(false);
      setSendError("Votre avis n'a pas pu être envoyé. Vérifiez votre connexion et réessayez.");
      return;
    }
    setSending(false);
    setForm(EMPTY);
    setOpen(false);
    setDone(true);
    window.setTimeout(() => setDone(false), 5000);
  }

  return (
    <section id="avis" aria-labelledby="avis-title" className="scroll-mt-28">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:gap-10">
        {/* Synthèse */}
        <div className="h-fit rounded-[28px] bg-akua-page p-6 lg:sticky lg:top-[100px]">
          <h2 id="avis-title" className="text-[22px] font-extrabold tracking-[-0.02em]">
            Avis clients
          </h2>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-[48px] leading-none font-extrabold tracking-[-0.04em]">{count ? average.toFixed(1) : "0"}</span>
            <span className="pb-1.5 text-[14px] text-akua-gray-500">/ 5</span>
          </div>
          <Stars value={average} size="size-5" className="mt-2" />
          <p className="mt-1.5 text-[13.5px] text-akua-gray-500">{count ? `Basé sur ${count} avis` : "Aucun avis pour le moment"}</p>
          <ul className="mt-5 space-y-2">
            {distribution.map((d) => (
              <li key={d.stars} className="flex items-center gap-2.5 text-[12.5px]">
                <span className="flex w-7 items-center gap-0.5 font-semibold">
                  {d.stars} <Star aria-hidden className="size-3 fill-akua-yellow text-akua-yellow" />
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-akua-gray-200">
                  <span className="block h-full rounded-full bg-akua-yellow" style={{ width: count ? `${(d.count / count) * 100}%` : "0%" }} />
                </span>
                <span className="w-5 text-right text-akua-gray-500 tabular-nums">{d.count}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setOpen(true)} className={btn({ variant: "dark", size: "lg", className: "mt-6 w-full" })}>
            <MessageSquarePlus aria-hidden className="size-[18px]" /> Laisser un avis
          </button>
        </div>

        <div>
          <AnimatePresence>
            {done && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex items-center gap-2 rounded-2xl bg-akua-blue-100 px-4 py-3 text-[14px] font-medium text-akua-blue" role="status">
                <CheckCircle2 aria-hidden className="size-5" /> Merci ! Votre avis est publié.
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {open && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={submit}
                noValidate
                className="mb-6 overflow-hidden"
              >
                <div className="rounded-[28px] border border-akua-gray-200 p-5 md:p-7">
                  <p className="text-[18px] font-bold">Votre avis sur {productName}</p>
                  <p className="mt-1 text-[13px] text-akua-gray-500">Tous les champs sont obligatoires. Votre e-mail ne sera jamais affiché.</p>

                  <div className="mt-5">
                    <p className="mb-1.5 text-[13.5px] font-medium">Votre note</p>
                    <div id="rv-rating" tabIndex={-1} role="radiogroup" aria-label="Note sur 5" className="flex gap-1 outline-none" onMouseLeave={() => setHover(0)}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={form.rating === n}
                          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                          onMouseEnter={() => setHover(n)}
                          onClick={() => {
                            setForm((f) => ({ ...f, rating: n }));
                            setErrors((x) => ({ ...x, rating: undefined }));
                          }}
                          className="grid size-11 place-items-center rounded-xl transition-transform hover:scale-110"
                        >
                          <Star aria-hidden className={cn("size-8", n <= (hover || form.rating) ? "fill-akua-yellow text-akua-yellow" : "fill-akua-gray-200 text-akua-gray-200")} />
                        </button>
                      ))}
                    </div>
                    {errors.rating && <p className="mt-1 text-[12.5px] font-medium text-akua-red">{errors.rating}</p>}
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {(
                      [
                        { k: "firstName", label: "Prénom", auto: "given-name" },
                        { k: "lastName", label: "Nom", auto: "family-name" },
                      ] as const
                    ).map(({ k, label, auto }) => (
                      <label key={k} className="block">
                        <span className="mb-1.5 block text-[13.5px] font-medium">{label}</span>
                        <input id={`rv-${k}`} value={form[k]} onChange={up(k)} autoComplete={auto} aria-invalid={!!errors[k]} className={field(errors[k])} />
                        {errors[k] && <span className="mt-1 block text-[12.5px] font-medium text-akua-red">{errors[k]}</span>}
                      </label>
                    ))}
                    <div>
                      <label htmlFor="rv-country" className="mb-1.5 block text-[13.5px] font-medium">
                        Pays
                      </label>
                      <SearchSelect
                        id="rv-country"
                        value={form.country}
                        onChange={(country) => {
                          setForm((x) => ({ ...x, country }));
                          if (errors.country) setErrors((x) => ({ ...x, country: undefined }));
                        }}
                        options={COUNTRY_OPTIONS}
                        placeholder="Choisir…"
                        searchPlaceholder="Rechercher un pays…"
                        invalid={!!errors.country}
                        emptyText="Pays introuvable : choisissez « Autre pays » en bas de la liste."
                      />
                      {errors.country && <span className="mt-1 block text-[12.5px] font-medium text-akua-red">{errors.country}</span>}
                    </div>
                    {form.country === OTHER && (
                      <label className="block">
                        <span className="mb-1.5 block text-[13.5px] font-medium">Nom de votre pays</span>
                        <input
                          id="rv-otherCountry"
                          value={form.otherCountry}
                          onChange={up("otherCountry")}
                          autoFocus
                          autoComplete="country-name"
                          placeholder="Ex. Sénégal, Nigeria, France…"
                          aria-invalid={!!errors.otherCountry}
                          className={field(errors.otherCountry)}
                        />
                        {errors.otherCountry && <span className="mt-1 block text-[12.5px] font-medium text-akua-red">{errors.otherCountry}</span>}
                      </label>
                    )}
                    <label className="block">
                      <span className="mb-1.5 block text-[13.5px] font-medium">E-mail</span>
                      <input id="rv-email" type="email" value={form.email} onChange={up("email")} autoComplete="email" aria-invalid={!!errors.email} className={field(errors.email)} />
                      {errors.email && <span className="mt-1 block text-[12.5px] font-medium text-akua-red">{errors.email}</span>}
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-[13.5px] font-medium">Votre avis</span>
                      <textarea id="rv-comment" value={form.comment} onChange={up("comment")} rows={4} placeholder="Qualité, livraison, conseil…" aria-invalid={!!errors.comment} className={cn(field(errors.comment), "h-auto resize-none py-3")} />
                      {errors.comment && <span className="mt-1 block text-[12.5px] font-medium text-akua-red">{errors.comment}</span>}
                    </label>
                  </div>
                  {sendError && (
                    <p role="alert" className="mt-4 rounded-2xl bg-akua-red/8 px-4 py-3 text-[13.5px] font-medium text-akua-red">
                      {sendError}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <button type="submit" disabled={sending} className={btn({ variant: "primary", size: "lg" })}>
                      {sending ? "Envoi…" : "Publier mon avis"}
                    </button>
                    <button type="button" onClick={() => setOpen(false)} className={btn({ variant: "outline", size: "lg" })}>
                      Annuler
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {list.length ? (
            <ul className="space-y-3">
              {list.map((r) => (
                <ReviewItem key={r.id} r={r} />
              ))}
            </ul>
          ) : (
            !open && (
              <div className="flex flex-col items-center rounded-[28px] border border-dashed border-akua-gray-200 px-6 py-12 text-center">
                <Stars value={0} size="size-6" />
                <p className="mt-4 text-[17px] font-bold">Soyez le premier à donner votre avis</p>
                <p className="mt-1 max-w-sm text-[14px] text-akua-gray-500">Vous avez acheté ce produit chez AKUA Service ? Partagez votre expérience avec les autres clients.</p>
                <button type="button" onClick={() => setOpen(true)} className={btn({ variant: "primary", size: "md", className: "mt-5" })}>
                  Laisser un avis
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

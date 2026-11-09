"use client";

import { trackOrder } from "@/components/analytics/visit-tracker";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  LockKeyhole,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductVisual } from "@/components/product/product-visual";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deliveryCountryOptions } from "@/components/ui/country-options";
import { SearchSelect } from "@/components/ui/search-select";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { DELIVERY_COUNTRIES } from "@/config/site";
import { useShopSettings } from "@/components/shop-settings-provider";
import { summarizeHours } from "@/lib/shop-settings";
import { categories } from "@/data/categories";
import { CITIES } from "@/data/cities";
import { products } from "@/data/products";
import { formatFCFA, pluralize } from "@/lib/format";
import { checkPromoCode, computeDiscount, isPromoValid } from "@/lib/promo";
import { useAdminPromos } from "@/store/admin-promos";
import { useSavedCarts } from "@/store/saved-carts";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { buildCheckoutMessage, waLink } from "@/lib/whatsapp";
import { type CartItem, type CheckoutDraft, selectCount, selectTotal, useCart } from "@/store/cart";

const OTHER_CITY = "__autre__";
const COUNTRY_OPTIONS = deliveryCountryOptions();
const TIMES = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const DEPOSITS: { id: CheckoutDraft["deposit"]; label: string; pct: number }[] = [
  { id: "25", label: "25 %", pct: 25 },
  { id: "50", label: "50 %", pct: 50 },
  { id: "100", label: "Totalité", pct: 100 },
];

type Errors = Partial<Record<keyof CheckoutDraft, string>>;

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validate(d: CheckoutDraft): Errors {
  const e: Errors = {};
  if (d.name.trim().length < 2) e.name = "Indiquez votre nom complet.";
  if (d.phone.replace(/\D/g, "").length < 8) e.phone = "Numéro WhatsApp invalide (8 chiffres minimum).";
  if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) e.email = "Adresse e-mail invalide.";
  if (d.mode === "livraison") {
    if (!d.city.trim()) e.city = "Indiquez votre ville.";
    if (d.address.trim().length < 6) e.address = "Décrivez votre adresse exacte (quartier, rue, maison).";
  } else {
    if (!d.pickupDate) e.pickupDate = "Choisissez le jour de votre passage.";
    else if (new Date(`${d.pickupDate}T12:00:00`).getDay() === 0) e.pickupDate = "La boutique est fermée le dimanche. Choisissez un autre jour.";
    if (!d.pickupTime) e.pickupTime = "Choisissez une heure.";
  }
  return e;
}

/* ------------------------------------------------------------------ UI bits */

function Section({ step, title, subtitle, children, id }: { step: number; title: string; subtitle?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-[28px] border border-akua-gray-200 bg-akua-white p-5 md:p-7">
      <div className="flex items-start gap-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-akua-ink font-display text-[14px] font-semibold text-akua-white">{step}</span>
        <div>
          <h2 className="font-display text-[20px] leading-tight font-semibold md:text-[22px]">{title}</h2>
          {subtitle && <p className="mt-1 text-[13.5px] text-akua-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5 md:mt-6">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, error, optional, children, className }: { label: string; htmlFor: string; error?: string; optional?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-[13.5px] font-medium text-akua-ink">
        {label}
        {optional && <span className="text-[12px] font-normal text-akua-gray-500">Facultatif</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p id={`${htmlFor}-err`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-[12.5px] font-medium text-akua-red" role="alert">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = (err?: string) =>
  cn(
    "h-12 w-full rounded-2xl border bg-akua-white px-4 text-[15px] text-akua-ink outline-none transition-colors placeholder:text-akua-gray-500 focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10",
    err ? "border-akua-red" : "border-akua-gray-200 hover:border-akua-gray-500/40",
  );

function Line({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const [confirm, setConfirm] = useState(false);
  const product = products.find((p) => p.id === item.productId);
  const category = categories.find((c) => c.id === item.categoryId);
  return (
    <motion.li layout exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.3 }} className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <Link href={`/produit/${item.slug}`} className="relative size-[92px] shrink-0 overflow-hidden rounded-2xl bg-akua-tile md:size-[110px]">
        <ProductVisual product={{ name: item.name, categoryId: item.categoryId, images: item.image ? [item.image] : [] }} sizes="110px" inset="p-2.5" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-akua-blue">{category?.name}</p>
            <Link href={`/produit/${item.slug}`} className="mt-0.5 line-clamp-2 font-display text-[16px] leading-snug font-medium text-akua-ink hover:text-akua-blue">
              {item.name}
            </Link>
            {product && <p className="mt-1 line-clamp-1 text-[12.5px] text-akua-gray-500">{product.shortDescription}</p>}
          </div>
          <button type="button" onClick={() => setConfirm(true)} aria-label={`Retirer ${item.name}`} className="grid size-9 shrink-0 place-items-center rounded-full text-akua-gray-500 transition-colors hover:bg-akua-red/10 hover:text-akua-red">
            <Trash2 aria-hidden className="size-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex h-10 items-center rounded-full border border-akua-gray-200">
            <button type="button" onClick={() => (item.quantity <= 1 ? setConfirm(true) : setQuantity(item.productId, item.quantity - 1))} aria-label="Diminuer la quantité" className="grid size-10 place-items-center rounded-full hover:bg-akua-tile">
              <Minus aria-hidden className="size-4" />
            </button>
            <span className="w-7 text-center text-[15px] font-semibold tabular-nums" aria-live="polite">
              {item.quantity}
            </span>
            <button type="button" onClick={() => setQuantity(item.productId, item.quantity + 1)} aria-label="Augmenter la quantité" className="grid size-10 place-items-center rounded-full hover:bg-akua-tile">
              <Plus aria-hidden className="size-4" />
            </button>
          </div>
          <div className="text-right">
            {item.quantity > 1 && <p className="text-[12px] text-akua-gray-500">{formatFCFA(item.price)} / unité</p>}
            <p className="price text-[19px] text-akua-ink">{formatFCFA(item.price * item.quantity)}</p>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Retirer cet article du panier ?"
        description={
          <>
            <span className="font-semibold text-akua-ink">{item.name}</span> sera retiré de votre commande. Vous pourrez l&apos;ajouter à nouveau depuis la boutique.
          </>
        }
        confirmLabel="Oui, retirer"
        onConfirm={() => remove(item.productId)}
      />
    </motion.li>
  );
}

/* --------------------------------------------------------------- main view */

export function CheckoutView() {
  const shop = useShopSettings();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const count = useCart(selectCount);
  const subtotal = useCart(selectTotal);
  const draft = useCart((s) => s.draft);
  const setDraft = useCart((s) => s.setDraft);
  const clear = useCart((s) => s.clear);

  const [errors, setErrors] = useState<Errors>({});
  const [otherCity, setOtherCity] = useState(false);
  const countryCode = DELIVERY_COUNTRIES.find((c) => c.name === draft.country)?.code ?? "TG";
  const cityList = CITIES[countryCode];
  // « Autre ville » choisie, ou ville déjà saisie à la main lors d'une visite précédente
  const cityIsOther = otherCity || (!!draft.city && !cityList.includes(draft.city));
  const [promoInput, setPromoInput] = useState("");
  const [promoState, setPromoState] = useState<{ loading: boolean; error?: string }>({ loading: false });
  const [sending, setSending] = useState(false);
  const saveCart = useSavedCarts((s) => s.save);
  const markOrdered = useSavedCarts((s) => s.markOrdered);
  const [cartSaved, setCartSaved] = useState(false);

  /** « Enregistrer mon panier » : nom + WhatsApp suffisent, l'équipe peut recontacter le client */
  async function saveForLater() {
    const e: Errors = {};
    if (draft.name.trim().length < 2) e.name = "Indiquez votre nom complet.";
    if (draft.phone.replace(/\D/g, "").length < 8) e.phone = "Numéro WhatsApp invalide (8 chiffres minimum).";
    if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) e.email = "Adresse e-mail invalide.";
    setErrors((x) => ({ ...x, ...e }));
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    const ok = await saveCart({
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim() || undefined,
      country: draft.mode === "livraison" ? draft.country : undefined,
      city: draft.mode === "livraison" ? draft.city.trim() || undefined : undefined,
      items,
      subtotal,
      promoCode: promo?.code,
    });
    if (ok) setCartSaved(true);
    else setErrors((x) => ({ ...x, phone: "Le panier n'a pas pu être enregistré. Vérifiez votre connexion et réessayez." }));
  }
  const [done, setDone] = useState<{ ref: string; link: string; mode: CheckoutDraft["mode"] } | null>(null);

  // codes gérés depuis l'espace administrateur (base de données)
  const promoCodes = useAdminPromos((s) => s.codes);
  const promo = useMemo(() => {
    const p = promoCodes.find((x) => x.code === draft.promoCode);
    if (!p || !isPromoValid(p) || (p.minTotal && subtotal < p.minTotal)) return null;
    return { code: p.code, label: p.label, discount: computeDiscount(p, subtotal) };
  }, [promoCodes, draft.promoCode, subtotal]);

  const total = subtotal - (promo?.discount ?? 0);
  const depositPct = draft.mode === "retrait" ? (DEPOSITS.find((d) => d.id === draft.deposit)?.pct ?? 0) : 0;
  const depositAmount = Math.round((total * depositPct) / 100);
  const up = (k: keyof CheckoutDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDraft({ [k]: e.target.value });
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function applyPromo() {
    setPromoState({ loading: true });
    const r = await checkPromoCode(promoInput, subtotal, promoCodes);
    if (r.ok) {
      setDraft({ promoCode: r.promo.code });
      setPromoInput("");
      setPromoState({ loading: false });
    } else setPromoState({ loading: false, error: r.error });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(draft);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setSending(true);
    const ref = `AKUA-${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const message = buildCheckoutMessage({
      reference: ref,
      lines: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      subtotal,
      promo: promo ? { code: promo.code, discount: promo.discount } : undefined,
      total,
      customer: { name: draft.name.trim(), phone: draft.phone.trim(), email: draft.email.trim() || undefined },
      mode: draft.mode,
      delivery: draft.mode === "livraison" ? { country: draft.country, city: draft.city.trim(), address: draft.address.trim() } : undefined,
      pickup:
        draft.mode === "retrait"
          ? { date: draft.pickupDate, time: draft.pickupTime, deposit: depositPct ? { label: depositPct === 100 ? "paiement total" : `${depositPct} %`, amount: depositAmount } : undefined }
          : undefined,
      note: draft.note.trim() || undefined,
    });
    const link = waLink(message);
    markOrdered(draft.phone);
    trackOrder();
    window.open(link, "_blank", "noopener");
    window.setTimeout(() => {
      setDone({ ref, link, mode: draft.mode });
      clear();
      setSending(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 450);
  }

  /* ---------- confirmation */
  if (done) {
    return (
      <div className="container-akua pt-6 pb-10 md:pt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-xl rounded-[32px] border border-akua-gray-200 p-8 text-center md:p-12">
          <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.15 }} className="mx-auto block w-fit">
            <CheckCircle2 aria-hidden className="size-20 text-akua-blue" strokeWidth={1.2} />
          </motion.span>
          <p className="mt-6 text-[13px] font-medium text-akua-blue">Commande {done.ref}</p>
          <h1 className="mt-1 font-display text-[30px] leading-tight font-semibold md:text-[38px]">Votre commande est prête !</h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-akua-gray-500">
            Envoyez le message WhatsApp qui vient de s&apos;ouvrir. Notre équipe vous répond avec le lien de paiement
            {done.mode === "retrait" ? " et confirme votre créneau de passage en boutique." : " et le coût de livraison."}
          </p>
          <ol className="mx-auto mt-7 max-w-sm space-y-3 text-left">
            {["Envoyez le message WhatsApp pré-rempli", "Recevez le lien de paiement", done.mode === "retrait" ? "Passez récupérer votre produit" : "Recevez votre colis"].map((t, i) => (
              <li key={t} className="flex items-center gap-3 rounded-2xl bg-akua-tile p-3 text-[14px] font-medium">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-akua-white font-display text-[13px] font-semibold">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <a href={done.link} target="_blank" rel="noopener" className="btn-shine inline-flex h-12 items-center justify-center gap-2 rounded-full bg-akua-whatsapp px-6 text-[14.5px] font-semibold text-akua-white">
              <WhatsAppIcon size={19} /> Rouvrir WhatsApp
            </a>
            <Link href="/boutique" className="inline-flex h-12 items-center justify-center rounded-full border border-akua-gray-200 px-6 text-[14.5px] font-semibold hover:border-akua-ink">
              Continuer mes achats
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------- panier vide */
  if (hydrated && items.length === 0) {
    return (
      <div className="container-akua pt-6 pb-10 md:pt-12">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-[32px] bg-akua-tile px-6 py-16 text-center">
          <ShoppingBag aria-hidden className="size-14 text-akua-blue" strokeWidth={1.2} />
          <h1 className="mt-6 font-display text-[28px] font-semibold">Votre panier est vide</h1>
          <p className="mt-2 max-w-sm text-[15px] text-akua-gray-500">Ajoutez vos consoles, jeux ou manettes, puis finalisez votre commande ici en quelques secondes.</p>
          <Link href="/boutique" className="btn-shine mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-akua-ink px-6 text-[14.5px] font-semibold text-akua-white hover:bg-akua-blue">
            Découvrir la boutique <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const isDelivery = draft.mode === "livraison";

  return (
    <form id="checkout" onSubmit={submit} noValidate className="container-akua pt-4 pb-48 md:pt-8 lg:pb-10">
      <Link href="/boutique" className="inline-flex items-center gap-2 text-[13.5px] font-medium text-akua-gray-500 hover:text-akua-ink">
        <ArrowLeft aria-hidden className="size-4" /> Continuer mes achats
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-[34px] leading-none font-semibold md:text-[48px]">Finaliser ma commande</h1>
        <p className="flex items-center gap-2 text-[13.5px] text-akua-gray-500">
          <LockKeyhole aria-hidden className="size-4" /> Paiement sécurisé par lien envoyé sur WhatsApp
        </p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_400px] lg:gap-7">
        <div className="space-y-5">
          {/* 1. Panier */}
          <Section step={1} title="Votre panier" subtitle={hydrated ? `${pluralize(count, "article")} · modifiez les quantités si besoin` : undefined}>
            <ul className="divide-y divide-akua-gray-200">
              <AnimatePresence initial={false}>{hydrated && items.map((i) => <Line key={i.productId} item={i} />)}</AnimatePresence>
            </ul>
          </Section>

          {/* 2. Réception */}
          <Section step={2} title="Mode de réception" subtitle="Choisissez comment vous souhaitez récupérer votre commande.">
            <div role="radiogroup" aria-label="Mode de réception" className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "livraison" as const, icon: Truck, title: "Livraison", text: "Livraison disponible au Togo et dans la sous-région. Frais confirmés sur WhatsApp." },
                { id: "retrait" as const, icon: Store, title: "Retrait en boutique", text: "Gratuit. Réservez votre jour et votre heure de passage." },
              ].map((o) => {
                const on = draft.mode === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setDraft({ mode: o.id })}
                    className={cn(
                      "relative flex items-start gap-3.5 rounded-[22px] border-2 p-4 text-left transition-all duration-200 md:p-5",
                      on ? "border-akua-blue bg-akua-blue-100/50" : "border-akua-gray-200 hover:border-akua-gray-500/40",
                    )}
                  >
                    <o.icon aria-hidden className={cn("mt-0.5 size-8 shrink-0 transition-colors", on ? "text-akua-blue" : "text-akua-ink")} strokeWidth={1.4} />
                    <span>
                      <span className="block font-display text-[16.5px] font-semibold">{o.title}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-akua-gray-500">{o.text}</span>
                    </span>
                    <span className={cn("absolute top-4 right-4 grid size-5 place-items-center rounded-full border-2 transition-colors", on ? "border-akua-blue bg-akua-blue text-akua-white" : "border-akua-gray-200")}>
                      {on && <Check aria-hidden className="size-3" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* 3. Informations */}
          <Section step={3} title="Vos informations" subtitle="Pour vous contacter et préparer votre commande.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet" htmlFor="f-name" error={errors.name} className="sm:col-span-2">
                <input id="f-name" value={draft.name} onChange={up("name")} autoComplete="name" placeholder="Ex. Kossi Mensah" aria-invalid={!!errors.name} aria-describedby={errors.name ? "f-name-err" : undefined} className={inputCls(errors.name)} />
              </Field>
              <Field label="Numéro WhatsApp" htmlFor="f-phone" error={errors.phone}>
                <input id="f-phone" type="tel" inputMode="tel" value={draft.phone} onChange={up("phone")} autoComplete="tel" placeholder="+228 90 00 00 00" aria-invalid={!!errors.phone} className={inputCls(errors.phone)} />
              </Field>
              <Field label="E-mail" htmlFor="f-email" error={errors.email} optional>
                <input id="f-email" type="email" value={draft.email} onChange={up("email")} autoComplete="email" placeholder="vous@exemple.com" aria-invalid={!!errors.email} className={inputCls(errors.email)} />
              </Field>
            </div>
            <div className="mt-5 flex flex-col gap-3 rounded-[18px] bg-akua-tile p-4 sm:flex-row sm:items-center sm:justify-between">
              {cartSaved ? (
                <p role="status" className="flex items-start gap-2.5 text-[13.5px]">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-[18px] shrink-0 text-akua-whatsapp" />
                  <span>
                    <span className="font-semibold">Panier enregistré.</span> <span className="text-akua-gray-500">Finalisez quand vous voulez : notre équipe peut aussi vous recontacter.</span>
                  </span>
                </p>
              ) : (
                <p className="text-[13.5px] text-akua-gray-500">
                  <span className="font-semibold text-akua-ink">Pas encore prêt ?</span> Enregistrez votre panier avec votre nom et votre numéro : vous le retrouverez, et notre équipe pourra vous aider.
                </p>
              )}
              <button type="button" onClick={saveForLater} className="h-11 shrink-0 rounded-full border border-akua-gray-200 bg-akua-white px-5 text-[14px] font-semibold transition-colors hover:border-akua-ink">
                {cartSaved ? "Mettre à jour" : "Enregistrer mon panier"}
              </button>
            </div>
          </Section>

          {/* 4. Livraison ou retrait */}
          <AnimatePresence mode="wait" initial={false}>
            {isDelivery ? (
              <motion.div key="liv" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <Section step={4} title="Adresse de livraison" subtitle="Soyez le plus précis possible pour une livraison rapide.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Pays" htmlFor="f-country">
                      <SearchSelect
                        id="f-country"
                        value={draft.country}
                        onChange={(country) => {
                          setOtherCity(false);
                          setDraft({ country, city: "" });
                        }}
                        options={COUNTRY_OPTIONS}
                        searchPlaceholder="Rechercher un pays…"
                      />
                    </Field>
                    <Field label="Ville" htmlFor="f-city" error={errors.city}>
                      <SearchSelect
                        id="f-city"
                        value={cityIsOther ? OTHER_CITY : draft.city}
                        onChange={(v) => {
                          setOtherCity(v === OTHER_CITY);
                          setDraft({ city: v === OTHER_CITY ? "" : v });
                          if (errors.city) setErrors((er) => ({ ...er, city: undefined }));
                        }}
                        options={[...cityList.map((c) => ({ value: c, label: c })), { value: OTHER_CITY, label: "Autre ville…", display: "Autre ville" }]}
                        placeholder="Choisir une ville"
                        searchPlaceholder="Rechercher une ville…"
                        emptyText="Ville introuvable : choisissez « Autre ville » en bas de la liste."
                        invalid={!!errors.city}
                        aria-describedby={errors.city ? "f-city-err" : undefined}
                      />
                      {cityIsOther && (
                        <input
                          value={draft.city}
                          onChange={up("city")}
                          autoFocus
                          autoComplete="address-level2"
                          placeholder="Nom de votre ville"
                          aria-label="Nom de votre ville"
                          aria-invalid={!!errors.city}
                          className={cn(inputCls(errors.city), "mt-2")}
                        />
                      )}
                    </Field>
                    <Field label="Adresse exacte" htmlFor="f-address" error={errors.address} className="sm:col-span-2">
                      <textarea id="f-address" value={draft.address} onChange={up("address")} rows={3} autoComplete="street-address" placeholder="Quartier, rue, numéro ou couleur de la maison…" aria-invalid={!!errors.address} className={cn(inputCls(errors.address), "h-auto resize-none py-3 leading-relaxed")} />
                    </Field>
                  </div>
                </Section>
              </motion.div>
            ) : (
              <motion.div key="ret" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <Section step={4} title="Votre passage en boutique" subtitle="Nous préparons votre commande pour le créneau choisi.">
                  <div className="flex items-start gap-3 rounded-2xl bg-akua-tile p-4 text-[13.5px]">
                    <Store aria-hidden className="mt-0.5 size-5 shrink-0 text-akua-blue" strokeWidth={1.75} />
                    <p>
                      <span className="font-semibold text-akua-ink">{shop.name}</span> · {shop.address}
                      <br />
                      <span className="text-akua-gray-500">Horaires : {summarizeHours(shop.hours).map((h) => `${h.days} : ${h.hours}`).join(" · ")}</span>
                      <br />
                      <a href={shop.mapsLink} target="_blank" rel="noopener" className="mt-1.5 inline-flex items-center gap-1.5 font-semibold text-akua-blue hover:underline">
                        <MapPin aria-hidden className="size-4" strokeWidth={1.8} /> Voir sur Google Maps
                      </a>
                    </p>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field label="Jour de passage" htmlFor="f-pickupDate" error={errors.pickupDate}>
                      <div className="relative">
                        <CalendarDays aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-akua-gray-500" />
                        <input id="f-pickupDate" type="date" min={todayISO()} max={todayISO(30)} value={draft.pickupDate} onChange={up("pickupDate")} aria-invalid={!!errors.pickupDate} className={cn(inputCls(errors.pickupDate), "pl-11")} />
                      </div>
                    </Field>
                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-medium">
                        <Clock aria-hidden className="size-4 text-akua-gray-500" /> À partir de
                      </p>
                      <div id="f-pickupTime" tabIndex={-1} role="radiogroup" aria-label="Heure de passage" className="grid grid-cols-3 gap-1.5 outline-none">
                        {TIMES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            role="radio"
                            aria-checked={draft.pickupTime === t}
                            onClick={() => {
                              setDraft({ pickupTime: t });
                              setErrors((x) => ({ ...x, pickupTime: undefined }));
                            }}
                            className={cn("h-10 rounded-xl text-[13.5px] font-medium tabular-nums transition-colors", draft.pickupTime === t ? "bg-akua-ink text-akua-white" : "border border-akua-gray-200 hover:border-akua-ink")}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {errors.pickupTime && <p className="mt-1.5 text-[12.5px] font-medium text-akua-red">{errors.pickupTime}</p>}
                    </div>
                  </div>

                  {/* Acompte */}
                  <div className="mt-6 rounded-[22px] border border-akua-gray-200 p-4 md:p-5">
                    <button type="button" role="switch" aria-checked={draft.deposit !== "none"} onClick={() => setDraft({ deposit: draft.deposit === "none" ? "50" : "none" })} className="flex w-full items-center gap-4 text-left">
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[16px] font-semibold">Réserver avec un acompte</span>
                        <span className="mt-0.5 block text-[13px] text-akua-gray-500">Payez une partie maintenant : votre produit est mis de côté jusqu&apos;à votre passage.</span>
                      </span>
                      <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", draft.deposit !== "none" ? "bg-akua-blue" : "bg-akua-gray-200")}>
                        <span className={cn("absolute top-1 size-5 rounded-full bg-akua-white shadow transition-all", draft.deposit !== "none" ? "left-6" : "left-1")} />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {draft.deposit !== "none" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div role="radiogroup" aria-label="Montant de l'acompte" className="mt-4 grid grid-cols-3 gap-2">
                            {DEPOSITS.map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                role="radio"
                                aria-checked={draft.deposit === d.id}
                                onClick={() => setDraft({ deposit: d.id })}
                                className={cn("rounded-2xl border-2 p-3 text-center transition-colors", draft.deposit === d.id ? "border-akua-blue bg-akua-blue-100/50" : "border-akua-gray-200 hover:border-akua-gray-500/40")}
                              >
                                <span className="block font-display text-[15px] font-semibold">{d.label}</span>
                                <span className="price mt-0.5 block text-[13px] text-akua-blue">{formatFCFA(Math.round((total * d.pct) / 100))}</span>
                              </button>
                            ))}
                          </div>
                          <p className="mt-3 text-[12.5px] text-akua-gray-500">Le lien de paiement de l&apos;acompte vous est envoyé sur WhatsApp. Le reste est réglé en boutique.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Section>
              </motion.div>
            )}
          </AnimatePresence>

          <Section step={5} title="Un message pour l'équipe ?" subtitle="Coloris souhaité, question, précision…">
            <label htmlFor="f-note" className="sr-only">
              Note
            </label>
            <textarea id="f-note" value={draft.note} onChange={up("note")} rows={3} placeholder="Facultatif" className={cn(inputCls(), "h-auto resize-none py-3")} />
          </Section>
        </div>

        {/* Récapitulatif */}
        <aside aria-label="Récapitulatif" className="lg:sticky lg:top-[100px] lg:self-start">
          <div className="rounded-[28px] bg-akua-tile p-5 md:p-7">
            <h2 className="font-display text-[22px] font-semibold">Récapitulatif</h2>
            <ul className="mt-4 space-y-3">
              {hydrated &&
                items.map((i) => (
                  <li key={i.productId} className="flex items-center gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-akua-white">
                      <ProductVisual product={{ name: i.name, categoryId: i.categoryId, images: i.image ? [i.image] : [] }} sizes="48px" inset="p-1" />
                      <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-akua-ink text-[10px] font-semibold text-akua-white">{i.quantity}</span>
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{i.name}</span>
                    <span className="text-[13.5px] font-semibold tabular-nums">{formatFCFA(i.price * i.quantity)}</span>
                  </li>
                ))}
            </ul>

            {/* code promo */}
            <div className="mt-5 border-t border-akua-gray-200 pt-5">
              {promo ? (
                <div className="flex items-center gap-3 rounded-2xl border border-akua-blue/30 bg-akua-white p-3">
                  <Tag aria-hidden className="ml-1 size-5 shrink-0 text-akua-blue" strokeWidth={1.6} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold">{promo.code}</span>
                    <span className="block text-[12px] text-akua-gray-500">{promo.label}</span>
                  </span>
                  <button type="button" onClick={() => setDraft({ promoCode: "" })} aria-label="Retirer le code promo" className="grid size-8 place-items-center rounded-full hover:bg-akua-tile">
                    <X aria-hidden className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="f-promo" className="mb-1.5 block text-[13.5px] font-medium">
                    Code promo
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="f-promo"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        setPromoState({ loading: false });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyPromo();
                        }
                      }}
                      placeholder="Ex. AKUA10"
                      className={cn(inputCls(promoState.error), "h-11 uppercase placeholder:normal-case")}
                    />
                    <button type="button" onClick={applyPromo} disabled={promoState.loading || !promoInput} className="btn-shine h-11 shrink-0 rounded-2xl bg-akua-ink px-4 text-[13.5px] font-semibold text-akua-white transition-colors hover:bg-akua-blue disabled:opacity-40">
                      {promoState.loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : "Appliquer"}
                    </button>
                  </div>
                  {promoState.error && <p className="mt-1.5 text-[12.5px] font-medium text-akua-red">{promoState.error}</p>}
                </>
              )}
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-akua-gray-200 pt-5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-akua-gray-500">Sous-total</dt>
                <dd className="font-medium tabular-nums">{formatFCFA(hydrated ? subtotal : 0)}</dd>
              </div>
              {promo && (
                <div className="flex justify-between text-akua-blue">
                  <dt>Remise ({promo.code})</dt>
                  <dd className="font-medium tabular-nums">-{formatFCFA(promo.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-akua-gray-500">{isDelivery ? "Livraison" : "Retrait en boutique"}</dt>
                <dd className="font-medium">{isDelivery ? "Confirmée sur WhatsApp" : "Gratuit"}</dd>
              </div>
              <div className="flex items-end justify-between border-t border-akua-gray-200 pt-4">
                <dt className="font-display text-[16px] font-semibold">Total</dt>
                <dd className="price text-[30px] leading-none">{formatFCFA(hydrated ? total : 0)}</dd>
              </div>
              {depositPct > 0 && (
                <div className="flex justify-between rounded-xl bg-akua-white px-3 py-2.5 text-akua-blue">
                  <dt className="font-medium">Acompte à payer ({depositPct === 100 ? "total" : `${depositPct} %`})</dt>
                  <dd className="price">{formatFCFA(depositAmount)}</dd>
                </div>
              )}
            </dl>

            <button
              type="submit"
              disabled={sending || !hydrated || items.length === 0}
              className="btn-shine mt-6 hidden h-14 w-full items-center justify-center gap-2.5 rounded-full bg-akua-whatsapp text-[15.5px] font-semibold text-akua-white shadow-[0_16px_30px_-16px_rgb(37_211_102/0.9)] transition-transform active:scale-[0.98] disabled:opacity-60 lg:flex"
            >
              {sending ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <WhatsAppIcon size={21} />}
              {sending ? "Ouverture de WhatsApp…" : "Envoyer ma commande sur WhatsApp"}
            </button>

            <ul className="mt-5 space-y-2 border-t border-akua-gray-200 pt-5 text-[13px] text-akua-gray-500">
              {[
                { icon: ShieldCheck, t: "Produits testés et garantis" },
                { icon: CheckCircle2, t: "Aucun paiement avant confirmation" },
              ].map(({ icon: Icon, t }) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon aria-hidden className="size-4 text-akua-blue" strokeWidth={1.75} /> {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Barre d'envoi mobile */}
      <div className="fixed inset-x-2.5 bottom-[calc(74px+env(safe-area-inset-bottom))] z-30 rounded-[22px] border border-akua-gray-200 bg-akua-white/95 shadow-[0_18px_40px_-18px_rgb(11_16_32/0.35)] px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[12px] text-akua-gray-500">Total{depositPct > 0 ? ` · acompte ${formatFCFA(depositAmount)}` : ""}</p>
            <p className="price text-[20px] leading-tight">{formatFCFA(hydrated ? total : 0)}</p>
          </div>
          <button type="submit" disabled={sending || !hydrated || items.length === 0} className="btn-shine ml-auto flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-akua-whatsapp text-[14.5px] font-semibold text-akua-white disabled:opacity-60">
            {sending ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <WhatsAppIcon size={19} />}
            Envoyer la commande
          </button>
        </div>
      </div>
    </form>
  );
}

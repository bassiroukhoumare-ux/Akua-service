"use client";

import { ArrowDown, ArrowUp, Check, Clock, Copy, ExternalLink, Globe2, Loader2, LockKeyhole, LockKeyholeOpen, MapPin, Navigation, Plus, Send, Store, Trash2, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Flag } from "@/components/ui/flag";
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, XIcon, YouTubeIcon } from "@/components/ui/social-icons";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { btn } from "@/lib/btn";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import {
  coordsFromText,
  DAY_NAMES,
  isOpenNow,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  type ShopSettings,
  type SocialLink,
  type SocialNetwork,
  summarizeHours,
  useAdminSettings,
  WEEK_ORDER,
} from "@/store/admin-settings";
import { useAdmin } from "../actor-context";
import { Field, inputCls, Toggle } from "../form";
import { DemoNotice, PageHeader } from "../ui";

const NETWORKS: Record<SocialNetwork, { label: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }> = {
  facebook: { label: "Facebook", icon: FacebookIcon, placeholder: "https://www.facebook.com/…" },
  instagram: { label: "Instagram", icon: InstagramIcon, placeholder: "https://www.instagram.com/…" },
  tiktok: { label: "TikTok", icon: TikTokIcon, placeholder: "https://www.tiktok.com/@…" },
  youtube: { label: "YouTube", icon: YouTubeIcon, placeholder: "https://www.youtube.com/@…" },
  x: { label: "X (Twitter)", icon: XIcon, placeholder: "https://x.com/…" },
  linkedin: { label: "LinkedIn", icon: LinkedInIcon, placeholder: "https://www.linkedin.com/company/…" },
  snapchat: { label: "Snapchat", icon: ({ className }) => <Globe2 className={className} />, placeholder: "https://www.snapchat.com/add/…" },
  telegram: { label: "Telegram", icon: ({ className }) => <Send className={className} />, placeholder: "https://t.me/…" },
  other: { label: "Autre", icon: ({ className }) => <Globe2 className={className} />, placeholder: "https://…" },
};

function Section({ icon: Icon, title, description, children }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-akua-page">
          <Icon className="size-5 text-akua-ink" strokeWidth={1.7} />
        </span>
        <div>
          <h2 className="text-[16.5px] font-bold">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-akua-gray-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

const digits = (s: string) => s.replace(/\D/g, "");

type Errors = Partial<Record<string, string>>;

function validate(s: ShopSettings): Errors {
  const e: Errors = {};
  if (s.name.trim().length < 2) e.name = "Indiquez le nom de la boutique.";
  if (digits(s.whatsapp).length < 8) e.whatsapp = "Numéro WhatsApp incomplet (avec l'indicatif, ex. +228…).";
  if (s.email && !/^\S+@\S+\.\S+$/.test(s.email)) e.email = "Adresse e-mail invalide.";
  if (!Number.isFinite(s.lat) || Math.abs(s.lat) > 90 || !Number.isFinite(s.lng) || Math.abs(s.lng) > 180) e.coords = "Position invalide.";
  s.hours.forEach((h) => {
    if (h.open && h.from >= h.to) e[`h${h.day}`] = "L'heure de fermeture doit être après l'ouverture.";
  });
  s.socials.forEach((so) => {
    if (so.url && !/^https:\/\/\S+\.\S+/.test(so.url)) e[`s${so.id}`] = "Adresse complète attendue, commençant par https://";
    if (so.network === "other" && so.url && !so.label.trim()) e[`s${so.id}`] = "Indiquez le nom du réseau.";
  });
  return e;
}

export function SettingsView() {
  const hydrated = useHydrated();
  const { actor, base } = useAdmin();
  const saved = useAdminSettings((s) => s.settings);
  const save = useAdminSettings((s) => s.save);
  const [s, setS] = useState<ShopSettings>(saved);
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState("");
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState("");

  useEffect(() => {
    if (hydrated) setS(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const dirty = JSON.stringify(s) !== JSON.stringify(saved);
  const set = <K extends keyof ShopSettings>(k: K, v: ShopSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const summary = useMemo(() => summarizeHours(s.hours), [s.hours]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const open = isOpenNow(s.hours, now);

  async function locate() {
    const link = s.mapsLink.trim();
    if (!link) return setLocMsg("Collez d'abord le lien de partage Google Maps de la boutique.");
    setLocMsg("");
    const direct = coordsFromText(link);
    if (direct) {
      setS((x) => ({ ...x, ...direct }));
      return setLocMsg("Position récupérée.");
    }
    setLocating(true);
    try {
      const r = await fetch(`${base}/api/maps?url=${encodeURIComponent(link)}`);
      const data = (await r.json()) as { url?: string; error?: string };
      const c = data.url ? coordsFromText(data.url) : null;
      if (c) {
        setS((x) => ({ ...x, ...c }));
        setLocMsg("Position récupérée depuis le lien.");
      } else setLocMsg(data.error ?? "Position introuvable dans ce lien. Saisissez la latitude et la longitude ci-dessous.");
    } catch {
      setLocMsg("Impossible de lire ce lien. Saisissez la latitude et la longitude ci-dessous.");
    } finally {
      setLocating(false);
    }
  }

  function setDay(day: number, patch: Partial<ShopSettings["hours"][number]>) {
    set(
      "hours",
      s.hours.map((h) => (h.day === day ? { ...h, ...patch } : h)),
    );
  }
  function copyMonday() {
    const mon = s.hours.find((h) => h.day === 1)!;
    set(
      "hours",
      s.hours.map((h) => (h.open && h.day !== 1 ? { ...h, from: mon.from, to: mon.to } : h)),
    );
  }

  const setSocial = (id: string, patch: Partial<SocialLink>) => set("socials", s.socials.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const moveSocial = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= s.socials.length) return;
    const list = [...s.socials];
    [list[i], list[j]] = [list[j], list[i]];
    set("socials", list);
  };
  const addSocial = (network: SocialNetwork) => set("socials", [...s.socials, { id: `so-${Date.now().toString(36)}`, network, label: network === "other" ? "" : NETWORKS[network].label, url: "" }]);
  const unused = (Object.keys(NETWORKS) as SocialNetwork[]).filter((n) => n === "other" || !s.socials.some((x) => x.network === n));

  function submit() {
    const e = validate(s);
    setErrors(e);
    if (Object.keys(e).length) {
      const k = Object.keys(e)[0];
      document.getElementById(`set-${k}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const changed: string[] = [];
    if (s.whatsapp !== saved.whatsapp) changed.push("numéro WhatsApp");
    if (JSON.stringify(s.hours) !== JSON.stringify(saved.hours)) changed.push("horaires");
    if (s.lat !== saved.lat || s.lng !== saved.lng || s.mapsLink !== saved.mapsLink) changed.push("localisation");
    if (JSON.stringify(s.socials) !== JSON.stringify(saved.socials)) changed.push("réseaux sociaux");
    if (JSON.stringify(s.delivery) !== JSON.stringify(saved.delivery) || s.deliveryOthers !== saved.deliveryOthers) changed.push("livraison");
    save(s, actor, changed.join(" · ") || undefined);
    setToast("Paramètres enregistrés.");
    window.setTimeout(() => setToast(""), 3000);
  }

  if (!hydrated) return <div className="h-[60vh] animate-pulse rounded-[24px] bg-akua-white" />;

  const waDigits = digits(s.whatsapp);
  const deliveryList = s.delivery.filter((c) => c.enabled);

  return (
    <div className="flex flex-col gap-5 pb-24 md:gap-6">
      <PageHeader title="Paramètres" description="Coordonnées, horaires, localisation, réseaux sociaux et pays de livraison de la boutique." />
      <DemoNotice>Vos réglages sont gardés dans ce navigateur pour tester le design. Ils s&apos;appliqueront à tout le site (en-tête, pied de page, contact, commandes) dès que la base de données sera branchée.</DemoNotice>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          {/* boutique */}
          <Section icon={Store} title="Boutique">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="set-name" label="Nom de la boutique" error={errors.name}>
                <input id="set-name" value={s.name} onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} />
              </Field>
              <Field label="Slogan">
                <input value={s.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls()} />
              </Field>
              <Field label="Adresse affichée" hint="Ex. « Lomé, Togo » ou le quartier de la boutique.">
                <input value={s.address} onChange={(e) => set("address", e.target.value)} className={inputCls()} />
              </Field>
              <Field id="set-email" label="E-mail de contact" optional error={errors.email}>
                <input id="set-email" type="email" value={s.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@…" className={inputCls(errors.email)} />
              </Field>
            </div>
          </Section>

          {/* WhatsApp */}
          <Section icon={() => <WhatsAppIcon size={20} variant="color" />} title="WhatsApp" description="Le numéro qui reçoit les commandes, les devis et les messages du site.">
            <Field id="set-whatsapp" label="Numéro WhatsApp" error={errors.whatsapp} hint="Avec l'indicatif du pays.">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input id="set-whatsapp" type="tel" inputMode="tel" value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={cn(inputCls(errors.whatsapp), "sm:max-w-[300px]")} />
                {waDigits.length >= 8 && (
                  <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener" className={btn({ variant: "outline", size: "md", className: "h-12" })}>
                    <ExternalLink aria-hidden className="size-4" /> Tester le lien
                  </a>
                )}
              </div>
            </Field>
          </Section>

          {/* localisation */}
          <Section icon={MapPin} title="Localisation" description="Collez le lien de partage Google Maps de la boutique : la carte et l'itinéraire du site s'y adaptent automatiquement.">
            <div className="grid gap-4">
              <Field label="Lien Google Maps" hint="Dans Google Maps : touchez l'épingle de la boutique › Partager › Copier le lien.">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={s.mapsLink} onChange={(e) => (set("mapsLink", e.target.value), setLocMsg(""))} placeholder="https://maps.app.goo.gl/…" inputMode="url" className={inputCls()} />
                  <button type="button" onClick={locate} disabled={locating} className={btn({ variant: "dark", size: "md", className: "h-12" })}>
                    {locating ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <MapPin aria-hidden className="size-4" />} Récupérer la position
                  </button>
                </div>
              </Field>
              {locMsg && <p className={cn("-mt-2 text-[12.5px] font-medium", /récupérée/.test(locMsg) ? "text-[#128c4a]" : "text-akua-red")}>{locMsg}</p>}
              <div id="set-coords" className="grid grid-cols-2 gap-3 sm:max-w-[420px]">
                <Field label="Latitude">
                  <input inputMode="decimal" value={String(s.lat)} onChange={(e) => set("lat", Number(e.target.value.replace(",", ".")))} className={inputCls(errors.coords)} />
                </Field>
                <Field label="Longitude">
                  <input inputMode="decimal" value={String(s.lng)} onChange={(e) => set("lng", Number(e.target.value.replace(",", ".")))} className={inputCls(errors.coords)} />
                </Field>
              </div>
              {errors.coords && <p className="-mt-2 text-[12.5px] font-medium text-akua-red">{errors.coords}</p>}
              <div className="overflow-hidden rounded-[18px] border border-akua-gray-200">
                {Number.isFinite(s.lat) && Number.isFinite(s.lng) && <iframe key={`${s.lat},${s.lng}`} src={mapsEmbedUrl(s.lat, s.lng)} title="Aperçu de la carte" loading="lazy" className="block h-[260px] w-full border-0 bg-akua-page" />}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-akua-gray-200 px-4 py-3">
                  <p className="text-[13px] text-akua-gray-500">Aperçu de la carte de la page Contact</p>
                  <a href={mapsDirectionsUrl(s.lat, s.lng)} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-akua-blue">
                    <Navigation aria-hidden className="size-4" /> Tester l&apos;itinéraire
                  </a>
                </div>
              </div>
            </div>
          </Section>

          {/* horaires */}
          <Section icon={Clock} title="Horaires d'ouverture" description="Affichés sur la page Contact, avec l'indication « Ouvert » ou « Fermé » en temps réel.">
            <ul className="flex flex-col divide-y divide-akua-gray-200">
              {WEEK_ORDER.map((day) => {
                const h = s.hours.find((x) => x.day === day)!;
                const err = errors[`h${day}`];
                return (
                  <li key={day} id={`set-h${day}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
                    <span className="w-[92px] text-[14.5px] font-semibold">{DAY_NAMES[day]}</span>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-akua-gray-500">
                      <input type="checkbox" role="switch" checked={h.open} onChange={(e) => setDay(day, { open: e.target.checked })} className="peer sr-only" />
                      <span aria-hidden className={cn("relative h-6 w-10 rounded-full transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-akua-blue/25", h.open ? "bg-akua-blue" : "bg-akua-gray-200")}>
                        <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-akua-white shadow transition-transform", h.open && "translate-x-4")} />
                      </span>
                      <span className="w-12">{h.open ? "Ouvert" : "Fermé"}</span>
                    </label>
                    {h.open ? (
                      <span className="flex items-center gap-2">
                        <input type="time" value={h.from} onChange={(e) => setDay(day, { from: e.target.value })} aria-label={`${DAY_NAMES[day]} : ouverture`} className={cn(inputCls(err), "h-10 w-[112px] px-3")} />
                        <span className="text-akua-gray-500">–</span>
                        <input type="time" value={h.to} onChange={(e) => setDay(day, { to: e.target.value })} aria-label={`${DAY_NAMES[day]} : fermeture`} className={cn(inputCls(err), "h-10 w-[112px] px-3")} />
                      </span>
                    ) : (
                      <span className="text-[13px] text-akua-gray-500">Fermé toute la journée</span>
                    )}
                    {err && <p className="w-full text-[12.5px] font-medium text-akua-red">{err}</p>}
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={copyMonday} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-akua-blue">
              <Copy aria-hidden className="size-3.5" /> Appliquer les horaires du lundi à tous les jours ouverts
            </button>
          </Section>

          {/* réseaux sociaux */}
          <Section icon={Globe2} title="Réseaux sociaux" description="Affichés dans le pied de page du site. Un réseau sans adresse n'est pas affiché.">
            <ul className="flex flex-col gap-3">
              {s.socials.map((so, i) => {
                const N = NETWORKS[so.network];
                const err = errors[`s${so.id}`];
                return (
                  <li key={so.id} id={`set-s${so.id}`} className="rounded-[18px] border border-akua-gray-200 p-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", so.url ? "bg-akua-ink text-akua-white" : "bg-akua-page text-akua-gray-500")}>
                        <N.icon className="size-[18px]" />
                      </span>
                      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[170px_minmax(0,1fr)]">
                        {so.network === "other" ? (
                          <input value={so.label} onChange={(e) => setSocial(so.id, { label: e.target.value })} placeholder="Nom du réseau" aria-label="Nom du réseau" className={cn(inputCls(), "h-10 text-[14px]")} />
                        ) : (
                          <span className="flex h-10 items-center text-[14.5px] font-semibold">{N.label}</span>
                        )}
                        <input value={so.url} onChange={(e) => setSocial(so.id, { url: e.target.value.trim() })} placeholder={N.placeholder} inputMode="url" aria-label={`Lien ${so.label || N.label}`} className={cn(inputCls(err), "h-10 text-[14px]")} />
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        <button type="button" onClick={() => moveSocial(i, -1)} disabled={i === 0} aria-label="Monter" className="hidden size-8 place-items-center rounded-full hover:bg-akua-page disabled:opacity-30 sm:grid">
                          <ArrowUp aria-hidden className="size-4" />
                        </button>
                        <button type="button" onClick={() => moveSocial(i, 1)} disabled={i === s.socials.length - 1} aria-label="Descendre" className="hidden size-8 place-items-center rounded-full hover:bg-akua-page disabled:opacity-30 sm:grid">
                          <ArrowDown aria-hidden className="size-4" />
                        </button>
                        <button type="button" onClick={() => set("socials", s.socials.filter((x) => x.id !== so.id))} aria-label={`Retirer ${so.label || N.label}`} className="grid size-8 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-red/5 hover:text-akua-red">
                          <Trash2 aria-hidden className="size-4" />
                        </button>
                      </div>
                    </div>
                    {err && <p className="mt-2 pl-[52px] text-[12.5px] font-medium text-akua-red">{err}</p>}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[13px] font-medium text-akua-gray-500">Ajouter :</span>
              {unused.map((n) => {
                const N = NETWORKS[n];
                return (
                  <button key={n} type="button" onClick={() => addSocial(n)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-akua-gray-200 px-3 text-[13px] font-semibold transition-colors hover:border-akua-ink">
                    <Plus aria-hidden className="size-3.5" /> <N.icon className="size-3.5" /> {N.label}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* livraison */}
          <Section icon={Truck} title="Pays de livraison" description="Proposés dans le panier et affichés dans le pied de page.">
            <div className="flex flex-wrap gap-2">
              {s.delivery.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  aria-pressed={c.enabled}
                  onClick={() => set("delivery", s.delivery.map((x) => (x.code === c.code ? { ...x, enabled: !x.enabled } : x)))}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13.5px] font-semibold transition-colors",
                    c.enabled ? "border-akua-blue bg-akua-blue-100 text-akua-ink" : "border-akua-gray-200 text-akua-gray-500 hover:border-akua-ink",
                  )}
                >
                  <Flag code={c.code} className={cn(!c.enabled && "opacity-40 grayscale")} /> {c.name}
                  {c.enabled && <Check aria-hidden className="size-3.5 text-akua-blue" strokeWidth={3} />}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Toggle checked={s.deliveryOthers} onChange={(v) => set("deliveryOthers", v)} label="Afficher « et autres pays »" description="Pour indiquer que vous livrez aussi d'autres pays sur demande." />
            </div>
          </Section>
        </div>

        {/* aperçu */}
        <aside className="flex flex-col gap-4 xl:sticky xl:top-[96px]">
          <div className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Horaires sur le site</p>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold", open ? "bg-akua-whatsapp/12 text-[#128c4a]" : "bg-akua-red/10 text-akua-red")}>
                {open ? <LockKeyholeOpen aria-hidden className="size-3.5" /> : <LockKeyhole aria-hidden className="size-3.5" />} {open ? "Ouvert actuellement" : "Fermé actuellement"}
              </span>
            </div>
            <ul className="mt-3 divide-y divide-akua-gray-200">
              {summary.map((g) => (
                <li key={g.days} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-[14px] font-semibold">{g.days}</span>
                  <span className={cn("text-[14px] font-bold", g.hours === "Fermé" ? "text-akua-red" : "text-akua-blue")}>{g.hours}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5">
            <p className="text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Pied de page</p>
            <p className="mt-3 text-[12.5px] font-semibold">Nous livrons :</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {deliveryList.map((c) => (
                <span key={c.code} className="inline-flex items-center gap-1.5 rounded-full bg-akua-page px-2.5 py-1 text-[12px] font-medium">
                  <Flag code={c.code} /> {c.name}
                </span>
              ))}
              {s.deliveryOthers && <span className="inline-flex items-center gap-1.5 rounded-full bg-akua-page px-2.5 py-1 text-[12px] font-medium text-akua-gray-500">et autres pays</span>}
            </div>
            <p className="mt-4 text-[12.5px] font-semibold">Suivez-nous :</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {s.socials.filter((x) => x.url).length === 0 && <span className="text-[12.5px] text-akua-gray-500">Aucun réseau renseigné.</span>}
              {s.socials
                .filter((x) => x.url)
                .map((so) => {
                  const N = NETWORKS[so.network];
                  return (
                    <a key={so.id} href={so.url} target="_blank" rel="noopener" title={so.label || N.label} className="grid size-9 place-items-center rounded-full bg-akua-ink text-akua-white">
                      <N.icon className="size-4" />
                    </a>
                  );
                })}
            </div>
            <p className="mt-4 text-[12.5px] font-semibold">Contact</p>
            <p className="mt-1 text-[13px] text-akua-gray-500">
              {s.whatsapp} · {s.address}
              {s.email ? ` · ${s.email}` : ""}
            </p>
          </div>
        </aside>
      </div>

      {/* barre d'enregistrement */}
      <div className={cn("fixed inset-x-0 bottom-0 z-30 border-t border-akua-gray-200 bg-akua-white/95 backdrop-blur transition-transform duration-300 lg:left-[272px]", dirty ? "translate-y-0" : "translate-y-full")}>
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-8">
          <p className="text-[13.5px] font-medium text-akua-gray-500">Modifications non enregistrées</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => (setS(saved), setErrors({}))} className={btn({ variant: "outline", size: "md" })}>
              Annuler
            </button>
            <button type="button" onClick={submit} className={btn({ variant: "primary", size: "md" })}>
              <Check aria-hidden className="size-4" /> Enregistrer
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-akua-ink px-5 py-3 text-[14px] font-semibold text-akua-white shadow-[0_20px_40px_-16px_rgb(7_8_12/0.6)]">
          <Check aria-hidden className="size-[18px] text-akua-whatsapp" /> {toast}
        </div>
      )}
    </div>
  );
}

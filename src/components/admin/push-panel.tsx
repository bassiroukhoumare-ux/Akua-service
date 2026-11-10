"use client";

import { Bell, BellOff, BellRing, Check, Download, Heart, MessageSquareText, Receipt, Send, Share, ShoppingBag, Smartphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Kind = "orders" | "reviews" | "carts" | "favorites";
type Prefs = Record<Kind, boolean>;

const KINDS: { id: Kind; label: string; hint: string; icon: typeof Bell }[] = [
  { id: "orders", label: "Nouvelles commandes", hint: "Aussitôt reçue : numéro, client, montant", icon: Receipt },
  { id: "reviews", label: "Nouveaux avis", hint: "Aussitôt publié : note et début du commentaire", icon: MessageSquareText },
  { id: "carts", label: "Paniers à relancer", hint: "Chaque matin : paniers enregistrés depuis plus de 24 h", icon: ShoppingBag },
  { id: "favorites", label: "Favoris de la semaine", hint: "Chaque lundi matin : produits les plus ajoutés", icon: Heart },
];

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// l'invitation à installer l'application arrive tôt : on la garde dès le chargement
let deferredInstall: InstallEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstall = e as InstallEvent;
    window.dispatchEvent(new Event("akua:installable"));
  });
}

const urlB64 = (b64: string) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

async function swRegistration() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

/** Activation des notifications push sur cet appareil (téléphone ou ordinateur) du propriétaire. */
export function PushPanel() {
  const [support, setSupport] = useState<"checking" | "ok" | "ios-install" | "none">("checking");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>({ orders: true, reviews: true, carts: true, favorites: true });
  const [devices, setDevices] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [installable, setInstallable] = useState(false);
  const [standalone, setStandalone] = useState(false);

  const refresh = useCallback(async () => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const alone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setStandalone(alone);
    setInstallable(!!deferredInstall);
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setSupport(ios && !alone ? "ios-install" : "none");
      return;
    }
    setSupport("ok");
    setPermission(Notification.permission);
    const reg = await swRegistration();
    const sub = await reg.pushManager.getSubscription();
    setEndpoint(sub?.endpoint ?? null);
    const res = await fetch(`/spaceakua/api/push${sub ? `?endpoint=${encodeURIComponent(sub.endpoint)}` : ""}`, { cache: "no-store" }).catch(() => null);
    if (res?.ok) {
      const d = (await res.json()) as { subscribed: boolean; prefs: Prefs; devices: number };
      setDevices(d.devices);
      if (sub && d.subscribed) setPrefs(d.prefs);
      // abonnement présent dans le navigateur mais inconnu du serveur : on le renvoie
      if (sub && !d.subscribed) await fetch("/spaceakua/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON(), prefs }) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refresh();
    const on = () => setInstallable(true);
    window.addEventListener("akua:installable", on);
    return () => window.removeEventListener("akua:installable", on);
  }, [refresh]);

  const flash = (ok: boolean, text: string) => {
    setMsg({ ok, text });
    window.setTimeout(() => setMsg(null), 5000);
  };

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        flash(false, "Notifications refusées. Autorisez-les dans les réglages du navigateur pour ce site, puis réessayez.");
        return;
      }
      const reg = await swRegistration();
      await navigator.serviceWorker.ready;
      const { publicKey } = (await (await fetch("/spaceakua/api/push", { cache: "no-store" })).json()) as { publicKey: string };
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(publicKey) }));
      const res = await fetch("/spaceakua/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON(), prefs }) });
      if (!res.ok) throw new Error();
      setEndpoint(sub.endpoint);
      await fetch("/spaceakua/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ test: true, endpoint: sub.endpoint }) });
      flash(true, "Notifications activées sur cet appareil. Une notification de bienvenue vient d'être envoyée.");
      void refresh();
    } catch {
      flash(false, "L'activation n'a pas abouti. Vérifiez votre connexion et réessayez.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/spaceakua/api/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
      await sub.unsubscribe().catch(() => {});
    }
    setEndpoint(null);
    setBusy(false);
    flash(true, "Notifications désactivées sur cet appareil.");
    void refresh();
  }

  async function savePrefs(next: Prefs) {
    setPrefs(next);
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) await fetch("/spaceakua/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON(), prefs: next }) }).catch(() => {});
  }

  async function test() {
    if (!endpoint) return;
    setBusy(true);
    const res = await fetch("/spaceakua/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ test: true, endpoint }) }).catch(() => null);
    const sent = res?.ok ? ((await res.json()) as { sent: number }).sent : 0;
    setBusy(false);
    flash(sent > 0, sent > 0 ? "Notification de test envoyée : elle arrive dans quelques secondes." : "L'envoi a échoué. Désactivez puis réactivez les notifications.");
  }

  async function install() {
    if (!deferredInstall) return;
    await deferredInstall.prompt();
    await deferredInstall.userChoice.catch(() => null);
    deferredInstall = null;
    setInstallable(false);
    void refresh();
  }

  const on = !!endpoint && permission === "granted";

  return (
    <section id="notifications" className="scroll-mt-28 overflow-hidden rounded-[26px] border border-akua-gray-200/90 bg-akua-white shadow-[0_1px_2px_rgb(11_16_32/0.03),0_14px_34px_-28px_rgb(11_16_32/0.22)]">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between md:p-6">
        <div className="flex items-start gap-3.5">
          {on ? <BellRing aria-hidden className="mt-0.5 size-7 shrink-0 text-akua-blue" strokeWidth={1.6} /> : <Bell aria-hidden className="mt-0.5 size-7 shrink-0 text-akua-ink" strokeWidth={1.6} />}
          <div>
            <h2 className="text-[17px] font-bold">Notifications sur cet appareil</h2>
            <p className="mt-0.5 max-w-xl text-[13.5px] text-akua-gray-500">
              Recevez une notification avec le logo AKUA Service à chaque nouvelle commande ou nouvel avis, et des rappels pour les paniers et les favoris. Un toucher ouvre directement la bonne page.
            </p>
            <p className={cn("mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold", on ? "text-akua-blue" : "text-akua-gray-500")}>
              <span className={cn("size-2 rounded-full", on ? "bg-akua-blue" : "bg-akua-gray-200")} />
              {on ? "Activées sur cet appareil" : "Désactivées sur cet appareil"}
              {devices > 0 && <span className="font-medium text-akua-gray-500"> · {devices} appareil{devices > 1 ? "s" : ""} au total</span>}
            </p>
          </div>
        </div>
        {support === "ok" && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {on ? (
              <>
                <button type="button" onClick={() => void test()} disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-full bg-akua-ink px-5 text-[14px] font-semibold text-akua-white hover:bg-akua-blue disabled:opacity-60">
                  <Send aria-hidden className="size-4" /> Tester
                </button>
                <button type="button" onClick={() => void disable()} disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-full border border-akua-gray-200 px-5 text-[14px] font-semibold hover:border-akua-ink disabled:opacity-60">
                  <BellOff aria-hidden className="size-4" /> Désactiver
                </button>
              </>
            ) : (
              <button type="button" onClick={() => void enable()} disabled={busy || permission === "denied"} className="inline-flex h-11 items-center gap-2 rounded-full bg-akua-blue px-5 text-[14px] font-semibold text-akua-white hover:bg-akua-blue-600 disabled:opacity-50">
                <Bell aria-hidden className="size-4" /> {busy ? "Activation…" : "Activer les notifications"}
              </button>
            )}
          </div>
        )}
      </div>

      {msg && <p className={cn("mx-5 mb-4 rounded-[14px] px-4 py-3 text-[13.5px] font-medium md:mx-6", msg.ok ? "bg-akua-blue-100 text-akua-blue" : "bg-akua-red/8 text-akua-red")}>{msg.text}</p>}

      {support === "ok" && permission === "denied" && (
        <p className="mx-5 mb-4 rounded-[14px] bg-akua-red/8 px-4 py-3 text-[13.5px] text-akua-red md:mx-6">
          Les notifications sont bloquées pour ce site. Ouvrez les réglages du navigateur (icône à gauche de l&apos;adresse, ou Réglages du téléphone), autorisez les notifications, puis revenez ici.
        </p>
      )}

      {support === "ios-install" && (
        <div className="mx-5 mb-5 rounded-[18px] bg-akua-page p-4 text-[13.5px] md:mx-6">
          <p className="font-semibold">Sur iPhone, installez d&apos;abord l&apos;application :</p>
          <ol className="mt-2 flex flex-col gap-1.5 text-akua-gray-500">
            <li className="flex items-center gap-2">
              1. Touchez <Share aria-hidden className="inline size-4 text-akua-ink" /> Partager dans Safari
            </li>
            <li>2. Choisissez « Sur l&apos;écran d&apos;accueil »</li>
            <li>3. Ouvrez AKUA Admin depuis l&apos;écran d&apos;accueil et revenez ici</li>
          </ol>
        </div>
      )}
      {support === "none" && <p className="mx-5 mb-5 rounded-[14px] bg-akua-page px-4 py-3 text-[13.5px] text-akua-gray-500 md:mx-6">Ce navigateur ne gère pas les notifications. Utilisez Chrome (Android, ordinateur) ou Safari (iPhone, application installée).</p>}

      {/* installer l'application */}
      {support !== "none" && !standalone && (
        <div className="mx-5 mb-5 flex flex-col gap-3 rounded-[18px] border border-dashed border-akua-gray-200 p-4 sm:flex-row sm:items-center md:mx-6">
          <Smartphone aria-hidden className="size-6 shrink-0 text-akua-ink" strokeWidth={1.6} />
          <p className="flex-1 text-[13.5px]">
            <span className="font-semibold">Installez AKUA Admin sur votre téléphone</span>
            <span className="block text-akua-gray-500">L&apos;espace s&apos;ouvre comme une application, avec son icône, et les notifications arrivent même téléphone verrouillé.</span>
          </p>
          {installable ? (
            <button type="button" onClick={() => void install()} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-akua-ink px-4 text-[13.5px] font-semibold text-akua-white hover:bg-akua-blue">
              <Download aria-hidden className="size-4" /> Installer
            </button>
          ) : (
            <span className="text-[12.5px] text-akua-gray-500 sm:max-w-[220px]">Menu du navigateur → « Installer l&apos;application » ou « Ajouter à l&apos;écran d&apos;accueil »</span>
          )}
        </div>
      )}
      {standalone && (
        <p className="mx-5 mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-akua-blue md:mx-6">
          <Check aria-hidden className="size-4" /> Application installée
        </p>
      )}

      {/* types de notifications */}
      {on && (
        <ul className="grid border-t border-akua-gray-200 sm:grid-cols-2">
          {KINDS.map((k, i) => (
            <li key={k.id} className={cn("border-akua-gray-200", i % 2 === 0 && "sm:border-r", i < 2 && "border-b", i === 2 && "border-b sm:border-b-0")}>
              <label className="flex cursor-pointer items-center gap-3 p-4 md:px-6">
                <k.icon aria-hidden className="size-5 shrink-0 text-akua-ink" strokeWidth={1.7} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{k.label}</span>
                  <span className="block text-[12.5px] text-akua-gray-500">{k.hint}</span>
                </span>
                <input type="checkbox" role="switch" checked={prefs[k.id]} onChange={(e) => void savePrefs({ ...prefs, [k.id]: e.target.checked })} className="peer sr-only" />
                <span aria-hidden className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-akua-blue/25", prefs[k.id] ? "bg-akua-blue" : "bg-akua-gray-200")}>
                  <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-akua-white shadow transition-transform", prefs[k.id] && "translate-x-5")} />
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

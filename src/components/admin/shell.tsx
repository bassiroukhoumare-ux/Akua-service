"use client";

import { AlertTriangle, ArrowUpRight, Check, ChevronDown, KeyRound, Loader2, LogOut, Menu, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { ADMIN_CURRENT_STEP, ADMIN_GROUPS, type AdminModuleId, moduleHref } from "@/config/admin";
import { PORTAL_BASE, type PortalKind } from "@/config/admin-base";
import type { Perms } from "@/config/permissions";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { Actor } from "@/store/admin-catalog";
import { AdminProvider } from "./actor-context";
import { useNotifications } from "./use-notifications";
import { PageTransition } from "./page-transition";
import { useSaveState, useStoresReady } from "./use-stores-ready";

const TODAY = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

const isActive = (path: string, href: string, base: string) => (href === base ? path === base : path === href || path.startsWith(`${href}/`));

export interface ShellUser {
  name: string;
  /** ligne sous le nom : « Accès complet », « 3 modules »… */
  role: string;
}

/** groupes de modules visibles : tous pour le propriétaire, seulement les modules attribués pour un équipier */
function visibleGroups(allowed?: AdminModuleId[]) {
  if (!allowed) return ADMIN_GROUPS;
  return ADMIN_GROUPS.map((g) => ({ ...g, modules: g.modules.filter((m) => m.id === "dashboard" || (!m.ownerOnly && allowed.includes(m.id))) })).filter((g) => g.modules.length);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Nav({ base, allowed, onNavigate, badges }: { base: string; allowed?: AdminModuleId[]; onNavigate?: () => void; badges?: Partial<Record<AdminModuleId, number>> }) {
  const path = usePathname() ?? "";
  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-6">
      {visibleGroups(allowed).map((g) => (
        <div key={g.label}>
          <p className="px-3 text-[10.5px] font-bold tracking-[0.16em] text-akua-gray-500/70 uppercase">{g.label}</p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {g.modules.map((m) => {
              const href = moduleHref(base, m);
              const active = isActive(path, href, base);
              const soon = m.step > ADMIN_CURRENT_STEP;
              return (
                <li key={m.id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-11 items-center gap-3 rounded-[14px] px-2 text-[13.5px] font-medium transition-all duration-200",
                      active ? "bg-akua-ink text-akua-white shadow-[0_12px_24px_-14px_rgb(11_16_32/0.8)]" : "text-akua-ink hover:bg-akua-page",
                    )}
                  >
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-[9px] transition-colors", active ? "bg-akua-white/12" : "bg-transparent group-hover:bg-akua-white")}>
                      <m.icon aria-hidden className={cn("size-[17px] transition-colors", active ? "text-akua-white" : "text-akua-gray-500 group-hover:text-akua-blue")} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{m.label}</span>
                    {!!badges?.[m.id] && (
                      <span aria-label={`${badges[m.id]} nouveau${badges[m.id]! > 1 ? "x" : ""}`} className={cn("grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[11px] leading-none font-bold tabular-nums", active ? "bg-akua-white text-akua-ink" : "bg-akua-red text-akua-white")}>
                        {badges[m.id]! > 99 ? "99+" : badges[m.id]}
                      </span>
                    )}
                    {soon && (
                      <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold", active ? "bg-akua-white/15 text-akua-white" : "bg-akua-page text-akua-gray-500")}>
                        Étape {m.step}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function UserMenu({ kind, user, compact }: { kind: PortalKind; user: ShellUser; compact?: boolean }) {
  const base = PORTAL_BASE[kind];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch(`${base}/api/session`, { method: "DELETE" });
    router.replace(`${base}/connexion`);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn("flex items-center gap-2.5 text-left transition-colors", compact ? "rounded-full p-1 hover:bg-akua-page" : "w-full rounded-[18px] bg-akua-page/70 p-2 pr-3 ring-1 ring-akua-gray-200/70 hover:bg-akua-page")}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-akua-blue to-[#5b82ff] text-[13px] font-bold text-akua-white shadow-[0_6px_14px_-6px_rgb(31_91_255/0.8)] ring-2 ring-akua-white">{initials(user.name)}</span>
        {!compact && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold">{user.name}</span>
            <span className="block truncate text-[12px] text-akua-gray-500">{user.role}</span>
          </span>
        )}
        {!compact && <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-akua-gray-500 transition-transform", open && "rotate-180")} />}
      </button>
      {open && (
        <>
          <button type="button" aria-label="Fermer le menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className={cn(
              "absolute z-50 w-56 overflow-hidden rounded-[18px] border border-akua-gray-200 bg-akua-white p-1.5 shadow-[0_24px_60px_-24px_rgb(11_16_32/0.35)]",
              compact ? "top-full right-0 mt-2" : "bottom-full left-0 mb-2",
            )}
          >
            <Link role="menuitem" href="/" target="_blank" className="flex h-10 items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium hover:bg-akua-page">
              <ArrowUpRight aria-hidden className="size-4 text-akua-gray-500" /> Voir le site
            </Link>
            {kind === "team" && (
              <Link role="menuitem" href={`${base}/mot-de-passe`} onClick={() => setOpen(false)} className="flex h-10 items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium hover:bg-akua-page">
                <KeyRound aria-hidden className="size-4 text-akua-gray-500" /> Changer mon mot de passe
              </Link>
            )}
            <button role="menuitem" type="button" onClick={logout} disabled={busy} className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium text-akua-red hover:bg-akua-red/5 disabled:opacity-60">
              <LogOut aria-hidden className="size-4" /> {busy ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Téléphone, portail équipe : navigation en bas de l'écran (accueil + modules attribués, « Plus » au-delà). */
const OWNER_SHORTCUTS: AdminModuleId[] = ["dashboard", "orders", "products", "stats"];

function BottomNav({ base, allowed, onMore, badges, owner }: { base: string; allowed?: AdminModuleId[]; onMore: () => void; badges?: Partial<Record<AdminModuleId, number>>; owner?: boolean }) {
  const path = usePathname() ?? "";
  const all = visibleGroups(allowed).flatMap((g) => g.modules);
  const mods = owner ? [...OWNER_SHORTCUTS.map((id) => all.find((m) => m.id === id)!).filter(Boolean), ...all.filter((m) => !OWNER_SHORTCUTS.includes(m.id))] : all;
  const max = owner ? 4 : mods.length > 5 ? 4 : 5;
  const shown = mods.slice(0, max);
  const more = mods.length > max;
  const moreActive = more && mods.slice(max).some((m) => isActive(path, moduleHref(base, m), base));
  const moreBadge = more ? mods.slice(max).reduce((a, m) => a + (badges?.[m.id] ?? 0), 0) : 0;
  const short: Partial<Record<AdminModuleId, string>> = { dashboard: "Accueil", home: "Vitrine", deals: "Offre", promos: "Promos", settings: "Réglages", categories: "Catégories", stats: "Stats", orders: "Commandes" };
  return (
    <nav aria-label="Navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-akua-gray-200 bg-akua-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto flex max-w-[560px] items-stretch justify-around px-1">
        {shown.map((m) => {
          const href = moduleHref(base, m);
          const active = isActive(path, href, base);
          return (
            <li key={m.id} className="min-w-0 flex-1">
              <Link href={href} aria-current={active ? "page" : undefined} className="flex h-[62px] flex-col items-center justify-center gap-1 px-1">
                <span className={cn("relative grid h-8 w-12 place-items-center rounded-full transition-colors", active ? "bg-akua-ink text-akua-white" : "text-akua-gray-500")}>
                  <m.icon aria-hidden className="size-[20px]" strokeWidth={active ? 2 : 1.7} />
                  {!!badges?.[m.id] && <span className="absolute -top-1 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-akua-red px-1 text-[10.5px] font-bold text-akua-white ring-2 ring-akua-white tabular-nums">{badges[m.id]}</span>}
                </span>
                <span className={cn("max-w-full truncate text-[11px] leading-none", active ? "font-bold text-akua-ink" : "font-medium text-akua-gray-500")}>{short[m.id] ?? m.label}</span>
              </Link>
            </li>
          );
        })}
        {more && (
          <li className="min-w-0 flex-1">
            <button type="button" onClick={onMore} className="flex h-[62px] w-full flex-col items-center justify-center gap-1 px-1">
              <span className={cn("relative grid h-8 w-12 place-items-center rounded-full transition-colors", moreActive ? "bg-akua-ink text-akua-white" : "text-akua-gray-500")}>
                {owner ? <Menu aria-hidden className="size-[20px]" /> : <MoreHorizontal aria-hidden className="size-[20px]" />}
                {moreBadge > 0 && <span className="absolute -top-1 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-akua-red px-1 text-[10.5px] font-bold text-akua-white ring-2 ring-akua-white tabular-nums">{moreBadge}</span>}
              </span>
              <span className={cn("text-[11px] leading-none", moreActive ? "font-bold text-akua-ink" : "font-medium text-akua-gray-500")}>{owner ? "Menu" : "Plus"}</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

/** Indique que les modifications sont bien enregistrées dans la base. */
function SaveIndicator({ state }: { state: "idle" | "saving" | "error" }) {
  const [shown, setShown] = useState<"saving" | "saved" | "error" | null>(null);
  useEffect(() => {
    if (state === "saving") return setShown("saving");
    if (state === "error") return setShown("error");
    setShown((s) => (s === "saving" ? "saved" : s));
    const t = window.setTimeout(() => setShown((s) => (s === "saved" ? null : s)), 2200);
    return () => window.clearTimeout(t);
  }, [state]);
  if (!shown) return null;
  return (
    <span
      role="status"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold whitespace-nowrap",
        shown === "error" ? "bg-akua-red/10 text-akua-red" : shown === "saved" ? "bg-akua-whatsapp/12 text-[#128c4a]" : "bg-akua-page text-akua-gray-500",
      )}
    >
      {shown === "saving" ? <Loader2 aria-hidden className="size-3.5 animate-spin" /> : shown === "saved" ? <Check aria-hidden className="size-3.5" strokeWidth={2.6} /> : <AlertTriangle aria-hidden className="size-3.5" />}
      <span className={cn(shown !== "error" && "hidden sm:inline")}>{shown === "saving" ? "Enregistrement…" : shown === "saved" ? "Enregistré" : "Non enregistré : vérifiez la connexion"}</span>
    </span>
  );
}

/** Cadre de l'espace administrateur : menu latéral (ordinateur), tiroir (mobile), barre du haut. */
export function AdminShell({ kind, user, actor, allowed, perms, children }: { kind: PortalKind; user: ShellUser; actor: Actor; allowed?: AdminModuleId[]; perms?: Perms; children: React.ReactNode }) {
  const base = PORTAL_BASE[kind];
  const path = usePathname() ?? "";
  const [drawer, setDrawer] = useState(false);
  const current = visibleGroups(allowed)
    .flatMap((g) => g.modules)
    .find((m) => isActive(path, moduleHref(base, m), base));
  const portal = kind === "team" ? "Espace équipe" : "Espace administrateur";
  const tag = kind === "team" ? "Équipe" : "Admin";
  // l'espace admin (privé) est dessiné dans le navigateur : catalogue local et dates d'exemple
  // ne peuvent pas différer entre le serveur et l'écran
  const mounted = useHydrated();
  const storesReady = useStoresReady();
  const hydrated = mounted && storesReady;
  const save = useSaveState();
  const badges = useNotifications(base, mounted, current?.id);
  useEffect(() => setDrawer(false), [path]);
  // lien vers un élément précis (#code-…, #cat-…) : on y descend une fois la page affichée
  useEffect(() => {
    if (!hydrated || !window.location.hash) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // brève lueur bleue pour repérer l'élément
      el.animate(
        [
          { boxShadow: "0 0 0 0 rgb(31 91 255 / 0)", backgroundColor: "rgb(232 239 255 / 0)" },
          { boxShadow: "0 0 0 4px rgb(31 91 255 / 0.35)", backgroundColor: "rgb(232 239 255 / 1)", offset: 0.2 },
          { boxShadow: "0 0 0 4px rgb(31 91 255 / 0.35)", backgroundColor: "rgb(232 239 255 / 1)", offset: 0.7 },
          { boxShadow: "0 0 0 0 rgb(31 91 255 / 0)", backgroundColor: "rgb(232 239 255 / 0)" },
        ],
        { duration: 2600, easing: "ease-out", delay: 250 },
      );
    }, 350);
    return () => window.clearTimeout(t);
  }, [hydrated, path]);

  return (
    <div className="min-h-dvh bg-akua-page text-akua-ink">
      {/* menu latéral */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-akua-gray-200 bg-akua-white lg:flex">
        <div className="flex h-[72px] items-center gap-3 px-6">
          <Logo href={base} className="h-9" />
          <span className="rounded-full bg-akua-blue-100 px-2 py-0.5 text-[10.5px] font-bold tracking-[0.08em] text-akua-blue uppercase">{tag}</span>
        </div>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-6">
          <Nav base={base} allowed={allowed} badges={badges} />
        </div>
        <div className="border-t border-akua-gray-200 p-3">
          <UserMenu kind={kind} user={user} />
        </div>
      </aside>

      {/* tiroir mobile */}
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" showCloseButton={false} className="w-[86%] max-w-[320px] gap-0 border-akua-gray-200 bg-akua-white p-0">
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          <div className="flex h-16 items-center justify-between px-5">
            <div className="flex items-center gap-2.5">
              <Logo href={null} className="h-8" />
              <span className="rounded-full bg-akua-blue-100 px-2 py-0.5 text-[10.5px] font-bold tracking-[0.08em] text-akua-blue uppercase">{tag}</span>
            </div>
            <button type="button" onClick={() => setDrawer(false)} aria-label="Fermer le menu" className="grid size-10 place-items-center rounded-full hover:bg-akua-page">
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-2 pb-6">
            <Nav base={base} allowed={allowed} onNavigate={() => setDrawer(false)} badges={badges} />
          </div>
          <div className="border-t border-akua-gray-200 p-3">
            <UserMenu kind={kind} user={user} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-[272px]">
        {/* barre du haut */}
        <header className="sticky top-0 z-20 border-b border-akua-gray-200 bg-akua-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3 px-4 md:px-8 lg:h-[72px]">
            <button type="button" onClick={() => setDrawer(true)} aria-label="Ouvrir le menu" className="-ml-1 hidden size-10 place-items-center rounded-full hover:bg-akua-page">
              <Menu aria-hidden className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="hidden text-[12px] font-medium text-akua-gray-500 sm:block">
                {portal}
                {hydrated && <span className="text-akua-gray-500/70"> · {TODAY.format(new Date())}</span>}
              </p>
              <p className="truncate text-[16px] font-bold tracking-[-0.01em] sm:text-[15px]">{current?.label ?? (path.endsWith("/mot-de-passe") ? "Mon mot de passe" : "Tableau de bord")}</p>
            </div>
            <SaveIndicator state={save} />
            <Link
              href="/"
              target="_blank"
              className="hidden h-10 items-center gap-2 rounded-full border border-akua-gray-200 bg-akua-white px-4 text-[13.5px] font-semibold transition-colors hover:border-akua-ink sm:inline-flex"
            >
              Voir le site <ArrowUpRight aria-hidden className="size-4" />
            </Link>
            <div className="lg:hidden">
              <UserMenu kind={kind} user={user} compact />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1320px] px-4 pt-6 pb-[calc(96px+env(safe-area-inset-bottom))] md:px-8 md:pt-8 lg:pb-16">
          <AdminProvider actor={actor} base={base} perms={perms}>
            {hydrated ? (
              <PageTransition>{children}</PageTransition>
            ) : (
              <div aria-busy className="flex flex-col gap-5">
                <div className="h-10 w-64 animate-pulse rounded-xl bg-akua-white" />
                <div className="h-[50vh] animate-pulse rounded-[24px] bg-akua-white" />
              </div>
            )}
          </AdminProvider>
        </main>
        <BottomNav base={base} allowed={allowed} onMore={() => setDrawer(true)} badges={badges} owner={kind === "owner"} />
      </div>
    </div>
  );
}

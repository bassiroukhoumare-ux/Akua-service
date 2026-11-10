"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, MessageSquareText, PackageX, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { ADMIN_MODULES, type AdminModuleId, moduleHref } from "@/config/admin";
import { dealEnd } from "@/lib/deals";
import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { useAdminHome } from "@/store/admin-home";
import { promoStatus, useAdminPromos } from "@/store/admin-promos";
import { useReviews } from "@/store/reviews";
import { useSavedCarts } from "@/store/saved-carts";
import { useAdmin, useCan } from "./actor-context";
import { MyActivity } from "./my-activity";

const TODAY = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

function greeting() {
  return new Date().getHours() < 18 ? "Bonjour" : "Bonsoir";
}

type Todo = { key: string; icon: typeof AlertTriangle; tone: string; title: string; detail: string; href: string; image?: string };

/** Tableau de bord de l'équipier : ses modules, ce qui demande son attention, ses dernières actions. */
export function TeamDashboard({ name, memberId }: { name: string; memberId: string }) {
  const { base } = useAdmin();
  const can = useCan();
  const products = useAdminCatalog((s) => s.products);
  const categories = useAdminCatalog((s) => s.categories);
  const codes = useAdminPromos((s) => s.codes);
  const deals = useAdminHome((s) => s.deals);
  const reviews = useReviews((s) => s.reviews);
  const carts = useSavedCarts((s) => s.carts);
  const mods = ADMIN_MODULES.filter((m) => m.id !== "dashboard" && !m.ownerOnly && can(m.id));

  useEffect(() => {
    if (can("reviews")) void useReviews.getState().load(true);
    if (can("carts")) void useSavedCarts.getState().load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const low = products.filter((p) => p.stockStatus === "rupture" || p.stockStatus === "stock_faible");
  const pendingCarts = carts.filter((c) => c.status === "pending" || c.status === "contacted");
  const recentReviews = reviews.filter((r) => Date.now() - Date.parse(r.createdAt) < 7 * 864e5);
  const dealOn = deals.enabled && !!dealEnd(deals);

  // chiffre clé de chaque module
  const stat: Partial<Record<AdminModuleId, { value: string; hint: string; alert?: boolean }>> = {
    products: { value: String(products.length), hint: low.length ? `${low.length} à réapprovisionner` : "produits et packs", alert: low.length > 0 },
    categories: { value: String(categories.length), hint: "catégories" },
    home: { value: "2", hint: "visuels de l'accueil" },
    deals: { value: dealOn ? "En cours" : "Arrêtée", hint: `${deals.productIds.length} produit${deals.productIds.length > 1 ? "s" : ""} en promo` },
    promos: { value: String(codes.filter((c) => promoStatus(c) === "active").length), hint: "codes actifs" },
    reviews: { value: String(reviews.length), hint: recentReviews.length ? `${recentReviews.length} cette semaine` : "avis clients" },
    carts: { value: String(pendingCarts.length), hint: "paniers à relancer", alert: pendingCarts.length > 0 },
    favorites: { value: "", hint: "produits préférés des clients" },
    settings: { value: "", hint: "coordonnées et horaires" },
    stats: { value: "", hint: "visites en direct" },
  };

  const todos = useMemo(() => {
    const list: Todo[] = [];
    if (can("products"))
      for (const p of low.slice(0, 4))
        list.push({
          key: `p-${p.id}`,
          icon: p.stockStatus === "rupture" ? PackageX : AlertTriangle,
          tone: p.stockStatus === "rupture" ? "text-akua-red" : "text-[#b7791f]",
          title: p.name,
          detail: p.stockStatus === "rupture" ? "En rupture de stock" : p.stockLeft ? `Plus que ${p.stockLeft} en stock` : "Stock faible",
          href: `${base}/produits/${p.id}`,
          image: p.images[0],
        });
    if (can("carts"))
      for (const c of pendingCarts.slice(0, 3)) list.push({ key: `c-${c.id}`, icon: ShoppingBag, tone: "text-akua-blue", title: `Panier de ${c.name}`, detail: `${formatFCFA(c.subtotal)} · à relancer`, href: `${base}/paniers` });
    if (can("reviews")) for (const r of recentReviews.slice(0, 3)) list.push({ key: `r-${r.id}`, icon: MessageSquareText, tone: "text-akua-ink", title: `Avis de ${r.firstName} · ${r.rating}/5`, detail: r.comment, href: `${base}/avis` });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, carts, reviews, base]);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      {/* accueil */}
      <section className="relative overflow-hidden rounded-[28px] border border-akua-gray-200/90 bg-akua-white p-5 md:p-7">
        <div aria-hidden className="absolute -top-24 -right-24 size-72 rounded-full bg-akua-blue/10 blur-3xl" />
        <p className="relative text-[13px] font-medium text-akua-gray-500 first-letter:uppercase">{TODAY.format(new Date())}</p>
        <h1 className="relative mt-1 text-[28px] leading-tight font-extrabold tracking-[-0.03em] md:text-[34px]">
          {greeting()} {name.split(" ")[0]}.
        </h1>
        <p className="relative mt-1 text-[14.5px] text-akua-gray-500">{todos.length ? `${todos.length} élément${todos.length > 1 ? "s" : ""} demande${todos.length > 1 ? "nt" : ""} votre attention.` : "Tout est à jour."}</p>
      </section>

      {/* modules */}
      <section>
        <h2 className="mb-3 px-1 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Vos espaces</h2>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3 xl:grid-cols-4">
          {mods.map((m) => {
            const st = stat[m.id];
            return (
              <li key={m.id}>
                <Link
                  href={moduleHref(base, m)}
                  className="group flex h-full flex-col rounded-[22px] border border-akua-gray-200/90 bg-akua-white p-4 transition-all hover:-translate-y-0.5 hover:border-akua-blue/40 hover:shadow-[0_20px_40px_-28px_rgb(31_91_255/0.5)] active:scale-[0.98] md:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <m.icon aria-hidden className="size-6 text-akua-ink transition-colors group-hover:text-akua-blue" strokeWidth={1.6} />
                    {st?.alert && <span className="size-2 rounded-full bg-akua-red" aria-label="À traiter" />}
                  </div>
                  <p className="mt-4 text-[15px] leading-tight font-bold">{m.label}</p>
                  {st?.value && <p className="mt-1.5 text-[22px] leading-none font-extrabold tracking-[-0.02em] tabular-nums">{st.value}</p>}
                  <p className={cn("mt-1 text-[12.5px] leading-snug", st?.alert ? "font-semibold text-akua-red" : "text-akua-gray-500")}>{st?.hint ?? m.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        {/* à faire */}
        <section className="rounded-[26px] border border-akua-gray-200/90 bg-akua-white p-4 md:p-6">
          <h2 className="px-1 text-[16.5px] font-bold">À faire</h2>
          {todos.length ? (
            <ul className="mt-3 flex flex-col">
              {todos.map((t) => (
                <li key={t.key}>
                  <Link href={t.href} className="group flex items-center gap-3 rounded-[16px] p-2 transition-colors hover:bg-akua-page active:bg-akua-page">
                    {t.image ? (
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-akua-tile">
                        <Image src={t.image} alt="" fill sizes="44px" className="object-contain p-1" />
                      </span>
                    ) : (
                      <span className="grid size-11 shrink-0 place-items-center">
                        <t.icon aria-hidden className={cn("size-6", t.tone)} strokeWidth={1.6} />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{t.title}</span>
                      <span className={cn("block truncate text-[12.5px]", t.image ? t.tone : "text-akua-gray-500")}>{t.detail}</span>
                    </span>
                    <ArrowRight aria-hidden className="size-4 shrink-0 text-akua-gray-500 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 aria-hidden className="size-9 text-[#128c4a]" strokeWidth={1.5} />
              <p className="mt-3 text-[14.5px] font-semibold">Rien d&apos;urgent</p>
              <p className="mt-0.5 text-[13px] text-akua-gray-500">Aucun stock faible, panier ou avis récent à traiter.</p>
            </div>
          )}
        </section>

        {/* dernières actions */}
        <section className="rounded-[26px] border border-akua-gray-200/90 bg-akua-white p-4 md:p-6">
          <h2 className="mb-4 px-1 text-[16.5px] font-bold">Vos dernières actions</h2>
          <MyActivity memberId={memberId} />
        </section>
      </div>
    </div>
  );
}

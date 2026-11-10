"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, EyeOff, PackageX, TicketPercent, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LiveResult } from "@/lib/analytics/aggregate";
import { dealEnd } from "@/lib/deals";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { useAdminHome } from "@/store/admin-home";
import { promoStatus, useAdminPromos } from "@/store/admin-promos";
import { useAdmin } from "./actor-context";
import { Panel } from "./ui";

type Item = { key: string; icon: typeof AlertTriangle; tone: string; title: string; detail: string; href: string; image?: string };

const DAY = 864e5;
const fDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/** Ce qui demande votre attention : ruptures, stock faible, produits masqués, codes promo, offre spéciale. */
export function Watchlist({ className }: { className?: string }) {
  const { base } = useAdmin();
  const products = useAdminCatalog((s) => s.products);
  const codes = useAdminPromos((s) => s.codes);
  const deals = useAdminHome((s) => s.deals);

  const items = useMemo(() => {
    const now = Date.now();
    const list: Item[] = [];
    for (const p of products) {
      const href = `${base}/produits/${p.id}`;
      if (p.stockStatus === "rupture") list.push({ key: `r-${p.id}`, icon: PackageX, tone: "text-akua-red", title: p.name, detail: "En rupture de stock", href, image: p.images[0] });
      else if (p.stockStatus === "stock_faible") list.push({ key: `f-${p.id}`, icon: AlertTriangle, tone: "text-[#b7791f]", title: p.name, detail: p.stockLeft ? `Plus que ${p.stockLeft} en stock` : "Stock faible", href, image: p.images[0] });
    }
    for (const p of products) if (p.published === false) list.push({ key: `m-${p.id}`, icon: EyeOff, tone: "text-akua-gray-500", title: p.name, detail: "Masqué du site", href: `${base}/produits/${p.id}`, image: p.images[0] });
    for (const c of codes) {
      const st = promoStatus(c, now);
      if (st === "active" && c.endsAt && new Date(c.endsAt).getTime() - now < 3 * DAY) list.push({ key: `c-${c.id}`, icon: TicketPercent, tone: "text-akua-blue", title: `Code ${c.code}`, detail: `Se termine le ${fDate.format(new Date(c.endsAt))}`, href: `${base}/codes-promo` });
    }
    if (deals.enabled) {
      const end = dealEnd(deals);
      if (!end) list.push({ key: "deal", icon: Timer, tone: "text-akua-red", title: "Offre spéciale", detail: "Terminée : elle n'est plus affichée sur l'accueil", href: `${base}/offre-speciale` });
      else if (deals.mode === "duration" && end.getTime() - now < 6 * 3600_000) list.push({ key: "deal", icon: Timer, tone: "text-akua-blue", title: "Offre spéciale", detail: `Se termine le ${fDate.format(end)}`, href: `${base}/offre-speciale` });
    }
    return list;
  }, [products, codes, deals, base]);

  return (
    <Panel className={className} title="À surveiller" description="Stock, produits masqués, codes promo et offre spéciale" bodyClassName="px-3 pb-3 pt-3 md:px-4">
      {items.length ? (
        <ul className="flex max-h-[380px] flex-col overflow-y-auto overscroll-contain">
          {items.slice(0, 12).map((it) => (
            <li key={it.key}>
              <Link href={it.href} className="group flex items-center gap-3 rounded-[16px] p-2 transition-colors hover:bg-akua-page">
                {it.image ? (
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-akua-tile">
                    <Image src={it.image} alt="" fill sizes="44px" className="object-contain p-1" />
                  </span>
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center">
                    <it.icon aria-hidden className={cn("size-6", it.tone)} strokeWidth={1.6} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{it.title}</span>
                  <span className={cn("mt-0.5 flex items-center gap-1.5 text-[12.5px] font-medium", it.tone)}>
                    {it.image && <it.icon aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />}
                    {it.detail}
                  </span>
                </span>
                <ArrowRight aria-hidden className="size-4 shrink-0 text-akua-gray-500 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center py-10 text-center">
          <CheckCircle2 aria-hidden className="size-9 text-[#128c4a]" strokeWidth={1.5} />
          <p className="mt-3 text-[14.5px] font-semibold">Tout est en ordre</p>
          <p className="mt-0.5 text-[13px] text-akua-gray-500">Aucune rupture, aucun produit masqué, aucun code sur le point d&apos;expirer.</p>
        </div>
      )}
      {items.length > 12 && <p className="px-2 pt-2 text-[12.5px] text-akua-gray-500">Et {items.length - 12} autre{items.length - 12 > 1 ? "s" : ""}…</p>}
    </Panel>
  );
}

/** Visiteurs présents sur le site maintenant (le détail est dans Statistiques). */
export function LiveMini() {
  const { base, actor } = useAdmin();
  const [live, setLive] = useState<LiveResult | null>(null);
  useEffect(() => {
    let on = true;
    const load = () =>
      fetch(`${base}/api/stats/live`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: LiveResult | null) => on && d && setLive(d))
        .catch(() => {});
    load();
    const id = window.setInterval(load, 20_000);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, [base]);

  return (
    <Link href={`${base}/statistiques`} className="group relative block overflow-hidden rounded-[26px] border border-akua-gray-200/90 bg-akua-white p-5 shadow-[0_1px_2px_rgb(11_16_32/0.03),0_14px_34px_-28px_rgb(11_16_32/0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-28px_rgb(37_211_102/0.45)]">
      <div aria-hidden className="absolute -top-16 -right-16 size-44 rounded-full bg-akua-whatsapp/12 blur-3xl" />
      <p className="relative inline-flex items-center gap-2 text-[11.5px] font-bold tracking-[0.14em] text-[#128c4a] uppercase">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-akua-whatsapp opacity-70" />
          <span className="relative inline-flex size-2 rounded-full bg-akua-whatsapp" />
        </span>
        En direct
      </p>
      <div className="relative mt-3 flex items-end gap-3">
        <span className="text-[44px] leading-none font-extrabold tracking-[-0.05em] tabular-nums">{live ? live.online : "–"}</span>
        <span className="pb-1 text-[13.5px] leading-snug text-akua-gray-500">
          {live && live.online > 1 ? "visiteurs" : "visiteur"} sur le site
          <br />
          en ce moment
        </span>
      </div>
      {actor && (
        <span className="relative mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-akua-blue">
          Voir les statistiques <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </Link>
  );
}

"use client";

import { BadgePercent, Heart, Info, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { DEMO_TOP_FAVORITES } from "@/lib/admin/demo";
import { btn } from "@/lib/btn";
import { discountPercent, formatFCFA } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { useFavorites } from "@/store/favorites";
import { useAdmin } from "../actor-context";
import { DemoChip, DemoNotice, PageHeader } from "../ui";

const STOCK: Record<string, { label: string; tone: string }> = {
  en_stock: { label: "En stock", tone: "text-[#128c4a]" },
  stock_faible: { label: "Stock limité", tone: "text-[#b7791f]" },
  sur_commande: { label: "Sur commande", tone: "text-akua-gray-500" },
  rupture: { label: "Rupture", tone: "text-akua-red" },
};

/** Produits les plus ajoutés aux favoris (les visiteurs n'ont pas de compte : comptage anonyme par produit). */
export function FavoritesView() {
  const hydrated = useHydrated();
  const { base } = useAdmin();
  const local = useFavorites((s) => s.ids);
  const products = useAdminCatalog((s) => s.products);

  const rows = useMemo(() => {
    const counts = new Map<string, { demo: number; local: number }>();
    for (const f of DEMO_TOP_FAVORITES) counts.set(f.product.id, { demo: f.count, local: 0 });
    if (hydrated) for (const id of local) counts.set(id, { demo: counts.get(id)?.demo ?? 0, local: 1 });
    return [...counts.entries()]
      .map(([id, c]) => ({ product: products.find((p) => p.id === id), ...c, total: c.demo + c.local }))
      .filter((r): r is typeof r & { product: NonNullable<typeof r.product> } => !!r.product)
      .sort((a, b) => b.total - a.total);
  }, [products, local, hydrated]);

  const total = rows.reduce((s, r) => s + r.total, 0);
  const max = Math.max(1, ...rows.map((r) => r.total));

  if (!hydrated) return <div className="h-[60vh] animate-pulse rounded-[24px] bg-akua-white" />;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title="Favoris" description="Les produits que vos visiteurs ajoutent le plus à leurs favoris : un bon indicateur de ce qui les intéresse." />
      <DemoNotice>Les chiffres marqués « Exemple » montrent le design. Les favoris ajoutés sur ce navigateur sont comptés en plus ; ceux de tous vos visiteurs le seront dès que la base de données sera branchée.</DemoNotice>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[20px] border border-akua-gray-200 bg-akua-white p-4">
          <p className="text-[12.5px] text-akua-gray-500">Ajouts aux favoris</p>
          <p className="mt-1 text-[24px] font-extrabold tabular-nums">{total}</p>
        </div>
        <div className="rounded-[20px] border border-akua-gray-200 bg-akua-white p-4">
          <p className="text-[12.5px] text-akua-gray-500">Produits concernés</p>
          <p className="mt-1 text-[24px] font-extrabold tabular-nums">{rows.length}</p>
        </div>
        <div className="flex items-start gap-3 rounded-[20px] bg-akua-blue-100/60 p-4 text-[13px]">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-akua-blue" />
          <p>
            <span className="font-semibold">Astuce :</span> un produit très mis en favori mais peu commandé ? Une petite promotion peut déclencher l&apos;achat.
          </p>
        </div>
      </div>

      <ol className="flex flex-col gap-2.5">
        {rows.map((r, i) => {
          const p = r.product;
          const pct = discountPercent(p.price, p.compareAtPrice) ?? 0;
          return (
            <li key={p.id} className="flex flex-col gap-4 rounded-[22px] border border-akua-gray-200 bg-akua-white p-4 md:flex-row md:items-center md:gap-6">
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold tabular-nums", i < 3 ? "bg-akua-ink text-akua-white" : "bg-akua-page")}>{i + 1}</span>
                <span className="relative size-14 shrink-0 overflow-hidden rounded-[14px] bg-akua-tile">
                  {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-contain p-1" unoptimized={p.images[0].startsWith("data:")} />}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-1 text-[14.5px] font-semibold">{p.name}</span>
                  <span className="flex flex-wrap items-center gap-x-2 text-[12.5px] tabular-nums">
                    <span className={cn("font-bold", pct ? "text-akua-blue" : "")}>{formatFCFA(p.price)}</span>
                    {pct > 0 && <span className="font-semibold text-akua-red">-{pct} %</span>}
                    <span className={STOCK[p.stockStatus].tone}>{STOCK[p.stockStatus].label}</span>
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3 md:w-[300px]">
                <span className="flex w-16 shrink-0 items-center gap-1.5 text-[15px] font-extrabold tabular-nums">
                  <Heart aria-hidden className="size-4 fill-akua-red text-akua-red" /> {r.total}
                </span>
                <span className="h-2 flex-1 rounded-full bg-akua-page">
                  <span className="block h-full rounded-full bg-akua-red/80" style={{ width: `${(r.total / max) * 100}%` }} />
                </span>
                {r.demo > 0 ? <DemoChip className="shrink-0" /> : <span className="shrink-0 rounded-full bg-akua-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-akua-blue">Réel</span>}
              </div>
              <div className="flex shrink-0 gap-2">
                {!pct && (
                  <Link href={`${base}/produits/${p.id}`} className={btn({ variant: "soft", size: "sm" })}>
                    <BadgePercent aria-hidden className="size-4" /> Mettre en promo
                  </Link>
                )}
                <Link href={`${base}/produits/${p.id}`} aria-label={`Modifier ${p.name}`} className={btn({ variant: "outline", size: "icon-sm" })}>
                  <Pencil aria-hidden className="size-4" />
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

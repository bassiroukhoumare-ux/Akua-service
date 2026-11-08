"use client";

import { CheckCircle2, Copy, Eye, EyeOff, MoreHorizontal, PackageOpen, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SearchSelect } from "@/components/ui/search-select";
import { btn } from "@/lib/btn";
import { CONDITION_LABEL, discountPercent, formatFCFA } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { newProductId, useAdminCatalog } from "@/store/admin-catalog";
import type { Product } from "@/types/catalog";
import { useAdmin } from "../actor-context";
import { DemoNotice, PageHeader } from "../ui";

type Tab = "all" | "simple" | "pack" | "promo" | "hidden" | "out";
const TABS: { id: Tab; label: string; test: (p: Product) => boolean }[] = [
  { id: "all", label: "Tous", test: () => true },
  { id: "simple", label: "Produits", test: (p) => !p.isPack },
  { id: "pack", label: "Packs", test: (p) => !!p.isPack },
  { id: "promo", label: "En promo", test: (p) => !!p.compareAtPrice },
  { id: "out", label: "Rupture", test: (p) => p.stockStatus === "rupture" },
  { id: "hidden", label: "Masqués", test: (p) => p.published === false },
];
const STOCK: Record<Product["stockStatus"], { label: string; tone: string }> = {
  en_stock: { label: "En stock", tone: "text-[#128c4a]" },
  stock_faible: { label: "Stock limité", tone: "text-[#b7791f]" },
  sur_commande: { label: "Sur commande", tone: "text-akua-gray-500" },
  rupture: { label: "Rupture", tone: "text-akua-red" },
};

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function Thumb({ p, size = 56 }: { p: Product; size?: number }) {
  const src = p.images[0];
  return (
    <span className="relative shrink-0 overflow-hidden rounded-[14px] bg-akua-tile" style={{ width: size, height: size }}>
      {src ? <Image src={src} alt="" fill sizes={`${size}px`} className="object-contain p-1" unoptimized={src.startsWith("data:")} /> : <PackageOpen aria-hidden className="absolute inset-0 m-auto size-5 text-akua-gray-500" />}
    </span>
  );
}

function Price({ p }: { p: Product }) {
  const pct = discountPercent(p.price, p.compareAtPrice) ?? 0;
  return (
    <span className="flex flex-col items-start">
      <span className={cn("text-[14.5px] font-extrabold tabular-nums", pct ? "text-akua-blue" : "text-akua-ink")}>{formatFCFA(p.price)}</span>
      {pct > 0 && (
        <span className="flex items-center gap-1.5 text-[12px] tabular-nums">
          <span className="text-akua-gray-500 line-through">{formatFCFA(p.compareAtPrice!)}</span>
          <span className="rounded-full bg-akua-red px-1.5 font-bold text-akua-white">-{pct} %</span>
        </span>
      )}
    </span>
  );
}

function RowMenu({ p, onDelete }: { p: Product; onDelete: () => void }) {
  const { actor, base } = useAdmin();
  const router = useRouter();
  const toggle = useAdminCatalog((s) => s.togglePublished);
  const save = useAdminCatalog((s) => s.saveProduct);
  const [open, setOpen] = useState(false);
  const item = "flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[14px] font-medium hover:bg-akua-page";
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`Actions pour ${p.name}`} aria-expanded={open} className="grid size-9 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-page hover:text-akua-ink">
        <MoreHorizontal aria-hidden className="size-5" />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Fermer" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute top-full right-0 z-40 mt-1 w-56 rounded-[18px] border border-akua-gray-200 bg-akua-white p-1.5 shadow-[0_24px_60px_-24px_rgb(11_16_32/0.35)]">
            <Link role="menuitem" href={`${base}/produits/${p.id}`} className={item}>
              <Pencil aria-hidden className="size-4 text-akua-gray-500" /> Modifier
            </Link>
            <button
              role="menuitem"
              type="button"
              className={item}
              onClick={() => {
                setOpen(false);
                const id = newProductId();
                save({ ...p, id, slug: `${p.slug}-copie`, name: `${p.name} (copie)`, published: false, createdBy: undefined, updatedBy: undefined }, actor, "copie masquée");
                router.push(`${base}/produits/${id}`);
              }}
            >
              <Copy aria-hidden className="size-4 text-akua-gray-500" /> Dupliquer
            </button>
            <button
              role="menuitem"
              type="button"
              className={item}
              onClick={() => {
                setOpen(false);
                toggle(p.id, actor);
              }}
            >
              {p.published === false ? <Eye aria-hidden className="size-4 text-akua-gray-500" /> : <EyeOff aria-hidden className="size-4 text-akua-gray-500" />}
              {p.published === false ? "Rendre visible" : "Masquer du site"}
            </button>
            <div className="my-1 h-px bg-akua-gray-200" />
            <button
              role="menuitem"
              type="button"
              className={cn(item, "text-akua-red hover:bg-akua-red/5")}
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              <Trash2 aria-hidden className="size-4" /> Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const OK_MSG: Record<string, string> = { ajoute: "Produit ajouté.", modifie: "Modifications enregistrées.", supprime: "Produit supprimé." };

export function ProductsList() {
  const hydrated = useHydrated();
  const { actor, base } = useAdmin();
  const sp = useSearchParams();
  const router = useRouter();
  const products = useAdminCatalog((s) => s.products);
  const categories = useAdminCatalog((s) => s.categories);
  const deleteProduct = useAdminCatalog((s) => s.deleteProduct);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const ok = sp.get("ok");
    if (ok && OK_MSG[ok]) {
      setToast(OK_MSG[ok]);
      router.replace(`${base}/produits`, { scroll: false });
      const t = window.setTimeout(() => setToast(""), 3200);
      return () => window.clearTimeout(t);
    }
  }, [sp, router, base]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Sans catégorie";
  const list = useMemo(() => {
    const n = norm(q.trim());
    const t = TABS.find((x) => x.id === tab)!;
    return products.filter((p) => t.test(p) && (cat === "all" || p.categoryId === cat) && (!n || norm(`${p.name} ${p.shortDescription}`).includes(n)));
  }, [products, tab, q, cat]);
  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, products.filter(t.test).length])) as Record<Tab, number>, [products]);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        title="Produits"
        description="Ajoutez, modifiez ou masquez les produits et les packs de la boutique."
        actions={
          <>
            <Link href={`${base}/produits/nouveau?type=pack`} className={btn({ variant: "outline", size: "md" })}>
              <PackageOpen aria-hidden className="size-[18px]" /> Créer un pack
            </Link>
            <Link href={`${base}/produits/nouveau`} className={btn({ variant: "primary", size: "md" })}>
              <Plus aria-hidden className="size-[18px]" /> Ajouter un produit
            </Link>
          </>
        }
      />
      <DemoNotice>Vos ajouts et modifications sont gardés dans ce navigateur pour tester le design. Ils apparaîtront sur le site public dès que la base de données sera branchée.</DemoNotice>

      {/* filtres */}
      <div className="flex flex-col gap-3">
        <div role="tablist" aria-label="Filtrer" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-colors",
                tab === t.id ? "bg-akua-ink text-akua-white" : "bg-akua-white text-akua-ink ring-1 ring-akua-gray-200 hover:ring-akua-ink",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11.5px] tabular-nums", tab === t.id ? "bg-akua-white/15" : "bg-akua-page text-akua-gray-500")}>{hydrated ? counts[t.id] : "–"}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_260px]">
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-akua-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un produit…"
              aria-label="Rechercher un produit"
              className="h-12 w-full rounded-2xl border border-akua-gray-200 bg-akua-white pr-10 pl-11 text-[16px] outline-none focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10 sm:text-[15px]"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Effacer" className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-page">
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>
          <SearchSelect
            value={cat}
            onChange={setCat}
            options={[{ value: "all", label: "Toutes les catégories" }, ...[...categories].sort((a, b) => a.order - b.order).map((c) => ({ value: c.id, label: c.name }))]}
            searchPlaceholder="Rechercher une catégorie…"
            aria-label="Filtrer par catégorie"
          />
        </div>
      </div>

      {!hydrated ? (
        <div className="h-80 animate-pulse rounded-[24px] bg-akua-white" />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center rounded-[24px] border border-dashed border-akua-gray-200 bg-akua-white px-6 py-16 text-center">
          <PackageOpen aria-hidden className="size-10 text-akua-gray-200" strokeWidth={1.3} />
          <p className="mt-3 text-[16px] font-bold">Aucun produit trouvé</p>
          <p className="mt-1 text-[14px] text-akua-gray-500">Modifiez les filtres ou ajoutez un nouveau produit.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-akua-gray-200 bg-akua-white">
          {/* ordinateur : tableau */}
          <table className="hidden w-full text-left md:table">
            <thead>
              <tr className="border-b border-akua-gray-200 text-[12px] font-semibold tracking-[0.04em] text-akua-gray-500 uppercase">
                <th className="py-3.5 pl-6 font-semibold">Produit</th>
                <th className="py-3.5 font-semibold">Prix</th>
                <th className="py-3.5 font-semibold">Stock</th>
                <th className="hidden py-3.5 font-semibold xl:table-cell">Ajouté par</th>
                <th className="py-3.5 font-semibold">Statut</th>
                <th className="w-14 py-3.5 pr-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-akua-gray-200">
              {list.map((p) => (
                <tr key={p.id} className={cn("transition-colors hover:bg-akua-page/50", p.published === false && "opacity-60")}>
                  <td className="py-3 pl-6">
                    <Link href={`${base}/produits/${p.id}`} className="flex items-center gap-3.5">
                      <Thumb p={p} />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="line-clamp-1 text-[14.5px] font-semibold hover:text-akua-blue">{p.name}</span>
                          {p.isPack && <span className="shrink-0 rounded-full bg-akua-blue-100 px-2 py-0.5 text-[11px] font-semibold text-akua-blue">Pack</span>}
                        </span>
                        <span className="text-[12.5px] text-akua-gray-500">
                          {catName(p.categoryId)} · {CONDITION_LABEL[p.condition]}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-3">
                    <Price p={p} />
                  </td>
                  <td className="py-3">
                    <span className={cn("text-[13.5px] font-semibold", STOCK[p.stockStatus].tone)}>{STOCK[p.stockStatus].label}</span>
                    {p.stockLeft !== undefined && <span className="block text-[12px] text-akua-gray-500 tabular-nums">{p.stockLeft} en stock</span>}
                  </td>
                  <td className="hidden py-3 text-[13px] xl:table-cell">
                    <span className="font-medium">{p.createdBy ?? "Catalogue d'origine"}</span>
                    {p.updatedBy && p.updatedBy !== p.createdBy && <span className="block text-[12px] text-akua-gray-500">modifié par {p.updatedBy}</span>}
                  </td>
                  <td className="py-3">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold", p.published === false ? "bg-akua-page text-akua-gray-500" : "bg-akua-whatsapp/12 text-[#128c4a]")}>
                      <span className={cn("size-1.5 rounded-full", p.published === false ? "bg-akua-gray-500" : "bg-akua-whatsapp")} />
                      {p.published === false ? "Masqué" : "Visible"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <RowMenu p={p} onDelete={() => setToDelete(p)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* mobile : cartes */}
          <ul className="divide-y divide-akua-gray-200 md:hidden">
            {list.map((p) => (
              <li key={p.id} className={cn("flex items-center gap-3 p-3.5", p.published === false && "opacity-60")}>
                <Link href={`${base}/produits/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Thumb p={p} size={64} />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[14px] leading-snug font-semibold">{p.name}</span>
                    <span className="mt-0.5 block text-[12px] text-akua-gray-500">
                      {catName(p.categoryId)}
                      {p.isPack ? " · Pack" : ""} · <span className={STOCK[p.stockStatus].tone}>{STOCK[p.stockStatus].label}</span>
                      {p.published === false ? " · Masqué" : ""}
                    </span>
                    <span className="mt-1 block">
                      <Price p={p} />
                    </span>
                  </span>
                </Link>
                <RowMenu p={p} onDelete={() => setToDelete(p)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Supprimer « ${toDelete?.name ?? ""} » ?`}
        description="Le produit sera retiré du catalogue. Pour le cacher temporairement, utilisez plutôt « Masquer du site »."
        onConfirm={() => {
          if (toDelete) deleteProduct(toDelete.id, actor);
          setToDelete(null);
          setToast("Produit supprimé.");
          window.setTimeout(() => setToast(""), 3200);
        }}
      />

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-akua-ink px-5 py-3 text-[14px] font-semibold text-akua-white shadow-[0_20px_40px_-16px_rgb(7_8_12/0.6)]">
          <CheckCircle2 aria-hidden className="size-[18px] text-akua-whatsapp" /> {toast}
        </div>
      )}
    </div>
  );
}

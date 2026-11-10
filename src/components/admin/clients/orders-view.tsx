"use client";

import { Check, ChevronDown, Clock, MapPin, MessageSquareText, Package, Phone, Receipt, RotateCcw, Search, Store, Trash2, X, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import type { OrderRecord, OrderStatus } from "@/lib/customers";
import { formatFCFA } from "@/lib/format";
import { followUpLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import type { Product } from "@/types/catalog";
import { useAdmin, useCan } from "../actor-context";
import { ReadOnlyNotice } from "../read-only";
import { formatNumber, PageHeader } from "../ui";

const STATUS: Record<OrderStatus, { label: string; tone: string; icon: typeof Clock }> = {
  pending: { label: "En attente", tone: "bg-[#fff4d6] text-[#8a6a00]", icon: Clock },
  sold: { label: "Vendue", tone: "bg-akua-blue-100 text-akua-blue", icon: Check },
  unsold: { label: "Non vendue", tone: "bg-akua-page text-akua-gray-500", icon: XCircle },
};
type Tab = OrderStatus | "all";
const TABS: { id: Tab; label: string }[] = [
  { id: "pending", label: "En attente" },
  { id: "sold", label: "Vendues" },
  { id: "unsold", label: "Non vendues" },
  { id: "all", label: "Toutes" },
];

const fDate = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fDay = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Nombre de commandes en attente (pastille du menu). */
export function usePendingOrders(base: string, enabled = true) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let on = true;
    const load = () =>
      fetch(`${base}/api/clients/commandes-attente`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { pending: 0 }))
        .then((d: { pending: number }) => on && setN(d.pending))
        .catch(() => {});
    load();
    const id = window.setInterval(load, 30_000);
    const refresh = () => load();
    window.addEventListener("akua:orders", refresh);
    return () => {
      on = false;
      window.clearInterval(id);
      window.removeEventListener("akua:orders", refresh);
    };
  }, [base, enabled]);
  return n;
}

/* ------------------------------------------------------------- stock */

/** Nouveau stock d'un produit après une vente (ou son annulation). */
function stockAfter(p: Product, qty: number) {
  if (p.stockLeft == null) return null;
  const left = Math.max(0, p.stockLeft + qty);
  return { ...p, stockLeft: left, stockStatus: left === 0 ? ("rupture" as const) : left <= 3 ? ("stock_faible" as const) : p.stockStatus === "rupture" || p.stockStatus === "stock_faible" ? ("en_stock" as const) : p.stockStatus };
}

function StatusDialog({ order, target, onClose, onDone }: { order: OrderRecord | null; target: OrderStatus; onClose: () => void; onDone: () => void }) {
  const { base, actor } = useAdmin();
  const can = useCan();
  const products = useAdminCatalog((s) => s.products);
  const saveProduct = useAdminCatalog((s) => s.saveProduct);
  const [stock, setStock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setStock(true);
    setError("");
  }, [order, target]);
  if (!order) return null;

  const deduct = target === "sold" && !order.stockDeducted;
  const restore = target !== "sold" && !!order.stockDeducted;
  const canStock = can("products", "edit") && (deduct || restore);
  const lines = order.items.map((i) => {
    const p = products.find((x) => x.id === i.productId);
    const next = p ? stockAfter(p, deduct ? -i.quantity : i.quantity) : null;
    return { i, p, next };
  });
  const title = target === "sold" ? "Marquer comme vendue" : target === "unsold" ? "Marquer comme non vendue" : "Remettre en attente";

  async function confirm() {
    if (!order) return;
    setBusy(true);
    setError("");
    const applyStock = canStock && stock;
    const res = await fetch(`${base}/api/clients/commandes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: target, ...(applyStock ? { stockDeducted: deduct } : {}) }),
    }).catch(() => null);
    if (!res?.ok) {
      setBusy(false);
      return setError("Le changement n'a pas pu être enregistré. Vérifiez votre connexion et réessayez.");
    }
    if (applyStock)
      for (const { p, next } of lines)
        if (p && next) saveProduct(next, actor, `stock : ${p.stockLeft} → ${next.stockLeft} (commande ${order.ref}${deduct ? " vendue" : " annulée"})`);
    setBusy(false);
    window.dispatchEvent(new Event("akua:orders"));
    onDone();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
        className="w-[calc(100%-24px)] max-w-[480px] gap-0 overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white p-0 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0 sm:max-w-[480px]"
      >
        <div className="px-6 pt-6 pb-5 sm:px-7">
          <DialogTitle className="text-[19px] font-extrabold tracking-[-0.02em]">{title}</DialogTitle>
          <DialogDescription className="mt-1 text-[13.5px] text-akua-gray-500">
            Commande {order.ref} · {order.customer.name} · {formatFCFA(order.total)}
          </DialogDescription>
          {canStock && (
            <div className="mt-5 rounded-[18px] bg-akua-page p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} className="mt-0.5 size-4 accent-[var(--akua-blue)]" />
                <span className="text-[14px] font-semibold">{deduct ? "Retirer ces articles du stock" : "Remettre ces articles en stock"}</span>
              </label>
              <ul className="mt-3 flex flex-col gap-1.5 pl-7 text-[13px]">
                {lines.map(({ i, p, next }) => (
                  <li key={i.productId + i.name} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">
                      {i.name} <span className="text-akua-gray-500">× {i.quantity}</span>
                    </span>
                    <span className="shrink-0 tabular-nums">{!p ? <span className="text-akua-gray-500">produit supprimé</span> : next ? <>{p.stockLeft} → <span className="font-bold">{next.stockLeft}</span></> : <span className="text-akua-gray-500">stock non chiffré</span>}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && <p className="mt-4 rounded-2xl bg-akua-red/8 px-4 py-3 text-[13.5px] font-medium text-akua-red">{error}</p>}
        </div>
        <div className="flex gap-2.5 border-t border-akua-gray-200 px-6 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-full border border-akua-gray-200 text-[14px] font-semibold hover:border-akua-ink">
            Annuler
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void confirm()}
            className={cn("h-11 flex-[1.4] rounded-full text-[14px] font-semibold text-akua-white disabled:opacity-60", target === "sold" ? "bg-akua-blue hover:bg-akua-blue-600" : "bg-akua-ink hover:bg-akua-blue")}
          >
            {busy ? "Enregistrement…" : target === "sold" ? "Confirmer la vente" : "Confirmer"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Numéro de commande : « CMD-AKUA » discret, numéro d'ordre en évidence, copiable. */
export function OrderRef({ value, className }: { value: string; className?: string }) {
  const m = value.match(/^(CMD-AKUA-)(\d+)$/);
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copier le numéro"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        });
      }}
      className={cn("inline-flex items-baseline rounded-[10px] px-1 text-[15px] tabular-nums transition-colors hover:bg-akua-page", className)}
    >
      {m ? (
        <>
          <span className="font-semibold text-akua-gray-500">{m[1]}</span>
          <span className="font-extrabold text-akua-ink">{m[2]}</span>
        </>
      ) : (
        <span className="font-bold">{value}</span>
      )}
      <span className={cn("ml-1.5 text-[11px] font-semibold text-akua-blue transition-opacity", copied ? "opacity-100" : "opacity-0")}>Copié</span>
    </button>
  );
}

/* ------------------------------------------------------------- carte */

function OrderCard({ o, onStatus, onDelete }: { o: OrderRecord; onStatus: (s: OrderStatus) => void; onDelete: () => void }) {
  const can = useCan();
  const [open, setOpen] = useState(false);
  const status = o.status ?? "pending";
  const S = STATUS[status];
  const count = o.items.reduce((a, i) => a + i.quantity, 0);
  return (
    <li className={cn("overflow-hidden rounded-[24px] border bg-akua-white transition-colors", status === "pending" ? "border-[#f0d58a]" : "border-akua-gray-200")}>
      {/* en-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-bold", S.tone)}>
              <S.icon aria-hidden className="size-3.5" strokeWidth={2.4} /> {S.label}
            </span>
            <OrderRef value={o.ref} />
          </div>
          <p className="mt-1.5 text-[12.5px] text-akua-gray-500 first-letter:uppercase">
            {fDate.format(new Date(o.createdAt))}
            {o.statusBy && status !== "pending" ? ` · ${S.label.toLowerCase()} par ${o.statusBy}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[19px] leading-none font-extrabold tracking-[-0.02em] tabular-nums">{formatFCFA(o.total)}</p>
          <p className="mt-1 text-[12px] text-akua-gray-500">
            {count} article{count > 1 ? "s" : ""}
            {o.promo && <span className="font-semibold text-akua-blue"> · code {o.promo.code}</span>}
          </p>
        </div>
      </div>

      {/* client et retrait / livraison */}
      <div className="grid gap-3 border-t border-akua-gray-200 bg-akua-page/60 p-4 text-[13.5px] sm:grid-cols-2 sm:p-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Client</p>
          <p className="mt-1 truncate font-semibold">{o.customer.name || "Sans nom"}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-akua-gray-500 tabular-nums">
            <Phone aria-hidden className="size-3.5 shrink-0" strokeWidth={1.9} /> {o.customer.phone}
          </p>
          {o.customer.email && <p className="mt-0.5 truncate text-akua-gray-500">{o.customer.email}</p>}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">{o.mode === "retrait" ? "Retrait en boutique" : "Livraison"}</p>
          {o.mode === "livraison" && o.delivery ? (
            <>
              <p className="mt-1 flex items-start gap-1.5">
                <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0 text-akua-gray-500" strokeWidth={1.9} />
                <span>{[o.delivery.address, o.delivery.city, o.delivery.country].filter(Boolean).join(", ")}</span>
              </p>
              {o.delivery.landmark && <p className="mt-0.5 pl-5 text-akua-gray-500">Repère : {o.delivery.landmark}</p>}
            </>
          ) : (
            <p className="mt-1 flex items-start gap-1.5">
              <Store aria-hidden className="mt-0.5 size-3.5 shrink-0 text-akua-gray-500" strokeWidth={1.9} />
              <span>
                {o.pickup?.date ? fDay.format(new Date(`${o.pickup.date}T12:00:00`)) : "Date à confirmer"}
                {o.pickup?.time && ` à ${o.pickup.time}`}
                {o.pickup?.deposit ? <span className="block text-akua-gray-500">{o.pickup.depositLabel ?? "acompte"} : {formatFCFA(o.pickup.deposit)}</span> : null}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* articles */}
      <ul className="divide-y divide-akua-gray-200 border-t border-akua-gray-200 px-4 sm:px-5">
        {o.items.map((i, k) => (
          <li key={k} className="flex items-center gap-3 py-2.5 text-[13.5px]">
            <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-akua-tile">
              {i.image ? <Image src={i.image} alt="" fill sizes="40px" className="object-contain p-1" /> : <Package aria-hidden className="size-4 text-akua-gray-500" />}
            </span>
            <span className="min-w-0 flex-1">
              {i.slug ? (
                <Link href={`/produit/${i.slug}`} target="_blank" className="block truncate font-medium hover:text-akua-blue">
                  {i.name}
                </Link>
              ) : (
                <span className="block truncate font-medium">{i.name}</span>
              )}
              <span className="text-[12px] text-akua-gray-500 tabular-nums">
                {i.quantity} × {formatFCFA(i.price)}
              </span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{formatFCFA(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1 border-t border-akua-gray-200 px-4 py-3 text-[13px] sm:px-5">
        <div className="flex justify-between text-akua-gray-500">
          <dt>Sous-total</dt>
          <dd className="tabular-nums">{formatFCFA(o.subtotal)}</dd>
        </div>
        {o.promo && (
          <div className="flex justify-between text-akua-blue">
            <dt>Remise (code {o.promo.code})</dt>
            <dd className="tabular-nums">-{formatFCFA(o.promo.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between text-[14px] font-bold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatFCFA(o.total)}</dd>
        </div>
      </dl>
      {o.note && (
        <p className="mx-4 mb-3 flex items-start gap-2 rounded-[14px] bg-akua-page px-3 py-2.5 text-[13px] sm:mx-5">
          <MessageSquareText aria-hidden className="mt-0.5 size-4 shrink-0 text-akua-gray-500" strokeWidth={1.8} /> <span>{o.note}</span>
        </p>
      )}
      {o.message && (
        <div className="mx-4 mb-3 sm:mx-5">
          <button type="button" onClick={() => setOpen((x) => !x)} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-akua-blue">
            <ChevronDown aria-hidden className={cn("size-4 transition-transform", open && "rotate-180")} /> {open ? "Masquer" : "Voir"} le message envoyé sur WhatsApp
          </button>
          {open && <pre className="mt-2 max-h-80 overflow-auto rounded-[14px] bg-akua-page p-3 font-sans text-[12.5px] leading-relaxed whitespace-pre-wrap">{o.message}</pre>}
        </div>
      )}

      {/* actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-akua-gray-200 p-3 sm:px-5">
        {can("orders", "manage") && status !== "sold" && (
          <button type="button" onClick={() => onStatus("sold")} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-akua-blue px-4 text-[13.5px] font-semibold text-akua-white hover:bg-akua-blue-600 sm:flex-none">
            <Check aria-hidden className="size-4" strokeWidth={2.6} /> Vendue
          </button>
        )}
        {can("orders", "manage") && status !== "unsold" && (
          <button type="button" onClick={() => onStatus("unsold")} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-akua-gray-200 px-4 text-[13.5px] font-semibold hover:border-akua-ink sm:flex-none">
            <X aria-hidden className="size-4" strokeWidth={2.4} /> Non vendue
          </button>
        )}
        {can("orders", "manage") && status !== "pending" && (
          <button type="button" onClick={() => onStatus("pending")} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-akua-gray-500 hover:bg-akua-page hover:text-akua-ink">
            <RotateCcw aria-hidden className="size-4" /> Remettre en attente
          </button>
        )}
        <span className="ml-auto flex gap-2">
          <a
            href={followUpLink(o.customer.phone, o)}
            target="_blank"
            rel="noopener"
            aria-label={`Écrire à ${o.customer.name} sur WhatsApp`}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-akua-whatsapp px-4 text-[13px] font-semibold text-akua-white"
          >
            <WhatsAppIcon size={16} /> <span className="hidden sm:inline">Écrire au client</span>
          </a>
          {can("orders", "delete") && (
            <button type="button" onClick={onDelete} aria-label="Supprimer la commande" className="grid size-10 place-items-center rounded-full border border-akua-gray-200 text-akua-gray-500 hover:border-akua-red hover:text-akua-red">
              <Trash2 aria-hidden className="size-4" />
            </button>
          )}
        </span>
      </div>
    </li>
  );
}

/* --------------------------------------------------------------- page */

export function OrdersView() {
  const { base } = useAdmin();
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [q, setQ] = useState("");
  const [change, setChange] = useState<{ order: OrderRecord; target: OrderStatus } | null>(null);
  const [toDelete, setToDelete] = useState<OrderRecord | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`${base}/api/clients/commandes`, { cache: "no-store" }).catch(() => null);
    setOrders(res?.ok ? await res.json() : []);
  }, [base]);
  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(id);
  }, [load]);

  const all = useMemo(() => orders ?? [], [orders]);
  const count = (s: Tab) => (s === "all" ? all.length : all.filter((o) => (o.status ?? "pending") === s).length);
  const sold = all.filter((o) => o.status === "sold");
  const list = useMemo(() => {
    const n = norm(q.trim());
    return all.filter((o) => (tab === "all" || (o.status ?? "pending") === tab) && (!n || norm(`${o.ref} ${o.customer.name} ${o.customer.phone} ${o.items.map((i) => i.name).join(" ")} ${o.promo?.code ?? ""}`).includes(n)));
  }, [all, tab, q]);
  const decided = all.filter((o) => o.status === "sold" || o.status === "unsold").length;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title="Commandes" description="Chaque commande envoyée sur WhatsApp depuis le site arrive ici « En attente ». Marquez-la vendue ou non vendue une fois la vente conclue." />
      <ReadOnlyNotice module="orders" />

      {/* chiffres */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {[
          { label: "En attente", value: formatNumber(count("pending")), hint: count("pending") ? "à traiter" : "rien à traiter", tone: count("pending") ? "text-[#8a6a00]" : "" },
          { label: "Vendues", value: formatNumber(sold.length), hint: "commandes conclues" },
          { label: "Chiffre d'affaires", value: formatFCFA(sold.reduce((a, o) => a + o.total, 0)), hint: "sur les commandes vendues" },
          { label: "Taux de vente", value: decided ? `${Math.round((sold.length / decided) * 100)} %` : "–", hint: "vendues / traitées" },
        ].map((k) => (
          <div key={k.label} className="rounded-[24px] border border-akua-gray-200/90 bg-akua-white p-5">
            <p className="text-[13px] font-medium text-akua-gray-500">{k.label}</p>
            <p className={cn("mt-2 text-[24px] leading-none font-extrabold tracking-[-0.03em] tabular-nums md:text-[28px]", k.tone)}>{k.value}</p>
            <p className="mt-2 text-[12.5px] text-akua-gray-500">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* filtres */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div role="tablist" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn("flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-colors", tab === t.id ? "bg-akua-ink text-akua-white" : "bg-akua-white ring-1 ring-akua-gray-200 hover:ring-akua-ink")}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11.5px] tabular-nums", tab === t.id ? "bg-akua-white/15" : t.id === "pending" && count("pending") ? "bg-[#fff4d6] text-[#8a6a00]" : "bg-akua-page text-akua-gray-500")}>{count(t.id)}</span>
            </button>
          ))}
        </div>
        <div className="relative md:ml-auto md:w-[340px]">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-akua-gray-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Référence, client, téléphone, produit…" aria-label="Rechercher une commande" className="h-11 w-full rounded-2xl border border-akua-gray-200 bg-akua-white pr-4 pl-11 text-[16px] outline-none focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10 sm:text-[14.5px]" />
        </div>
      </div>

      {!orders ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-[24px] bg-akua-white" />
          ))}
        </div>
      ) : list.length ? (
        <ul className="grid gap-3 xl:grid-cols-2">
          {list.map((o) => (
            <OrderCard key={o.id} o={o} onStatus={(target) => setChange({ order: o, target })} onDelete={() => setToDelete(o)} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-[24px] border border-dashed border-akua-gray-200 bg-akua-white px-6 py-16 text-center">
          <Receipt aria-hidden className="size-10 text-akua-gray-200" strokeWidth={1.3} />
          <p className="mt-3 text-[16px] font-bold">{all.length ? "Aucune commande ici" : "Aucune commande pour le moment"}</p>
          <p className="mt-1 max-w-sm text-[14px] text-akua-gray-500">{all.length ? "Aucune commande ne correspond à ce filtre." : "Dès qu'un client enverra sa commande sur WhatsApp depuis le panier, elle apparaîtra ici."}</p>
        </div>
      )}

      {change && (
        <StatusDialog
          order={change.order}
          target={change.target}
          onClose={() => setChange(null)}
          onDone={() => {
            setChange(null);
            void load();
          }}
        />
      )}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Supprimer la commande ${toDelete?.ref ?? ""} ?`}
        description="Elle sera définitivement retirée. Pour la garder dans l'historique, marquez-la plutôt « Non vendue »."
        onConfirm={async () => {
          if (toDelete) await fetch(`${base}/api/clients/commandes?id=${encodeURIComponent(toDelete.id)}`, { method: "DELETE" });
          setToDelete(null);
          window.dispatchEvent(new Event("akua:orders"));
          void load();
        }}
      />
    </div>
  );
}

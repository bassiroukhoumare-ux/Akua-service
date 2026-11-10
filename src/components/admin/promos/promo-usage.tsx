"use client";

import { MapPin, Package, Phone, Receipt, Store, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import type { OrderRecord } from "@/lib/customers";
import { formatFCFA } from "@/lib/format";
import { followUpLink } from "@/lib/whatsapp";
import { useAdmin } from "../actor-context";

export type Usage = Record<string, { uses: number; discount: number; total: number; last: string }>;

/** Nombre d'utilisations de chaque code (commandes envoyées avec ce code). */
export function usePromoUsage() {
  const { base } = useAdmin();
  const [usage, setUsage] = useState<Usage>({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch(`${base}/api/clients/promos`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((u: Usage) => setUsage(u))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [base]);
  return { usage, loaded };
}

const fDate = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function OrderCard({ o }: { o: OrderRecord }) {
  const count = o.items.reduce((a, i) => a + i.quantity, 0);
  return (
    <li className="rounded-[20px] border border-akua-gray-200 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-[14.5px] font-bold">
            <Receipt aria-hidden className="size-4 text-akua-gray-500" strokeWidth={1.8} /> {o.ref}
          </p>
          <p className="mt-0.5 text-[12.5px] text-akua-gray-500 first-letter:uppercase">{fDate.format(new Date(o.createdAt))}</p>
        </div>
        <p className="text-right">
          <span className="block text-[16px] font-extrabold tabular-nums">{formatFCFA(o.total)}</span>
          {o.promo && <span className="block text-[12px] font-semibold text-akua-blue tabular-nums">-{formatFCFA(o.promo.discount)} avec {o.promo.code}</span>}
        </p>
      </div>

      {/* client */}
      <div className="mt-4 grid gap-3 rounded-[16px] bg-akua-page p-3.5 text-[13.5px] sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Client</p>
          <p className="mt-1 truncate font-semibold">{o.customer.name || "Sans nom"}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-akua-gray-500 tabular-nums">
            <Phone aria-hidden className="size-3.5" strokeWidth={1.9} /> {o.customer.phone}
          </p>
          {o.customer.email && <p className="mt-0.5 truncate text-akua-gray-500">{o.customer.email}</p>}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">{o.mode === "retrait" ? "Retrait en boutique" : "Livraison"}</p>
          {o.mode === "livraison" && o.delivery ? (
            <p className="mt-1 flex items-start gap-1.5">
              <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0 text-akua-gray-500" strokeWidth={1.9} />
              <span>{[o.delivery.address, o.delivery.city, o.delivery.country].filter(Boolean).join(", ")}</span>
            </p>
          ) : (
            <p className="mt-1 flex items-start gap-1.5">
              <Store aria-hidden className="mt-0.5 size-3.5 shrink-0 text-akua-gray-500" strokeWidth={1.9} />
              <span>
                {o.pickup?.date} {o.pickup?.time && `à ${o.pickup.time}`}
                {o.pickup?.deposit ? ` · acompte ${formatFCFA(o.pickup.deposit)}` : ""}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* articles */}
      <ul className="mt-3 divide-y divide-akua-gray-200 text-[13.5px]">
        {o.items.map((i, k) => (
          <li key={k} className="flex items-center gap-2.5 py-2">
            <Package aria-hidden className="size-4 shrink-0 text-akua-gray-500" strokeWidth={1.7} />
            <span className="min-w-0 flex-1 truncate">
              {i.name} <span className="text-akua-gray-500">× {i.quantity}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{formatFCFA(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-2 space-y-1 border-t border-akua-gray-200 pt-3 text-[13px]">
        <div className="flex justify-between text-akua-gray-500">
          <dt>
            Sous-total ({count} article{count > 1 ? "s" : ""})
          </dt>
          <dd className="tabular-nums">{formatFCFA(o.subtotal)}</dd>
        </div>
        {o.promo && (
          <div className="flex justify-between text-akua-blue">
            <dt>Remise {o.promo.code}</dt>
            <dd className="tabular-nums">-{formatFCFA(o.promo.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatFCFA(o.total)}</dd>
        </div>
      </dl>
      {o.note && <p className="mt-3 rounded-[12px] bg-akua-page px-3 py-2 text-[12.5px] text-akua-gray-500">Note : {o.note}</p>}
      <a
        href={followUpLink(o.customer.phone, o)}
        target="_blank"
        rel="noopener"
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-akua-whatsapp px-4 text-[13px] font-semibold text-akua-white"
      >
        <WhatsAppIcon size={16} /> Écrire au client
      </a>
    </li>
  );
}

/** Commandes passées avec un code promo, avec les informations du client et de la commande. */
export function UsageDialog({ code, onClose }: { code: string | null; onClose: () => void }) {
  const { base } = useAdmin();
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  useEffect(() => {
    if (!code) return;
    setOrders(null);
    fetch(`${base}/api/clients/commandes?code=${encodeURIComponent(code)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [code, base]);
  const discount = orders?.reduce((a, o) => a + (o.promo?.discount ?? 0), 0) ?? 0;
  const total = orders?.reduce((a, o) => a + o.total, 0) ?? 0;

  return (
    <Dialog open={!!code} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
        className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[720px] flex-col gap-0 overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white p-0 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0 sm:max-w-[720px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-akua-gray-200 px-5 py-5 sm:px-7">
          <div>
            <DialogTitle className="text-[20px] font-extrabold tracking-[-0.02em]">Utilisations du code {code}</DialogTitle>
            <DialogDescription className="mt-1 text-[13.5px] text-akua-gray-500">Chaque commande envoyée sur WhatsApp avec ce code, avec le client et le détail de la commande.</DialogDescription>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-akua-page">
            <X aria-hidden className="size-[18px]" />
          </button>
        </div>
        {orders && orders.length > 0 && (
          <div className="grid grid-cols-3 border-b border-akua-gray-200 text-center">
            {[
              ["Utilisations", String(orders.length)],
              ["Remise accordée", formatFCFA(discount)],
              ["Montant des commandes", formatFCFA(total)],
            ].map(([l, v]) => (
              <div key={l} className="border-r border-akua-gray-200 px-2 py-3.5 last:border-0">
                <p className="text-[11.5px] font-medium text-akua-gray-500">{l}</p>
                <p className="mt-0.5 text-[16px] font-extrabold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
          {!orders ? (
            <div className="flex flex-col gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-[20px] bg-akua-page" />
              ))}
            </div>
          ) : orders.length ? (
            <ul className="flex flex-col gap-3">
              {orders.map((o) => (
                <OrderCard key={o.id} o={o} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <Receipt aria-hidden className="size-9 text-akua-gray-200" strokeWidth={1.4} />
              <p className="mt-3 text-[15px] font-bold">Pas encore utilisé</p>
              <p className="mt-1 max-w-sm text-[13.5px] text-akua-gray-500">Dès qu&apos;un client enverra une commande avec ce code, elle apparaîtra ici avec ses coordonnées.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { CheckCircle2, Mail, MapPin, MoreHorizontal, Phone, ShoppingBag, Trash2, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { DEMO_SAVED_CARTS, timeAgo } from "@/lib/admin/demo";
import { formatFCFA } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { type SavedCart, type SavedCartStatus, useSavedCarts } from "@/store/saved-carts";
import { useAdmin, useCan } from "../actor-context";
import { DemoChip, PageHeader } from "../ui";
import { ReadOnlyNotice } from "../read-only";

const STATUS: Record<SavedCartStatus, { label: string; tone: string }> = {
  pending: { label: "À relancer", tone: "bg-akua-red/10 text-akua-red" },
  contacted: { label: "Relancé", tone: "bg-akua-blue-100 text-akua-blue" },
  ordered: { label: "Commandé", tone: "bg-akua-whatsapp/12 text-[#128c4a]" },
  lost: { label: "Sans suite", tone: "bg-akua-page text-akua-gray-500" },
};
const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Message de relance pré-rempli, envoyé au client sur WhatsApp. */
function relanceLink(c: SavedCart) {
  const first = c.name.split(" ")[0];
  const lines = [
    `Bonjour ${first},`,
    "",
    "Merci pour votre visite sur AKUA Service. Vous avez enregistré ce panier :",
    ...c.items.map((i) => `- ${i.quantity} × ${i.name} (${formatFCFA(i.price * i.quantity)})`),
    `Total : ${formatFCFA(c.subtotal)}`,
    "",
    "Avez-vous une question avant de commander ? Nous pouvons vous aider à finaliser votre commande ou vous conseiller.",
  ];
  const d = c.phone.replace(/\D/g, "");
  return `https://wa.me/${d}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function CartMenu({ c, onStatus, onDelete }: { c: SavedCart; onStatus: (s: SavedCartStatus) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const can = useCan();
  const manage = can("carts", "manage");
  const del = can("carts", "delete");
  const item = "flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[14px] font-medium hover:bg-akua-page";
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  if (!manage && !del) return null;
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`Actions pour le panier de ${c.name}`} aria-expanded={open} className="grid size-10 place-items-center rounded-full border border-akua-gray-200 text-akua-gray-500 hover:border-akua-ink hover:text-akua-ink">
        <MoreHorizontal aria-hidden className="size-5" />
      </button>
      {open && (
        <>
          <button type="button" aria-label="Fermer" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 bottom-full z-40 mb-1 w-56 rounded-[18px] border border-akua-gray-200 bg-akua-white p-1.5 shadow-[0_24px_60px_-24px_rgb(11_16_32/0.35)] sm:top-full sm:bottom-auto sm:mt-1 sm:mb-0">
            {manage && c.status !== "ordered" && (
              <button role="menuitem" type="button" className={item} onClick={run(() => onStatus("ordered"))}>
                <CheckCircle2 aria-hidden className="size-4 text-[#128c4a]" /> Marquer « Commandé »
              </button>
            )}
            {manage && c.status !== "lost" && (
              <button role="menuitem" type="button" className={item} onClick={run(() => onStatus("lost"))}>
                <XCircle aria-hidden className="size-4 text-akua-gray-500" /> Marquer « Sans suite »
              </button>
            )}
            {manage && c.status !== "pending" && (
              <button role="menuitem" type="button" className={item} onClick={run(() => onStatus("pending"))}>
                <ShoppingBag aria-hidden className="size-4 text-akua-gray-500" /> Remettre « À relancer »
              </button>
            )}
            {del && (
              <>
                {manage && <div className="my-1 h-px bg-akua-gray-200" />}
                <button role="menuitem" type="button" className={cn(item, "text-akua-red hover:bg-akua-red/5")} onClick={run(onDelete)}>
                  <Trash2 aria-hidden className="size-4" /> Supprimer
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

type Tab = "all" | SavedCartStatus;

export function CartsView() {
  const hydrated = useHydrated();
  const { actor } = useAdmin();
  const real = useSavedCarts((s) => s.carts);
  const setStatus = useSavedCarts((s) => s.setStatus);
  const can = useCan();
  const remove = useSavedCarts((s) => s.remove);
  useEffect(() => void useSavedCarts.getState().load(), []);
  const [tab, setTab] = useState<Tab>("pending");
  const [toDelete, setToDelete] = useState<SavedCart | null>(null);
  // exemples : modifiables le temps de la visite, pour tester le fonctionnement
  const [demo, setDemo] = useState<SavedCart[]>(DEMO_SAVED_CARTS);

  const all = useMemo(() => [...(hydrated ? real : []), ...demo].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [real, demo, hydrated]);
  const list = tab === "all" ? all : all.filter((c) => c.status === tab);
  const count = (t: Tab) => (t === "all" ? all.length : all.filter((c) => c.status === t).length);
  const pendingValue = all.filter((c) => c.status === "pending").reduce((s, c) => s + c.subtotal, 0);
  const isDemo = (c: SavedCart) => c.id.startsWith("demo-");

  const update = (c: SavedCart, status: SavedCartStatus) => {
    if (isDemo(c)) setDemo((d) => d.map((x) => (x.id === c.id ? { ...x, status, updatedAt: new Date().toISOString(), ...(status === "contacted" ? { contactedAt: new Date().toISOString(), contactedBy: actor.name } : {}) } : x)));
    else setStatus(c.id, status, actor.name);
  };

  if (!hydrated) return <div className="h-[60vh] animate-pulse rounded-[24px] bg-akua-white" />;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title="Paniers" description="Les clients qui ont enregistré leur panier sans envoyer la commande. Relancez-les sur WhatsApp en un clic." />
      <ReadOnlyNotice module="carts" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { t: "À relancer", v: String(count("pending")) },
          { t: "Montant en attente", v: formatFCFA(pendingValue) },
          { t: "Relancés", v: String(count("contacted")) },
          { t: "Commandés ensuite", v: String(count("ordered")) },
        ].map((x) => (
          <div key={x.t} className="rounded-[20px] border border-akua-gray-200 bg-akua-white p-4">
            <p className="text-[12.5px] text-akua-gray-500">{x.t}</p>
            <p className="mt-1 text-[22px] font-extrabold tracking-[-0.02em] tabular-nums">{x.v}</p>
          </div>
        ))}
      </div>

      <div role="tablist" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {(["pending", "contacted", "ordered", "lost", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-colors", tab === t ? "bg-akua-ink text-akua-white" : "bg-akua-white ring-1 ring-akua-gray-200 hover:ring-akua-ink")}
          >
            {t === "all" ? "Tous" : STATUS[t].label}
            <span className={cn("rounded-full px-1.5 text-[11.5px] tabular-nums", tab === t ? "bg-akua-white/15" : "bg-akua-page text-akua-gray-500")}>{count(t)}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-[24px] border border-dashed border-akua-gray-200 bg-akua-white px-6 py-16 text-center">
          <ShoppingBag aria-hidden className="size-10 text-akua-gray-200" strokeWidth={1.3} />
          <p className="mt-3 text-[16px] font-bold">Aucun panier ici</p>
          <p className="mt-1 text-[14px] text-akua-gray-500">Les paniers enregistrés depuis la page Panier du site apparaîtront ici.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((c) => (
            <li key={c.id} className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5">
              <div className="flex flex-col gap-5 lg:flex-row">
                {/* client */}
                <div className="min-w-0 lg:w-[300px] lg:shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-semibold", STATUS[c.status].tone)}>{STATUS[c.status].label}</span>
                    {isDemo(c) && <DemoChip />}
                  </div>
                  <p className="mt-2.5 text-[17px] font-bold">{c.name}</p>
                  <ul className="mt-2 flex flex-col gap-1.5 text-[13.5px]">
                    <li className="flex items-center gap-2">
                      <Phone aria-hidden className="size-4 shrink-0 text-akua-gray-500" />
                      <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="font-medium tabular-nums hover:text-akua-blue">
                        {c.phone}
                      </a>
                    </li>
                    {c.email && (
                      <li className="flex min-w-0 items-center gap-2">
                        <Mail aria-hidden className="size-4 shrink-0 text-akua-gray-500" />
                        <a href={`mailto:${c.email}`} className="truncate font-medium hover:text-akua-blue">
                          {c.email}
                        </a>
                      </li>
                    )}
                    {(c.city || c.country) && (
                      <li className="flex items-center gap-2">
                        <MapPin aria-hidden className="size-4 shrink-0 text-akua-gray-500" />
                        <span>{[c.city, c.country].filter(Boolean).join(", ")}</span>
                      </li>
                    )}
                  </ul>
                  <p className="mt-3 text-[12.5px] text-akua-gray-500">
                    Enregistré le {fmt.format(new Date(c.savedAt))}
                    {c.contactedAt ? ` · relancé ${timeAgo(new Date(c.contactedAt))}${c.contactedBy ? ` par ${c.contactedBy}` : ""}` : ""}
                    {c.orderedAt ? ` · commande envoyée ${timeAgo(new Date(c.orderedAt))}` : ""}
                  </p>
                </div>

                {/* articles */}
                <div className="min-w-0 flex-1">
                  <ul className="flex flex-col gap-2">
                    {c.items.map((i) => (
                      <li key={i.productId} className="flex items-center gap-3 rounded-[16px] bg-akua-page p-2 pr-3">
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-akua-white">
                          {i.image && <Image src={i.image} alt="" fill sizes="44px" className="object-contain p-1" unoptimized={i.image.startsWith("data:")} />}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{i.name}</span>
                        <span className="shrink-0 text-[13px] text-akua-gray-500 tabular-nums">× {i.quantity}</span>
                        <span className="w-[86px] shrink-0 text-right text-[13.5px] font-semibold tabular-nums">{formatFCFA(i.price * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between gap-3 px-1">
                    <span className="text-[13px] text-akua-gray-500">
                      {c.items.reduce((s, i) => s + i.quantity, 0)} article{c.items.reduce((s, i) => s + i.quantity, 0) > 1 ? "s" : ""}
                      {c.promoCode ? ` · code ${c.promoCode}` : ""}
                    </span>
                    <span className="text-[17px] font-extrabold tabular-nums">{formatFCFA(c.subtotal)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-akua-gray-200 pt-4">
                {c.status !== "ordered" && can("carts", "manage") && (
                  <a
                    href={relanceLink(c)}
                    target="_blank"
                    rel="noopener"
                    onClick={() => update(c, "contacted")}
                    className="btn-shine inline-flex h-10 items-center gap-2 rounded-full bg-akua-whatsapp px-4 text-[13.5px] font-semibold text-akua-white"
                  >
                    <WhatsAppIcon size={17} /> {c.status === "contacted" ? "Relancer à nouveau" : "Relancer sur WhatsApp"}
                  </a>
                )}
                <CartMenu
                  c={c}
                  onStatus={(st) => update(c, st)}
                  onDelete={() => (isDemo(c) ? setDemo((d) => d.filter((x) => x.id !== c.id)) : setToDelete(c))}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Supprimer le panier de ${toDelete?.name ?? ""} ?`}
        description="Ses coordonnées et son panier seront retirés de la liste."
        onConfirm={() => {
          if (toDelete) remove(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}

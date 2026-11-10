"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Globe2, MessageCircle, Monitor, Package, Smartphone, Tablet, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Flag } from "@/components/ui/flag";
import type { LiveResult } from "@/lib/analytics/aggregate";
import { cn } from "@/lib/utils";
import { useAdmin } from "../actor-context";
import { SourceIcon } from "./source-icon";

const FLAGS = new Set(["TG", "BJ", "GH", "BF", "CI", "NE", "ML"]);
const REFRESH = 10_000;

function ago(t: number, now: number) {
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 45) return "à l'instant";
  const m = Math.round(s / 60);
  return `il y a ${m} min`;
}

/** Chiffre qui défile quand il change. */
function Counter({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: "70%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-70%", opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Barres « visiteurs par minute » sur les 30 dernières minutes. */
function MinuteBars({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div>
      <div className="flex h-[72px] items-end gap-[3px]" role="img" aria-label="Visiteurs par minute sur les 30 dernières minutes">
        {data.map((v, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ height: `${Math.max(6, (v / max) * 100)}%` }}
            transition={{ duration: 0.5 }}
            title={`${v} visiteur${v > 1 ? "s" : ""}`}
            className={cn("min-w-0 flex-1 rounded-[3px]", i === data.length - 1 ? "bg-akua-whatsapp" : v ? "bg-akua-blue" : "bg-akua-gray-200")}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-akua-gray-500">
        <span>il y a 30 min</span>
        <span>maintenant</span>
      </div>
    </div>
  );
}

const DeviceIcon = ({ d }: { d: string }) => {
  const Icon = d === "mobile" ? Smartphone : d === "tablet" ? Tablet : Monitor;
  return <Icon aria-hidden className="size-3.5 shrink-0 text-akua-gray-500" strokeWidth={1.8} />;
};

/** Statistiques en direct : qui est sur le site maintenant, sur quelles pages, d'où. */
export function LivePanel() {
  const { base } = useAdmin();
  const [live, setLive] = useState<LiveResult | null>(null);
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    let on = true;
    const load = () =>
      fetch(`${base}/api/stats/live`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: LiveResult | null) => on && d && setLive(d))
        .catch(() => {});
    load();
    const id = window.setInterval(load, REFRESH);
    const clock = window.setInterval(() => setTick(Date.now()), 15_000);
    return () => {
      on = false;
      window.clearInterval(id);
      window.clearInterval(clock);
    };
  }, [base]);

  if (!live) return <div className="h-[340px] animate-pulse rounded-[28px] bg-akua-white ring-1 ring-akua-gray-200" />;
  const now = Math.max(tick, live.now);

  return (
    <section aria-label="En direct" className="overflow-hidden rounded-[28px] border border-akua-gray-200/90 bg-akua-white shadow-[0_1px_2px_rgb(11_16_32/0.03),0_24px_50px_-36px_rgb(31_91_255/0.45)]">
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* compteur */}
        <div className="relative overflow-hidden p-6 md:p-8">
          <div aria-hidden className="absolute -top-24 -left-24 size-72 rounded-full bg-akua-whatsapp/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] text-[#128c4a] uppercase">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-akua-whatsapp opacity-70" />
                <span className="relative inline-flex size-2.5 rounded-full bg-akua-whatsapp" />
              </span>
              En direct
            </p>
            <p className="text-[12px] text-akua-gray-500">{live.demo ? "Exemple" : "Actualisé toutes les 10 s"}</p>
          </div>

          <div className="relative mt-5 flex items-end gap-4">
            <p className="text-[76px] leading-[0.85] font-extrabold tracking-[-0.06em] md:text-[96px]">
              <Counter value={live.online} />
            </p>
            <p className="pb-1.5 text-[15px] leading-snug font-semibold">
              {live.online > 1 ? "visiteurs" : "visiteur"}
              <br />
              <span className="font-medium text-akua-gray-500">sur le site en ce moment</span>
            </p>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-[18px] bg-akua-page px-4 py-3">
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-akua-gray-500">
                <Users aria-hidden className="size-3.5" strokeWidth={1.9} /> 30 dernières minutes
              </p>
              <p className="mt-1 text-[22px] font-bold tabular-nums">{live.last30}</p>
            </div>
            <div className="rounded-[18px] bg-akua-page px-4 py-3">
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-akua-gray-500">
                <MessageCircle aria-hidden className="size-3.5" strokeWidth={1.9} /> Commandes (1 h)
              </p>
              <p className="mt-1 text-[22px] font-bold tabular-nums">{live.ordersHour}</p>
            </div>
          </div>

          <div className="relative mt-6">
            <MinuteBars data={live.perMinute} />
          </div>
        </div>

        {/* pages et dernières visites */}
        <div className="flex flex-col border-t border-akua-gray-200 lg:border-t-0 lg:border-l">
          <div className="p-5 md:p-6">
            <p className="text-[13px] font-bold">Pages consultées maintenant</p>
            {live.pages.length ? (
              <ul className="mt-3 flex flex-col gap-1.5">
                {live.pages.map((p) => (
                  <li key={p.path} className="flex items-center gap-2.5 text-[13.5px]">
                    {p.kind === "produit" ? <Package aria-hidden className="size-4 shrink-0 text-akua-gray-500" strokeWidth={1.7} /> : <FileText aria-hidden className="size-4 shrink-0 text-akua-gray-500" strokeWidth={1.7} />}
                    <span className="min-w-0 flex-1 truncate font-medium">{p.label}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-[#128c4a] tabular-nums">
                      <span className="size-1.5 rounded-full bg-akua-whatsapp" /> {p.visitors}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-akua-gray-500">Personne sur le site pour l&apos;instant.</p>
            )}
          </div>
          <div className="min-h-0 flex-1 border-t border-akua-gray-200 p-5 md:p-6">
            <p className="text-[13px] font-bold">Dernières visites</p>
            {live.recent.length ? (
              <ul className="mt-2">
                <AnimatePresence initial={false}>
                  {live.recent.map((r) => (
                    <motion.li key={`${r.t}-${r.path}`} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5 border-b border-akua-gray-200/70 py-2 text-[13px] last:border-0">
                      {FLAGS.has(r.country) ? <Flag code={r.country} /> : <Globe2 aria-hidden className="size-4 shrink-0 text-akua-gray-500" strokeWidth={1.7} />}
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium">{r.label}</span> <span className="text-akua-gray-500">· {r.countryName}</span>
                      </span>
                      <SourceIcon id={r.src} />
                      <DeviceIcon d={r.d} />
                      <span className="w-[74px] shrink-0 text-right text-[12px] text-akua-gray-500">{ago(r.t, now)}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-akua-gray-500">Aucune visite dans les 30 dernières minutes.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

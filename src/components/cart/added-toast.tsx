"use client";

import { useMoney } from "@/components/currency";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";

/** Confirmation d'ajout : accès direct à la page panier. */
export function AddedToast() {
  const money = useMoney();
  const toast = useUI((s) => s.toast);
  const dismiss = useUI((s) => s.dismissToast);
  const onProduct = usePathname().startsWith("/produit/");

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(dismiss, 4200);
    return () => window.clearTimeout(id);
  }, [toast, dismiss]);

  return (
    <div aria-live="polite" className={cn("pointer-events-none fixed inset-x-3 z-[60] flex justify-center lg:inset-x-auto lg:top-[88px] lg:right-6 lg:bottom-auto", onProduct ? "bottom-[calc(154px+env(safe-area-inset-bottom))]" : "bottom-[calc(78px+env(safe-area-inset-bottom))]")}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto w-full max-w-[420px] rounded-[22px] border border-akua-gray-200 bg-akua-white p-3 shadow-[0_24px_60px_-20px_rgb(11_16_32/0.5)] lg:w-[380px]"
          >
            <div className="flex items-center gap-3">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-akua-tile">
                {toast.image && <Image src={toast.image} alt="" fill sizes="56px" className="object-contain p-1.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-akua-blue">
                  <CheckCircle2 aria-hidden className="size-4" /> Ajouté au panier
                </p>
                <p className="line-clamp-1 text-[14px] font-semibold text-akua-ink">{toast.name}</p>
                <p className="text-[12.5px] text-akua-gray-500">
                  {toast.quantity} × {money(toast.price)}
                </p>
              </div>
              <button type="button" onClick={dismiss} aria-label="Fermer" className="grid size-8 place-items-center self-start rounded-full text-akua-gray-500 hover:bg-akua-tile">
                <X aria-hidden className="size-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={dismiss} className="h-11 rounded-full border border-akua-gray-200 text-[13.5px] font-semibold hover:border-akua-ink">
                Continuer
              </button>
              <Link href="/panier" onClick={dismiss} className="btn-shine grid h-11 place-items-center rounded-full bg-akua-ink text-[13.5px] font-semibold text-akua-white hover:bg-akua-blue">
                Voir mon panier
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

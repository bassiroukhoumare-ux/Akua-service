"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { formatFCFA, pluralize } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { waLink } from "@/lib/whatsapp";
import { selectCount, selectTotal, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";

/** Mobile : barre « Voir mon panier » au-dessus de la navigation basse (réf. « View your cart »). */
export function CartBar() {
  const hydrated = useHydrated();
  const count = useCart(selectCount);
  const total = useCart(selectTotal);
  const path = usePathname();
  const toast = useUI((s) => s.toast);
  const hidden = path.startsWith("/produit/") || path === "/panier" || !!toast;

  return (
    <AnimatePresence>
      {hydrated && count > 0 && !hidden && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-3 bottom-[calc(74px+env(safe-area-inset-bottom))] z-40 lg:hidden"
        >
          <Link href="/panier" className="flex h-[58px] items-center gap-3 rounded-[20px] bg-akua-blue pr-2 pl-5 text-akua-white shadow-[0_18px_36px_-14px_rgb(31_91_255/0.7)]">
            <span className="text-[15px] font-semibold">Voir mon panier</span>
            <span className="rounded-full bg-akua-white/20 px-2.5 py-0.5 text-[12px] font-semibold">{pluralize(count, "article")}</span>
            <span className="price ml-auto text-[17px]">{formatFCFA(total)}</span>
            <span className="grid size-10 place-items-center rounded-2xl bg-akua-white text-akua-blue">
              <ArrowRight aria-hidden className="size-5" />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Desktop : logo WhatsApp officiel flottant. */
export function WhatsAppFab() {
  return (
    <a
      href={waLink("Bonjour AKUA Service, j'ai une question.")}
      target="_blank"
      rel="noopener"
      aria-label="Discuter sur WhatsApp"
      className="fixed right-6 bottom-6 z-40 hidden size-14 rounded-full shadow-[0_16px_32px_-12px_rgb(37_211_102/0.8)] transition-transform duration-300 hover:scale-110 lg:block"
    >
      <WhatsAppIcon size={56} variant="color" />
    </a>
  );
}

"use client";

import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Ouvert du lundi au samedi, de 10 h à 20 h (heure locale du visiteur). */
function isOpen(d: Date) {
  const day = d.getDay();
  const h = d.getHours() + d.getMinutes() / 60;
  return day !== 0 && h >= 10 && h < 20;
}

/** Statut d'ouverture : cadenas ouvert / fermé, toujours sur une seule ligne. */
export function OpenStatus({ className }: { className?: string }) {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const tick = () => setOpen(isOpen(new Date()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  if (open === null) return null;
  const Icon = open ? LockKeyholeOpen : LockKeyhole;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] leading-none font-semibold whitespace-nowrap",
        open ? "bg-akua-whatsapp/12 text-[#128c4a]" : "bg-akua-red/10 text-akua-red",
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" strokeWidth={2.2} />
      {open ? "Ouvert actuellement" : "Fermé actuellement"}
    </span>
  );
}

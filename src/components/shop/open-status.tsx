"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Ouvert du lundi au samedi, de 10 h à 20 h (heure locale du visiteur). */
function isOpen(d: Date) {
  const day = d.getDay();
  const h = d.getHours() + d.getMinutes() / 60;
  return day !== 0 && h >= 10 && h < 20;
}

export function OpenStatus({ className }: { className?: string }) {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const tick = () => setOpen(isOpen(new Date()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  if (open === null) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold", open ? "bg-akua-whatsapp/12 text-akua-ink" : "bg-akua-red/10 text-akua-red", className)}>
      <span className={cn("size-2 rounded-full", open ? "bg-akua-whatsapp" : "bg-akua-red")} />
      {open ? "Ouvert maintenant" : "Fermé actuellement"}
    </span>
  );
}

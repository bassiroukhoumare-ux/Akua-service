"use client";

import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { btn } from "@/lib/btn";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

/** Fenêtre de confirmation avant une action destructive (suppression). */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Supprimer", cancelLabel = "Annuler", onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-32px)] max-w-[400px] gap-0 rounded-[28px] border border-akua-gray-200 bg-akua-white p-6 text-center shadow-[0_40px_80px_-40px_rgb(11_16_32/0.45)] sm:p-7"
      >
        <Trash2 aria-hidden className="mx-auto size-8 text-akua-red" strokeWidth={1.4} />
        <DialogTitle className="mt-4 text-[19px] leading-snug font-extrabold tracking-[-0.02em] text-akua-ink">{title}</DialogTitle>
        {description && <DialogDescription className="mt-2 text-[14px] leading-relaxed text-akua-gray-500">{description}</DialogDescription>}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button type="button" autoFocus onClick={() => onOpenChange(false)} className={btn({ variant: "outline", size: "md" })}>
            <span>{cancelLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={btn({ variant: "dark", size: "md" })}
          >
            <span>{confirmLabel}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

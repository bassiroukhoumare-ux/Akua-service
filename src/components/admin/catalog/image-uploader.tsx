"use client";

import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const MAX_IMAGES = 4;
const MAX_SIDE = 1200;

/** Réduit la photo (1200 px max, WebP) pour un chargement rapide sur le site. */
function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const r = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * r);
      c.height = Math.round(img.height * r);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/webp", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image illisible"));
    };
    img.src = url;
  });
}

/** Jusqu'à 4 photos : glisser-déposer ou parcourir, réordonner (la 1re est la photo principale), supprimer. */
export function ImageUploader({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [msg, setMsg] = useState("");
  const free = MAX_IMAGES - value.length;

  async function add(files: FileList | null) {
    if (!files?.length) return;
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return setMsg("Seules les images sont acceptées (JPG, PNG, WebP).");
    if (list.length > free) setMsg(`${MAX_IMAGES} photos maximum : seules les ${free} premières ont été ajoutées.`);
    else setMsg("");
    setBusy(true);
    try {
      const out = await Promise.all(list.slice(0, free).map(compress));
      onChange([...value, ...out]);
    } catch {
      setMsg("Une image n'a pas pu être lue. Essayez un autre fichier.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((src, i) => (
          <div key={src.slice(-40) + i} className="group relative aspect-square overflow-hidden rounded-[18px] border border-akua-gray-200 bg-akua-tile">
            <Image src={src} alt={`Photo ${i + 1}`} fill sizes="(min-width:640px) 180px, 45vw" className="object-contain p-2" unoptimized={src.startsWith("data:")} />
            {i === 0 && (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-akua-ink px-2 py-0.5 text-[11px] font-semibold text-akua-white">
                <Star aria-hidden className="size-3 fill-current" strokeWidth={0} /> Principale
              </span>
            )}
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Déplacer vers la gauche" className="grid size-8 place-items-center rounded-full bg-akua-white/95 text-akua-ink shadow-sm disabled:opacity-30">
                  <ChevronLeft aria-hidden className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Déplacer vers la droite" className="grid size-8 place-items-center rounded-full bg-akua-white/95 text-akua-ink shadow-sm disabled:opacity-30">
                  <ChevronRight aria-hidden className="size-4" />
                </button>
              </div>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label={`Supprimer la photo ${i + 1}`} className="grid size-8 place-items-center rounded-full bg-akua-white/95 text-akua-red shadow-sm">
                <Trash2 aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {free > 0 && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              add(e.dataTransfer.files);
            }}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed p-3 text-center transition-colors",
              over ? "border-akua-blue bg-akua-blue-100/60" : error ? "border-akua-red/60 bg-akua-red/[0.03]" : "border-akua-gray-200 hover:border-akua-blue hover:bg-akua-blue-100/30",
              value.length === 0 && "col-span-2 aspect-auto min-h-[180px] sm:col-span-4",
            )}
          >
            {busy ? <Loader2 aria-hidden className="size-7 animate-spin text-akua-blue" /> : <ImagePlus aria-hidden className="size-7 text-akua-blue" strokeWidth={1.6} />}
            <span className="text-[14px] font-semibold">{value.length ? "Ajouter une photo" : "Ajoutez les photos du produit"}</span>
            <span className="text-[12.5px] text-akua-gray-500">
              {value.length ? `${free} restante${free > 1 ? "s" : ""}` : `Glissez-les ici ou cliquez pour parcourir · ${MAX_IMAGES} photos maximum`}
            </span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
      {(error || msg) && <p className={cn("mt-2 text-[12.5px] font-medium", error ? "text-akua-red" : "text-akua-gray-500")}>{error || msg}</p>}
      {!error && !msg && value.length > 0 && <p className="mt-2 text-[12.5px] text-akua-gray-500">La première photo est la photo principale. Utilisez les flèches pour changer l&apos;ordre.</p>}
    </div>
  );
}

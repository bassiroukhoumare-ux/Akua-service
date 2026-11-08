"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { Popover } from "radix-ui";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  /** texte affiché dans le bouton une fois choisi (par défaut : label) */
  display?: string;
  /** petit texte gris à droite (ex. « Livraison directe ») */
  hint?: string;
  /** visuel à gauche (drapeau, icône) */
  icon?: React.ReactNode;
  /** titre de groupe : un intertitre s'affiche quand il change */
  group?: string;
};

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** recherche affichée : automatique dès 7 éléments */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** texte quand la recherche ne trouve rien */
  emptyText?: string;
  invalid?: boolean;
  /** « field » : champ de formulaire ; « pill » : bouton arrondi (tri) */
  variant?: "field" | "pill";
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
};

/** Recherche insensible aux accents et à la casse : « cote » trouve « Côte d'Ivoire ». */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .trim();

/**
 * Liste déroulante aux couleurs d'AKUA Service, avec recherche intégrée.
 * Remplace les <select> du navigateur partout sur le site.
 */
export function SearchSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Choisir…",
  searchable,
  searchPlaceholder = "Rechercher…",
  emptyText = "Aucun résultat",
  invalid,
  variant = "field",
  className,
  ...aria
}: Props) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const withSearch = searchable ?? options.length >= 7;
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return options;
    return options.filter((o) => norm(o.label).includes(q) || (o.hint && norm(o.hint).includes(q)));
  }, [options, query]);

  // à l'ouverture : recherche vide, élément choisi en surbrillance et visible
  const onOpenChange = (next: boolean) => {
    if (next) {
      setQuery("");
      setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    }
    setOpen(next);
  };

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open, filtered]);

  const pick = (o: SelectOption) => {
    onChange(o.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = filtered.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (n) setActive((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (n) setActive((i) => (i - 1 + n) % n);
    } else if (e.key === "Home" && !withSearch) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End" && !withSearch) {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = filtered[active];
      if (o) pick(o);
    } else if (e.key === "Tab") setOpen(false);
  };

  const activeId = filtered[active] ? `${uid}-o-${active}` : undefined;

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        aria-label={aria["aria-label"]}
        aria-describedby={aria["aria-describedby"]}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            onOpenChange(true);
          }
        }}
        className={cn(
          "group/sel flex w-full min-w-0 cursor-pointer items-center gap-2.5 bg-akua-white text-left text-akua-ink outline-none transition-[border-color,box-shadow,background-color]",
          variant === "field"
            ? cn(
                "h-12 rounded-2xl border px-4 text-[15px] focus-visible:border-akua-blue focus-visible:ring-4 focus-visible:ring-akua-blue/10 data-[state=open]:border-akua-blue data-[state=open]:ring-4 data-[state=open]:ring-akua-blue/10",
                invalid ? "border-akua-red" : "border-akua-gray-200 hover:border-akua-gray-500/40",
              )
            : "h-10 rounded-full border border-akua-gray-200 pr-3 pl-4 text-[13.5px] font-medium hover:border-akua-ink focus-visible:border-akua-blue focus-visible:ring-4 focus-visible:ring-akua-blue/10 data-[state=open]:border-akua-ink",
          className,
        )}
      >
        {selected?.icon}
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-akua-gray-500")}>{selected ? (selected.display ?? selected.label) : placeholder}</span>
        <ChevronDown aria-hidden className="size-[18px] shrink-0 text-akua-gray-500 transition-transform duration-300 group-data-[state=open]/sel:rotate-180" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (withSearch ? inputRef.current : listRef.current)?.focus({ preventScroll: true });
          }}
          onKeyDown={onKeyDown}
          className="z-[80] flex w-[max(var(--radix-popover-trigger-width),232px)] max-w-[calc(100vw-24px)] origin-(--radix-popover-content-transform-origin) flex-col overflow-hidden rounded-[20px] border border-akua-gray-200 bg-akua-white shadow-[0_24px_60px_-24px_rgb(11_16_32/0.35),0_2px_6px_rgb(11_16_32/0.05)] outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1"
          style={{ maxHeight: "min(380px, var(--radix-popover-content-available-height))" }}
        >
          {withSearch && (
            <div className="border-b border-akua-gray-200 p-2">
              <div className="relative">
                <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-akua-gray-500" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  aria-controls={listId}
                  aria-activedescendant={activeId}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-10 w-full rounded-xl bg-akua-page pr-9 pl-9 text-[16px] sm:text-[14.5px] text-akua-ink outline-none placeholder:text-akua-gray-500 focus:ring-2 focus:ring-akua-blue/25"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActive(0);
                      inputRef.current?.focus();
                    }}
                    aria-label="Effacer la recherche"
                    className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-white hover:text-akua-ink"
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={withSearch ? -1 : 0}
            aria-label={aria["aria-label"] ?? placeholder}
            aria-activedescendant={withSearch ? undefined : activeId}
            className="min-h-0 flex-1 overscroll-contain overflow-y-auto p-1.5 outline-none"
          >
            {filtered.length === 0 && <p className="px-3 py-6 text-center text-[13.5px] text-akua-gray-500">{emptyText}</p>}
            {filtered.map((o, i) => {
              const isSel = o.value === value;
              const showGroup = o.group && o.group !== filtered[i - 1]?.group;
              return (
                <div key={o.value}>
                  {showGroup && <p className={cn("px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.08em] text-akua-gray-500 uppercase", i > 0 && "mt-1 border-t border-akua-gray-200 pt-3")}>{o.group}</p>}
                  <div
                    id={`${uid}-o-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSel}
                    onPointerMove={() => active !== i && setActive(i)}
                    onClick={() => pick(o)}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[14.5px] transition-colors select-none",
                      i === active ? "bg-akua-page" : "bg-transparent",
                      isSel ? "font-semibold text-akua-blue" : "text-akua-ink",
                    )}
                  >
                    {o.icon}
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {o.hint && <span className="shrink-0 text-[12px] font-normal text-akua-gray-500">{o.hint}</span>}
                    <Check aria-hidden className={cn("size-4 shrink-0 text-akua-blue", isSel ? "opacity-100" : "opacity-0")} strokeWidth={2.5} />
                  </div>
                </div>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

"use client";

import { ArrowDown, ArrowUp, Check, ExternalLink, Pencil, Plus, Search, RotateCcw, Shapes, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { SearchSelect } from "@/components/ui/search-select";
import { btn } from "@/lib/btn";
import { CATEGORY_ICON_DEFS, getCategoryIcon, suggestCategoryIcon } from "@/lib/icons";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { newCategoryId, slugify, useAdminCatalog } from "@/store/admin-catalog";
import type { Category } from "@/types/catalog";
import { useAdmin } from "../actor-context";
import { Field, inputCls } from "../form";
import { DemoNotice, PageHeader } from "../ui";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function CategoryDialog({ open, onOpenChange, initial }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: Category }) {
  const { actor } = useAdmin();
  const categories = useAdminCatalog((s) => s.categories);
  const save = useAdminCatalog((s) => s.saveCategory);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [manual, setManual] = useState(false);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setIcon(initial?.icon ?? "");
    setManual(!!initial);
    setQ("");
    setError("");
  }, [open, initial]);

  // icône proposée automatiquement d'après le nom, tant qu'aucune n'a été choisie à la main
  const suggestion = useMemo(() => suggestCategoryIcon(name), [name]);
  useEffect(() => {
    if (!manual) setIcon(suggestion ?? "");
  }, [suggestion, manual]);

  const icons = useMemo(() => {
    const n = norm(q.trim());
    return Object.entries(CATEGORY_ICON_DEFS).filter(([, d]) => !n || norm(d.label).includes(n) || d.keywords.some((k) => k.includes(n)));
  }, [q]);

  const slug = slugify(name);
  const Preview = getCategoryIcon(icon);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Indiquez le nom de la catégorie.");
    if (categories.some((c) => c.id !== initial?.id && slugify(c.name) === slug)) return setError("Une catégorie porte déjà ce nom.");
    save({ id: initial?.id ?? newCategoryId(), slug: initial?.slug ?? slug, name: name.trim(), icon: icon || "console", description: description.trim() || undefined, order: initial?.order ?? 0 }, actor);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
        className="flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[600px] flex-col gap-0 overflow-hidden rounded-[28px] border border-akua-gray-200 bg-akua-white p-0 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0 sm:max-w-[600px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-akua-gray-200 px-5 py-5 sm:px-7">
          <div>
            <DialogTitle className="text-[20px] font-extrabold tracking-[-0.02em]">{initial ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
            <DialogDescription className="mt-1 text-[13.5px] text-akua-gray-500">L&apos;icône est proposée automatiquement d&apos;après le nom. Vous pouvez en choisir une autre.</DialogDescription>
          </div>
          <button type="button" onClick={() => onOpenChange(false)} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-akua-page">
            <X aria-hidden className="size-[18px]" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            <div className="flex items-start gap-4">
              <span className={cn("grid size-[72px] shrink-0 place-items-center rounded-[22px] transition-colors", icon ? "bg-akua-blue-100 text-akua-blue" : "bg-akua-page text-akua-gray-500")}>
                <Preview aria-hidden className="size-9" strokeWidth={1.4} />
              </span>
              <div className="min-w-0 flex-1">
                <Field id="cat-name" label="Nom de la catégorie" error={error} hint={slug ? `Adresse : /boutique/${initial?.slug ?? slug}` : undefined}>
                  <input id="cat-name" value={name} onChange={(e) => (setName(e.target.value), setError(""))} placeholder="Ex. Casques audio" autoFocus className={inputCls(error)} />
                </Field>
              </div>
            </div>

            {!manual && suggestion && (
              <p className="mt-3 flex items-center gap-2 rounded-[14px] bg-akua-blue-100/60 px-3.5 py-2.5 text-[13px]">
                <Shapes aria-hidden className="size-4 shrink-0 text-akua-blue" strokeWidth={1.8} />
                Icône proposée : <span className="font-semibold">{CATEGORY_ICON_DEFS[suggestion]?.label}</span>
              </p>
            )}

            <Field label="Description" optional className="mt-4">
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex. Casques gaming, écouteurs et micros." className={inputCls()} />
            </Field>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[13.5px] font-medium">Icône</p>
                {manual && (
                  <button type="button" onClick={() => setManual(false)} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-akua-blue">
                    <RotateCcw aria-hidden className="size-3.5" /> Revenir à la proposition
                  </button>
                )}
              </div>
              <div className="relative mb-3">
                <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-akua-gray-500" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une icône (casque, câble, montre…)" className="h-11 w-full rounded-xl bg-akua-page pr-3 pl-10 text-[16px] outline-none focus:ring-2 focus:ring-akua-blue/25 sm:text-[14px]" />
              </div>
              <div role="radiogroup" aria-label="Icône de la catégorie" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {icons.map(([key, def]) => {
                  const on = key === icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      title={def.label}
                      onClick={() => {
                        setIcon(key);
                        setManual(true);
                      }}
                      className={cn(
                        "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-[16px] border p-1 transition-colors",
                        on ? "border-akua-blue bg-akua-blue-100 text-akua-blue" : "border-transparent bg-akua-page text-akua-ink hover:border-akua-gray-200 hover:bg-akua-white",
                      )}
                    >
                      <def.icon aria-hidden className="size-6" strokeWidth={1.5} />
                      <span className="line-clamp-1 max-w-full px-0.5 text-[10px] font-medium">{def.label}</span>
                      {on && <Check aria-hidden className="absolute top-1.5 right-1.5 size-3.5" strokeWidth={3} />}
                    </button>
                  );
                })}
                {icons.length === 0 && <p className="col-span-full py-6 text-center text-[13px] text-akua-gray-500">Aucune icône ne correspond.</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2.5 border-t border-akua-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button type="button" onClick={() => onOpenChange(false)} className={btn({ variant: "outline", size: "md" })}>
              Annuler
            </button>
            <button type="submit" className={btn({ variant: "primary", size: "md" })}>
              <Check aria-hidden className="size-4" /> {initial ? "Enregistrer" : "Créer la catégorie"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const { actor } = useAdmin();
  const categories = useAdminCatalog((s) => s.categories);
  const products = useAdminCatalog((s) => s.products);
  const del = useAdminCatalog((s) => s.deleteCategory);
  const [moveTo, setMoveTo] = useState("");
  useEffect(() => setMoveTo(""), [category]);
  if (!category) return null;
  const count = products.filter((p) => p.categoryId === category.id).length;
  const others = categories.filter((c) => c.id !== category.id).sort((a, b) => a.order - b.order);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-akua-ink/35 backdrop-blur-[6px] supports-backdrop-filter:backdrop-blur-[6px]"
        className="w-[calc(100%-24px)] max-w-[440px] gap-0 rounded-[28px] border border-akua-gray-200 bg-akua-white p-6 text-akua-ink shadow-[0_40px_80px_-30px_rgb(11_16_32/0.45)] ring-0 sm:max-w-[440px] sm:p-7"
      >
        <Trash2 aria-hidden className="size-8 text-akua-red" strokeWidth={1.4} />
        <DialogTitle className="mt-4 text-[19px] font-extrabold tracking-[-0.02em]">Supprimer « {category.name} » ?</DialogTitle>
        <DialogDescription className="mt-2 text-[14px] text-akua-gray-500">
          {count ? `${count} produit${count > 1 ? "s sont rangés" : " est rangé"} dans cette catégorie. Choisissez où les déplacer.` : "Aucun produit n'est rangé dans cette catégorie."}
        </DialogDescription>
        {count > 0 && (
          <div className="mt-4">
            <SearchSelect value={moveTo} onChange={setMoveTo} options={others.map((c) => ({ value: c.id, label: c.name }))} placeholder="Déplacer les produits vers…" aria-label="Catégorie de destination" />
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button type="button" onClick={onClose} className={btn({ variant: "outline", size: "md" })}>
            Annuler
          </button>
          <button
            type="button"
            disabled={count > 0 && !moveTo}
            onClick={() => {
              del(category.id, moveTo || null, actor);
              onClose();
            }}
            className={btn({ variant: "primary", size: "md", className: "bg-akua-red hover:bg-akua-red/90" })}
          >
            Supprimer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesView() {
  const hydrated = useHydrated();
  const categories = useAdminCatalog((s) => s.categories);
  const products = useAdminCatalog((s) => s.products);
  const move = useAdminCatalog((s) => s.moveCategory);
  const [editing, setEditing] = useState<Category | undefined>();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader
        title="Catégories"
        description="Les rayons de la boutique, dans l'ordre où ils apparaissent sur le site."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
            className={btn({ variant: "primary", size: "md" })}
          >
            <Plus aria-hidden className="size-[18px]" /> Nouvelle catégorie
          </button>
        }
      />
      <DemoNotice>Vos modifications sont gardées dans ce navigateur pour tester le design. Elles s&apos;appliqueront au site dès que la base de données sera branchée.</DemoNotice>

      {!hydrated ? (
        <div className="h-80 animate-pulse rounded-[24px] bg-akua-white" />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c, i) => {
            const Icon = getCategoryIcon(c.icon);
            const n = products.filter((p) => p.categoryId === c.id).length;
            return (
              <li key={c.id} className="group flex flex-col rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 transition-colors hover:border-akua-gray-500/40">
                <div className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-akua-page transition-colors group-hover:bg-akua-blue-100">
                    <Icon aria-hidden className="size-7 text-akua-ink transition-colors group-hover:text-akua-blue" strokeWidth={1.4} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2">
                      <span className="truncate text-[16px] font-bold">{c.name}</span>
                      <span className="shrink-0 rounded-full bg-akua-page px-2 py-0.5 text-[11.5px] font-semibold text-akua-gray-500 tabular-nums">{i + 1}</span>
                    </p>
                    <p className="mt-0.5 text-[13px] text-akua-gray-500">
                      {n} produit{n > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                {c.description && <p className="mt-3 line-clamp-2 text-[13.5px] text-akua-gray-500">{c.description}</p>}
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(c.id, -1)} disabled={i === 0} aria-label={`Monter ${c.name}`} className="grid size-9 place-items-center rounded-full border border-akua-gray-200 hover:border-akua-ink disabled:opacity-30">
                      <ArrowUp aria-hidden className="size-4" />
                    </button>
                    <button type="button" onClick={() => move(c.id, 1)} disabled={i === sorted.length - 1} aria-label={`Descendre ${c.name}`} className="grid size-9 place-items-center rounded-full border border-akua-gray-200 hover:border-akua-ink disabled:opacity-30">
                      <ArrowDown aria-hidden className="size-4" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/boutique/${c.slug}`} target="_blank" aria-label={`Voir ${c.name} sur le site`} className="grid size-9 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-page hover:text-akua-ink">
                      <ExternalLink aria-hidden className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(c);
                        setOpen(true);
                      }}
                      aria-label={`Modifier ${c.name}`}
                      className="grid size-9 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-page hover:text-akua-ink"
                    >
                      <Pencil aria-hidden className="size-4" />
                    </button>
                    <button type="button" onClick={() => setToDelete(c)} aria-label={`Supprimer ${c.name}`} className="grid size-9 place-items-center rounded-full text-akua-gray-500 hover:bg-akua-red/5 hover:text-akua-red">
                      <Trash2 aria-hidden className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CategoryDialog open={open} onOpenChange={setOpen} initial={editing} />
      <DeleteDialog category={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}

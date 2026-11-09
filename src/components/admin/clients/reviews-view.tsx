"use client";

import { Eye, EyeOff, Mail, MessageSquareText, Search, Star, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DEMO_REVIEW_ITEMS } from "@/lib/admin/demo";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { useReviews } from "@/store/reviews";
import type { Review } from "@/types/catalog";
import { DemoChip, DemoNotice, PageHeader } from "../ui";

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function Stars({ n, size = "size-4" }: { n: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${n} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className={cn(size, i < Math.round(n) ? "fill-akua-gold text-akua-gold" : "fill-akua-gray-200 text-akua-gray-200")} />
      ))}
    </span>
  );
}

type Tab = "all" | "publie" | "masque";

export function ReviewsView() {
  const hydrated = useHydrated();
  const real = useReviews((s) => s.reviews);
  const setStatus = useReviews((s) => s.setStatus);
  const remove = useReviews((s) => s.removeReview);
  useEffect(() => void useReviews.getState().load(true), []);
  const products = useAdminCatalog((s) => s.products);
  const [tab, setTab] = useState<Tab>("all");
  const [stars, setStars] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [toDelete, setToDelete] = useState<Review | null>(null);

  const all = useMemo(() => [...(hydrated ? real : []), ...DEMO_REVIEW_ITEMS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [real, hydrated]);
  const product = (id: string) => products.find((p) => p.id === id);
  const isDemo = (r: Review) => r.id.startsWith("demo-");

  const list = useMemo(() => {
    const n = norm(q.trim());
    return all.filter(
      (r) =>
        (tab === "all" || r.status === tab) &&
        (!stars || r.rating === stars) &&
        (!n || norm(`${r.firstName} ${r.lastName} ${r.email} ${r.country} ${r.comment} ${product(r.productId)?.name ?? ""}`).includes(n)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, tab, stars, q, products]);

  const published = all.filter((r) => r.status === "publie");
  const avg = published.length ? published.reduce((s, r) => s + r.rating, 0) / published.length : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: all.filter((r) => r.rating === n).length }));
  const maxDist = Math.max(1, ...dist.map((d) => d.c));

  if (!hydrated) return <div className="h-[60vh] animate-pulse rounded-[24px] bg-akua-white" />;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title="Avis" description="Tous les avis laissés sur vos produits. Masquez un avis pour le retirer du site sans le supprimer." />
      <DemoNotice>Les avis marqués « Exemple » montrent le design. Les vrais avis laissés sur le site (dans ce navigateur pour l&apos;instant) apparaissent en plus, et pour tous vos clients dès que la base de données sera branchée.</DemoNotice>

      {/* synthèse */}
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex items-center gap-5 rounded-[24px] border border-akua-gray-200 bg-akua-white p-5">
          <div>
            <p className="text-[44px] leading-none font-extrabold tracking-[-0.04em] tabular-nums">{avg.toFixed(1).replace(".", ",")}</p>
            <div className="mt-2">
              <Stars n={avg} />
            </div>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-2 text-center">
            {[
              { t: "Avis", v: all.length },
              { t: "Publiés", v: published.length },
              { t: "Masqués", v: all.length - published.length },
            ].map((x) => (
              <div key={x.t} className="rounded-[16px] bg-akua-page px-2 py-3">
                <p className="text-[20px] font-extrabold tabular-nums">{x.v}</p>
                <p className="text-[12px] text-akua-gray-500">{x.t}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-akua-gray-200 bg-akua-white p-5">
          <ul className="flex flex-col gap-1.5">
            {dist.map((d) => (
              <li key={d.n}>
                <button type="button" onClick={() => setStars(stars === d.n ? null : d.n)} aria-pressed={stars === d.n} className={cn("flex w-full items-center gap-3 rounded-xl px-2 py-1 text-[13px] transition-colors", stars === d.n ? "bg-akua-blue-100" : "hover:bg-akua-page")}>
                  <span className="flex w-9 items-center gap-1 font-semibold tabular-nums">
                    {d.n} <Star aria-hidden className="size-3.5 fill-akua-gold text-akua-gold" />
                  </span>
                  <span className="h-2 flex-1 rounded-full bg-akua-page">
                    <span className="block h-full rounded-full bg-akua-gold" style={{ width: `${(d.c / maxDist) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right text-akua-gray-500 tabular-nums">{d.c}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* filtres */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div role="tablist" className="flex gap-2">
          {(
            [
              ["all", "Tous"],
              ["publie", "Publiés"],
              ["masque", "Masqués"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn("h-10 rounded-full px-4 text-[13.5px] font-semibold transition-colors", tab === id ? "bg-akua-ink text-akua-white" : "bg-akua-white ring-1 ring-akua-gray-200 hover:ring-akua-ink")}
            >
              {label}
            </button>
          ))}
          {stars && (
            <button type="button" onClick={() => setStars(null)} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-akua-blue-100 px-3.5 text-[13px] font-semibold text-akua-blue">
              {stars} étoile{stars > 1 ? "s" : ""} <X aria-hidden className="size-3.5" />
            </button>
          )}
        </div>
        <div className="relative md:ml-auto md:w-[340px]">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-akua-gray-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, e-mail, produit, commentaire…" aria-label="Rechercher un avis" className="h-11 w-full rounded-2xl border border-akua-gray-200 bg-akua-white pr-4 pl-11 text-[16px] outline-none focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10 sm:text-[14.5px]" />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-[24px] border border-dashed border-akua-gray-200 bg-akua-white px-6 py-16 text-center">
          <MessageSquareText aria-hidden className="size-10 text-akua-gray-200" strokeWidth={1.3} />
          <p className="mt-3 text-[16px] font-bold">Aucun avis</p>
          <p className="mt-1 text-[14px] text-akua-gray-500">Aucun avis ne correspond à ces filtres.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((r) => {
            const p = product(r.productId);
            const demo = isDemo(r);
            const hidden = r.status === "masque";
            return (
              <li key={r.id} className={cn("rounded-[24px] border border-akua-gray-200 bg-akua-white p-5", hidden && "bg-akua-white/60")}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <Stars n={r.rating} />
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-semibold", hidden ? "bg-akua-page text-akua-gray-500" : "bg-akua-whatsapp/12 text-[#128c4a]")}>{hidden ? "Masqué" : "Publié"}</span>
                      {demo && <DemoChip />}
                      <span className="text-[12.5px] text-akua-gray-500">le {fmt.format(new Date(r.createdAt))}</span>
                    </div>
                    <p className={cn("mt-3 text-[15px] leading-relaxed", hidden && "text-akua-gray-500")}>« {r.comment} »</p>
                    <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <dt className="text-akua-gray-500">Prénom et nom</dt>
                        <dd className="font-semibold">
                          {r.firstName} {r.lastName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-akua-gray-500">Pays</dt>
                        <dd className="font-semibold">{r.country}</dd>
                      </div>
                      <div className="min-w-0 sm:col-span-2">
                        <dt className="text-akua-gray-500">E-mail (jamais affiché sur le site)</dt>
                        <dd className="truncate font-semibold">
                          <a href={`mailto:${r.email}`} className="hover:text-akua-blue">
                            {r.email}
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex flex-col gap-3 lg:w-[280px] lg:shrink-0">
                    {p ? (
                      <Link href={`/produit/${p.slug}`} target="_blank" className="flex items-center gap-3 rounded-[16px] bg-akua-page p-2.5 transition-colors hover:bg-akua-blue-100/60">
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-akua-white">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-contain p-1" unoptimized={p.images[0].startsWith("data:")} />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11.5px] text-akua-gray-500">Avis sur</span>
                          <span className="line-clamp-2 text-[13.5px] leading-snug font-semibold">{p.name}</span>
                        </span>
                      </Link>
                    ) : (
                      <p className="rounded-[16px] bg-akua-page p-3 text-[13px] text-akua-gray-500">Produit supprimé</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={demo}
                        title={demo ? "Exemple : action désactivée" : undefined}
                        onClick={() => setStatus(r.id, hidden ? "publie" : "masque")}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-akua-gray-200 text-[13px] font-semibold transition-colors hover:border-akua-ink disabled:opacity-40"
                      >
                        {hidden ? <Eye aria-hidden className="size-4" /> : <EyeOff aria-hidden className="size-4" />} {hidden ? "Publier" : "Masquer"}
                      </button>
                      <a
                        href={`mailto:${r.email}?subject=${encodeURIComponent(`Votre avis sur ${p?.name ?? "AKUA Service"}`)}`}
                        aria-label={`Répondre à ${r.firstName} par e-mail`}
                        title="Répondre par e-mail"
                        className="grid size-10 shrink-0 place-items-center rounded-full border border-akua-gray-200 transition-colors hover:border-akua-ink"
                      >
                        <Mail aria-hidden className="size-4" />
                      </a>
                      <button
                        type="button"
                        disabled={demo}
                        onClick={() => setToDelete(r)}
                        aria-label="Supprimer l'avis"
                        title={demo ? "Exemple : action désactivée" : "Supprimer"}
                        className="grid size-10 shrink-0 place-items-center rounded-full border border-akua-gray-200 text-akua-gray-500 transition-colors hover:border-akua-red hover:text-akua-red disabled:opacity-40"
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Supprimer cet avis ?"
        description="Il sera définitivement retiré. Pour le cacher sans le perdre, utilisez plutôt « Masquer »."
        onConfirm={() => {
          if (toDelete) remove(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}

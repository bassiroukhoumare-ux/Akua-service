"use client";

import { Check, Eye, EyeOff, Mail, MessageSquareText, Search, Star, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import { useAdminCatalog } from "@/store/admin-catalog";
import { useReviews } from "@/store/reviews";
import type { Review } from "@/types/catalog";
import { PageHeader } from "../ui";
import { useCan } from "../actor-context";
import { ReadOnlyNotice } from "../read-only";

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

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

  const loaded = useReviews((s) => s.loaded);
  const can = useCan();
  const all = useMemo(() => (hydrated ? [...real] : []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [real, hydrated]);
  const product = (id: string) => products.find((p) => p.id === id);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  async function act(r: Review, what: "publie" | "masque" | "delete") {
    setBusy(r.id);
    const ok = what === "delete" ? await remove(r.id) : await setStatus(r.id, what);
    setBusy(null);
    const who = `${r.firstName} ${r.lastName}`.trim();
    setNotice(
      ok
        ? {
            ok,
            text:
              what === "delete"
                ? `Avis de ${who} supprimé définitivement.`
                : what === "masque"
                  ? `Avis de ${who} masqué : il n'apparaît plus sur le site.`
                  : `Avis de ${who} de nouveau visible sur le site.`,
          }
        : { ok, text: "L'action n'a pas pu être enregistrée. Vérifiez votre connexion et réessayez." },
    );
    window.setTimeout(() => setNotice(null), 3500);
  }

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

  if (!hydrated || !loaded) return <div className="h-[60vh] animate-pulse rounded-[24px] bg-akua-white" />;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title="Avis" description="Tous les avis laissés par vos clients. Ils sont publiés automatiquement sur le site : vous pouvez ensuite les garder, les masquer ou les supprimer." />
      <ReadOnlyNotice module="reviews" />
      {notice && (
        <p
          role="status"
          className={cn("flex items-center gap-2 rounded-[18px] px-4 py-3 text-[13.5px] font-semibold", notice.ok ? "bg-akua-whatsapp/12 text-[#128c4a]" : "bg-akua-red/8 text-akua-red")}
        >
          {notice.ok ? <Check aria-hidden className="size-4" strokeWidth={2.6} /> : <X aria-hidden className="size-4" />} {notice.text}
        </p>
      )}

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
                <button
                  type="button"
                  onClick={() => setStars(stars === d.n ? null : d.n)}
                  aria-pressed={stars === d.n}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-2 py-1 text-[13px] transition-colors", stars === d.n ? "bg-akua-blue-100" : "hover:bg-akua-page")}
                >
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
              className={cn(
                "h-10 rounded-full px-4 text-[13.5px] font-semibold transition-colors",
                tab === id ? "bg-akua-ink text-akua-white" : "bg-akua-white ring-1 ring-akua-gray-200 hover:ring-akua-ink",
              )}
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
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom, e-mail, produit, commentaire…"
            aria-label="Rechercher un avis"
            className="h-11 w-full rounded-2xl border border-akua-gray-200 bg-akua-white pr-4 pl-11 text-[16px] outline-none focus:border-akua-blue focus:ring-4 focus:ring-akua-blue/10 sm:text-[14.5px]"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-[24px] border border-dashed border-akua-gray-200 bg-akua-white px-6 py-16 text-center">
          <MessageSquareText aria-hidden className="size-10 text-akua-gray-200" strokeWidth={1.3} />
          <p className="mt-3 text-[16px] font-bold">Aucun avis</p>
          <p className="mt-1 text-[14px] text-akua-gray-500">{all.length ? "Aucun avis ne correspond à ces filtres." : "Les avis laissés par vos clients sur vos produits apparaîtront ici."}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((r) => {
            const p = product(r.productId);
            const hidden = r.status === "masque";
            const working = busy === r.id;
            return (
              <li key={r.id} className={cn("rounded-[24px] border border-akua-gray-200 bg-akua-white p-5", hidden && "bg-akua-white/60")}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <Stars n={r.rating} />
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold",
                          hidden ? "bg-akua-page text-akua-gray-500" : "bg-akua-whatsapp/12 text-[#128c4a]",
                        )}
                      >
                        {hidden ? <EyeOff aria-hidden className="size-3" /> : <Eye aria-hidden className="size-3" />} {hidden ? "Masqué du site" : "Visible sur le site"}
                      </span>
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
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                      {can("reviews", "moderate") ? (
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => void act(r, hidden ? "publie" : "masque")}
                          className={cn(
                            "inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors disabled:opacity-50",
                            hidden ? "bg-akua-ink text-akua-white hover:bg-akua-blue" : "border border-akua-gray-200 hover:border-akua-ink",
                          )}
                        >
                          {hidden ? <Eye aria-hidden className="size-4" /> : <EyeOff aria-hidden className="size-4" />} {working ? "Enregistrement…" : hidden ? "Rendre visible" : "Masquer"}
                        </button>
                      ) : (
                        <span />
                      )}
                      <a
                        href={`mailto:${r.email}?subject=${encodeURIComponent(`Votre avis sur ${p?.name ?? "AKUA Service"}`)}`}
                        aria-label={`Répondre à ${r.firstName} par e-mail`}
                        title="Répondre par e-mail"
                        className="grid size-10 shrink-0 place-items-center rounded-full border border-akua-gray-200 transition-colors hover:border-akua-ink"
                      >
                        <Mail aria-hidden className="size-4" />
                      </a>
                      {can("reviews", "delete") && (
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => setToDelete(r)}
                          aria-label="Supprimer l'avis"
                          title="Supprimer définitivement"
                          className="grid size-10 shrink-0 place-items-center rounded-full border border-akua-gray-200 text-akua-gray-500 transition-colors hover:border-akua-red hover:text-akua-red disabled:opacity-50"
                        >
                          <Trash2 aria-hidden className="size-4" />
                        </button>
                      )}
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
          if (toDelete) void act(toDelete, "delete");
          setToDelete(null);
        }}
      />
    </div>
  );
}

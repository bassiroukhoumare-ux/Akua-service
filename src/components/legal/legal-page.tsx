import { ArrowRight, ChevronDown, MessageCircleMore } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHero } from "@/components/ui/page-hero";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/* Petits blocs typographiques communs aux pages légales. */
export function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[15px] leading-[1.75] text-akua-gray-500 first:mt-0">{children}</p>;
}

export function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="relative pl-5 text-[15px] leading-[1.7] text-akua-gray-500">
          <span aria-hidden className="absolute top-[0.72em] left-0.5 size-1.5 rounded-full bg-akua-blue" />
          {it}
        </li>
      ))}
    </ul>
  );
}

export function B({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-akua-ink">{children}</strong>;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
  /** lien vers l'autre document légal */
  related: { label: string; href: string };
}

/** Mise en page des documents légaux : sommaire (fixe sur ordinateur, repliable sur mobile) et articles numérotés. */
export function LegalPage({ eyebrow, title, intro, updated, sections, related }: LegalPageProps) {
  const toc = (
    <ol className="space-y-0.5">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="group flex items-baseline gap-3 rounded-xl px-2 py-1.5 text-[13.5px] text-akua-gray-500 transition-colors hover:bg-akua-page hover:text-akua-ink">
            <span className="w-5 shrink-0 text-[12px] font-semibold text-akua-blue tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="leading-snug">{s.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="pb-6">
      <PageHero eyebrow={eyebrow} title={title} text={intro}>
        <p className="mt-4 text-[12.5px] font-medium text-akua-gray-500">Dernière mise à jour : {updated}</p>
      </PageHero>

      <div className="container-akua mt-8 grid gap-8 md:mt-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
        {/* Sommaire */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <details className="group rounded-[24px] border border-akua-gray-200 bg-akua-white lg:hidden">
            <summary className="flex list-none items-center justify-between px-5 py-4 text-[14.5px] font-bold [&::-webkit-details-marker]:hidden">
              Sommaire
              <ChevronDown aria-hidden className="size-4 text-akua-gray-500 transition-transform group-open:rotate-180" />
            </summary>
            <nav aria-label="Sommaire" className="border-t border-akua-gray-200 px-3 py-3">
              {toc}
            </nav>
          </details>
          <nav aria-label="Sommaire" className="hidden lg:block">
            <p className="px-2 text-[11.5px] font-semibold tracking-[0.14em] text-akua-gray-500 uppercase">Sommaire</p>
            <div className="mt-3">{toc}</div>
          </nav>
        </aside>

        {/* Articles */}
        <div className="min-w-0 max-w-[760px]">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-t`} className="scroll-mt-[140px] border-b border-akua-gray-200 py-8 first:pt-0 last:border-0 md:scroll-mt-28">
              <p className="text-[12px] font-semibold tracking-[0.14em] text-akua-blue tabular-nums">ARTICLE {String(i + 1).padStart(2, "0")}</p>
              <h2 id={`${s.id}-t`} className="mt-1.5 text-[21px] leading-tight font-extrabold tracking-[-0.02em] md:text-[24px]">
                {s.title}
              </h2>
              <div className="mt-4">{s.body}</div>
            </section>
          ))}

          <div className="mt-4 flex flex-col gap-4 rounded-[28px] bg-akua-page p-6 sm:flex-row sm:items-center sm:justify-between md:p-7">
            <div className="flex items-start gap-4">
              <MessageCircleMore aria-hidden className="mt-0.5 size-7 shrink-0 text-akua-blue" strokeWidth={1.4} />
              <div>
                <p className="text-[16px] font-bold">Une question sur ce document ?</p>
                <p className="mt-1 text-[14px] text-akua-gray-500">Notre équipe vous répond rapidement sur WhatsApp.</p>
              </div>
            </div>
            <Link href="/contact" className="group inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-akua-blue">
              Nous contacter <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <Link href={related.href} className="group mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-akua-ink hover:text-akua-blue">
            Lire aussi : {related.label} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

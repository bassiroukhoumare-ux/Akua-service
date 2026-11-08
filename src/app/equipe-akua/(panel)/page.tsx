import { ArrowRight, History } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MyActivity } from "@/components/admin/my-activity";
import { DemoNotice, PageHeader, Panel } from "@/components/admin/ui";
import { ADMIN_CURRENT_STEP, ADMIN_MODULES, moduleHref, TEAM_BASE } from "@/config/admin";
import { requireMember } from "@/lib/admin/current-member";

export const metadata: Metadata = { title: "Mon espace" };

export default async function TeamHome() {
  const member = await requireMember();
  const first = member.name.split(" ")[0];
  const modules = ADMIN_MODULES.filter((m) => member.modules.includes(m.id) && !m.ownerOnly);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader title={`Bonjour ${first}.`} description="Voici les tâches qui vous ont été confiées. Chaque modification est enregistrée à votre nom." />
      <DemoNotice>Vous testez l&apos;espace équipe avec un compte de démonstration. Les modules s&apos;activeront au fil des étapes.</DemoNotice>

      <section>
        <h2 className="mb-3 text-[11px] font-bold tracking-[0.12em] text-akua-gray-500 uppercase">Vos modules</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((m) => {
            const soon = m.step > ADMIN_CURRENT_STEP;
            return (
              <li key={m.id}>
                <Link
                  href={moduleHref(TEAM_BASE, m)}
                  className="group flex h-full flex-col rounded-[24px] border border-akua-gray-200 bg-akua-white p-5 transition-all hover:-translate-y-0.5 hover:border-akua-blue hover:shadow-[0_24px_50px_-30px_rgb(31_91_255/0.55)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-12 place-items-center rounded-[16px] bg-akua-page transition-colors group-hover:bg-akua-blue-100">
                      <m.icon aria-hidden className="size-6 text-akua-ink transition-colors group-hover:text-akua-blue" strokeWidth={1.5} />
                    </span>
                    {soon && <span className="rounded-full bg-akua-page px-2 py-0.5 text-[11px] font-semibold text-akua-gray-500">Étape {m.step}</span>}
                  </div>
                  <p className="mt-4 text-[16px] font-bold">{m.label}</p>
                  <p className="mt-1 flex-1 text-[13.5px] text-akua-gray-500">{m.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold text-akua-blue">
                    Ouvrir <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Panel
        title="Vos dernières actions"
        description="Le responsable de la boutique voit également ces actions."
        action={<History aria-hidden className="size-5 text-akua-gray-500" strokeWidth={1.7} />}
      >
        <MyActivity memberId={member.id} />
      </Panel>
    </div>
  );
}

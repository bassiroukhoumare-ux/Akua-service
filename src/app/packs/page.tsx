import { PackageOpen } from "lucide-react";
import type { Metadata } from "next";
import { FaqCta, PackCard } from "@/components/home/sections";
import { PageHero } from "@/components/ui/page-hero";
import { getPacks, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Packs prêts à l'emploi",
  description: "Packs gaming, bureau et études : ordinateur, tablette ou console avec leurs accessoires. Testés et garantis.",
};

export default async function PacksPage() {
  const [packs, consoles] = await Promise.all([getPacks(), getProducts({ categorySlug: "consoles" })]);
  const complete = consoles.filter((p) => p.includes?.length);
  return (
    <>
      <PageHero word="Packs" image="/products/ps4-ds4.webp" icon={PackageOpen} eyebrow="Packs prêts à l'emploi" title="Tout est inclus." text="Gaming, bureau ou études : l'appareil et ses accessoires, testés et garantis." />
      <section className="container-akua pt-10 md:pt-14">
        <div className="grid gap-5 md:grid-cols-3">
          {packs.map((p, i) => (
            <PackCard key={p.id} product={p} featured={i === 0} />
          ))}
        </div>
      </section>
      <section className="container-akua pt-16 md:pt-24">
        <p className="text-[12px] font-semibold tracking-[0.16em] text-akua-gray-500 uppercase"><span className="text-akua-blue">02</span> — Consoles complètes</p>
        <h2 className="mt-2.5 text-[28px] font-extrabold tracking-[-0.035em] md:text-[42px]">Éditions complètes et zone rétro.</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {complete.map((p) => (
            <PackCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <FaqCta />
    </>
  );
}

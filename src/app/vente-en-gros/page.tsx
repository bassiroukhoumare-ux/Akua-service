import type { Metadata } from "next";
import { WholesaleForm } from "@/components/shop/wholesale-form";

export const metadata: Metadata = {
  title: "Vente en gros",
  description: "Demandez un devis en gros : consoles, ordinateurs, tablettes, accessoires et équipements, à prix revendeur. Livraison au Togo et dans la sous-région.",
};

export default function WholesalePage() {
  return (
    <div className="relative pb-16">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[260px] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--akua-blue-100)_80%,var(--akua-white))_0%,var(--akua-white)_100%)]" />
      <div className="container-akua relative">
        <h1 className="pt-8 text-center text-[32px] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance md:pt-14 md:text-[52px]">
          Achetez en gros, <span className="text-akua-blue">gagnez plus.</span>
        </h1>
        <div className="mx-auto mt-7 max-w-[860px] md:mt-10">
          <WholesaleForm />
        </div>
      </div>
    </div>
  );
}

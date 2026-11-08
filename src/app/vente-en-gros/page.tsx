import { Boxes, Percent, Store, Truck, Users } from "lucide-react";
import type { Metadata } from "next";
import { WholesaleForm } from "@/components/shop/wholesale-form";
import { IconTile } from "@/components/ui/icon-tile";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Vente en gros",
  description: "Tarifs dégressifs sur les consoles, manettes et jeux pour revendeurs et salles de jeux. Livraison au Togo et dans la sous-région.",
};

const PERKS = [
  { icon: Percent, t: "Tarifs dégressifs", d: "Plus la quantité est importante, plus le prix unitaire baisse." },
  { icon: Boxes, t: "Stock disponible", d: "Manettes, consoles et jeux en quantité, prêts à partir." },
  { icon: Truck, t: "Togo et sous-région", d: "Togo, Bénin, Ghana, Burkina Faso, Côte d'Ivoire, Niger et Mali." },
  { icon: Users, t: "Interlocuteur dédié", d: "Un contact WhatsApp unique pour vos commandes récurrentes." },
];

export default function WholesalePage() {
  return (
    <div className="pb-16">
      <PageHero icon={Store} eyebrow="Revendeurs et salles de jeux" title="Achetez en gros, gagnez plus" text="Équipez votre boutique ou votre salle de jeux avec du matériel testé et garanti, à prix revendeur." />
      <div className="container-akua mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-display text-[26px] font-semibold md:text-[32px]">Pourquoi acheter en gros chez AKUA Service</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {PERKS.map((p) => (
              <li key={p.t} className="flex gap-4 rounded-[22px] bg-akua-tile p-5">
                <IconTile icon={p.icon} shape="squircle" />
                <div>
                  <p className="font-display text-[16px] font-semibold">{p.t}</p>
                  <p className="mt-1 text-[14px] text-akua-gray-500">{p.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <WholesaleForm />
      </div>
    </div>
  );
}

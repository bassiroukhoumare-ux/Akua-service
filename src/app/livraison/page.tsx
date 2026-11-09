import { MapPin, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IconTile } from "@/components/ui/icon-tile";
import { PageHero } from "@/components/ui/page-hero";
import { loadSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Livraison et garantie", description: "Livraison disponible au Togo et dans la sous-région. Produits testés et garantis." };

const FAQ = [
  { q: "Comment passer commande ?", a: "Ajoutez vos produits au panier puis cliquez sur « Envoyer ma commande sur WhatsApp ». Nous confirmons la disponibilité, le prix de livraison et le paiement directement avec vous." },
  { q: "Les produits sont-ils neufs ?", a: "Selon l'article, un produit peut être neuf ou venant, dans son carton d'origine ou sans carton. Vérifiez toujours la fiche du produit : son état et son conditionnement y sont indiqués. En cas de doute, posez-nous la question sur WhatsApp." },
  { q: "Quels sont les délais de livraison ?", a: "Ils dépendent de la destination et de la commande. Le délai et les frais vous sont confirmés sur WhatsApp avant l'expédition." },
  { q: "Comment fonctionne la garantie ?", a: "Tous nos produits sont testés et garantis. En cas de problème, écrivez-nous sur WhatsApp avec votre référence de commande." },
  { q: "Puis-je acheter en gros ?", a: "Oui, nous proposons des tarifs dégressifs aux revendeurs et salles de jeux. Utilisez le formulaire de la page Vente en gros." },
];

export default async function DeliveryPage() {
  const DELIVERY_COUNTRIES = (await loadSettings()).delivery.filter((c) => c.enabled);
  return (
    <div className="pb-16">
      <PageHero word="Livraison" icon={Truck} eyebrow="Livraison et garantie" title="Livraison au Togo et dans la sous-région" text="Commande confirmée sur WhatsApp, livraison rapide et produits garantis." />
      <div className="container-akua mt-10">
        <h2 className="font-display text-[26px] font-semibold md:text-[32px]">Pays desservis</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {DELIVERY_COUNTRIES.map((c) => (
            <div key={c.code} className="rounded-[22px] border border-akua-gray-200 p-4 transition-shadow hover:shadow-card">
              <IconTile icon={MapPin} size="sm" />
              <p className="mt-3 font-display text-[16px] font-semibold">{c.name}</p>
              <p className="mt-1 text-[12.5px] text-akua-gray-500">{c.code === "TG" ? "Livraison locale" : "Sous-région"}</p>
            </div>
          ))}
        </div>

        <div id="garantie" className="mt-12 flex flex-col gap-5 rounded-[28px] bg-akua-tile p-8 md:flex-row md:items-center">
          <IconTile icon={ShieldCheck} tone="solid" size="lg" shape="squircle" />
          <div>
            <h2 className="font-display text-[24px] font-semibold">Garantie AKUA Service</h2>
            <p className="mt-2 text-[14.5px] text-akua-gray-500">Tous nos produits sont testés et garantis.</p>
          </div>
        </div>

        <div id="faq" className="mt-12 max-w-3xl">
          <h2 className="font-display text-[26px] font-semibold md:text-[32px]">Questions fréquentes</h2>
          <Accordion type="single" collapsible className="mt-4">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger className="font-display text-[16px] font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[14.5px] text-akua-gray-500">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

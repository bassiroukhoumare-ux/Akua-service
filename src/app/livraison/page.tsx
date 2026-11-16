import { Globe2, MessageCircleMore, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IconTile } from "@/components/ui/icon-tile";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = { title: "Livraison et garantie", description: "Livraison et expédition possibles, frais et délai confirmés sur WhatsApp. Produits testés et garantis." };

const FAQ = [
  { q: "Comment passer commande ?", a: "Ajoutez vos produits au panier puis cliquez sur « Envoyer ma commande sur WhatsApp ». Nous confirmons la disponibilité, le prix de livraison et le paiement directement avec vous." },
  { q: "Les produits sont-ils neufs ?", a: "Selon l'article, un produit peut être neuf ou venant, dans son carton d'origine ou sans carton. Vérifiez toujours la fiche du produit : son état et son conditionnement y sont indiqués. En cas de doute, posez-nous la question sur WhatsApp." },
  { q: "Expédiez-vous dans mon pays ?", a: "L'expédition est possible. Indiquez-nous votre pays sur WhatsApp : nous voyons ensemble la solution d'envoi, les frais et le délai avant tout paiement." },
  { q: "Quels sont les délais de livraison ?", a: "Ils dépendent de la destination et de la commande. Le délai et les frais vous sont confirmés sur WhatsApp avant l'expédition." },
  { q: "Comment fonctionne la garantie ?", a: "Tous nos produits sont testés et garantis. En cas de problème, écrivez-nous sur WhatsApp avec votre référence de commande." },
  { q: "Puis-je acheter en gros ?", a: "Oui, nous proposons des tarifs dégressifs aux revendeurs, entreprises, écoles et salles de jeux. Utilisez le formulaire de la page Vente en gros." },
];

const STEPS = [
  { icon: MessageCircleMore, t: "Vous commandez", d: "Sur le site ou sur WhatsApp, en indiquant votre pays, votre ville et votre adresse." },
  { icon: Globe2, t: "Nous confirmons l'envoi", d: "Nous voyons avec vous la solution d'expédition vers votre pays, les frais et le délai, avant tout paiement." },
  { icon: Truck, t: "Vous êtes livré", d: "Livraison à l'adresse convenue, ou retrait en boutique à Lomé sur rendez-vous." },
];

export default async function DeliveryPage() {
  return (
    <div className="pb-16">
      <PageHero word="Livraison" icon={Truck} eyebrow="Livraison et garantie" title="Livraison et expédition possibles" text="Où que vous soyez, écrivez-nous : nous confirmons avec vous l'envoi vers votre pays, les frais et le délai." />
      <div className="container-akua mt-10">
        <h2 className="font-display text-[26px] font-semibold md:text-[32px]">Comment ça se passe</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {STEPS.map((x, i) => (
            <li key={x.t} className="rounded-[12px] border border-akua-gray-200 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <x.icon aria-hidden className="size-8 text-akua-blue" strokeWidth={1.5} />
                <span className="grid size-7 place-items-center rounded-full bg-akua-ink text-[12.5px] font-bold text-akua-white">{i + 1}</span>
              </div>
              <p className="mt-4 text-[17px] font-bold">{x.t}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-akua-gray-500">{x.d}</p>
            </li>
          ))}
        </ol>

        <div id="garantie" className="mt-12 flex flex-col gap-5 rounded-[12px] bg-akua-tile p-8 md:flex-row md:items-center">
          <IconTile icon={ShieldCheck} tone="solid" size="lg" shape="squircle" />
          <div>
            <h2 className="font-display text-[24px] font-semibold">Garantie AKUA.SERVICE</h2>
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

import type { Metadata } from "next";
import Link from "next/link";
import { B, LegalPage, type LegalSection, P, UL } from "@/components/legal/legal-page";
import { DELIVERY_COUNTRIES, SITE_NAME } from "@/config/site";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: `Conditions générales de vente d'${SITE_NAME} : commande sur WhatsApp, prix, paiement, livraison, retrait en boutique, garantie et retours.`,
  alternates: { canonical: "/conditions-generales-de-vente" },
};

const countries = DELIVERY_COUNTRIES.map((c) => c.name).join(", ");

const SECTIONS: LegalSection[] = [
  {
    id: "objet",
    title: "Objet et champ d'application",
    body: (
      <>
        <P>
          Les présentes conditions générales de vente (ci-après les « CGV ») régissent les ventes de produits proposées par <B>{SITE_NAME}</B>, entreprise établie à Lomé (Togo) et spécialisée dans
          les consoles, jeux vidéo, manettes, accessoires et produits high-tech (ci-après « le Vendeur »), à toute personne physique ou morale passant commande (ci-après « le Client »).
        </P>
        <P>
          Le site présente le catalogue et permet de préparer une commande. La vente n&apos;est conclue qu&apos;après confirmation de la commande par le Vendeur sur WhatsApp, dans les
          conditions décrites ci-dessous. Toute commande implique l&apos;acceptation pleine et entière des présentes CGV, qui prévalent sur tout autre document.
        </P>
        <P>
          Les ventes en gros destinées aux professionnels (revendeurs, salles de jeux) peuvent faire l&apos;objet de conditions particulières convenues par écrit, qui complètent alors les
          présentes CGV.
        </P>
      </>
    ),
  },
  {
    id: "produits",
    title: "Produits",
    body: (
      <>
        <P>
          Les produits sont décrits avec la plus grande exactitude possible : désignation, caractéristiques principales, état et prix. Sauf mention « occasion » sur la fiche produit, les
          produits vendus sont <B>neufs</B>. Les photographies sont fournies à titre illustratif ; une légère différence de présentation (emballage, édition, couleur) ne saurait engager la
          responsabilité du Vendeur ni remettre en cause la vente.
        </P>
        <P>
          Les produits sont proposés dans la limite des stocks disponibles. La disponibilité affichée sur le site est indicative : elle est vérifiée et confirmée au moment de la
          validation de la commande sur WhatsApp. En cas d&apos;indisponibilité, le Vendeur en informe le Client et lui propose un produit équivalent, un délai d&apos;approvisionnement ou
          l&apos;annulation de l&apos;article concerné.
        </P>
      </>
    ),
  },
  {
    id: "prix",
    title: "Prix",
    body: (
      <>
        <P>
          Les prix sont indiqués en <B>francs CFA (F CFA)</B>. Ils s&apos;entendent hors frais de livraison, lesquels sont communiqués au Client avant la confirmation de la commande.
        </P>
        <P>
          Les prix barrés correspondent au prix habituellement pratiqué par le Vendeur avant la promotion. Les offres promotionnelles et les comptes à rebours affichés sur le site sont
          valables pendant la durée indiquée et dans la limite des stocks disponibles.
        </P>
        <P>
          Le prix applicable est celui affiché au moment de l&apos;envoi de la commande sur WhatsApp. En cas d&apos;erreur manifeste d&apos;affichage (prix dérisoire ou sans rapport avec
          la valeur du produit), le Vendeur se réserve le droit de ne pas confirmer la commande et en informe le Client.
        </P>
      </>
    ),
  },
  {
    id: "commande",
    title: "Commande",
    body: (
      <>
        <P>La commande se déroule de la manière suivante :</P>
        <UL
          items={[
            "le Client ajoute les produits souhaités à son panier et choisit les quantités ;",
            "il renseigne ses informations (nom, numéro WhatsApp, pays, ville et adresse de livraison, ou jour et heure de retrait en boutique) et, le cas échéant, un code promo ;",
            <>il clique sur « Envoyer ma commande sur WhatsApp » : un message récapitulatif contenant une référence de commande est préparé dans WhatsApp, et le Client l&apos;envoie ;</>,
            "le Vendeur vérifie la disponibilité des produits, confirme le montant total (frais de livraison inclus) et les modalités de paiement ;",
            "la commande est ferme et définitive à réception de cette confirmation par le Vendeur et, lorsque le paiement est demandé à l'avance, à réception du paiement ou de l'acompte convenu.",
          ]}
        />
        <P>
          Le Client garantit l&apos;exactitude des informations transmises. Le Vendeur se réserve le droit de refuser ou d&apos;annuler une commande présentant un caractère anormal, des
          informations manifestement erronées, ou émanant d&apos;un Client avec lequel existe un litige antérieur.
        </P>
      </>
    ),
  },
  {
    id: "paiement",
    title: "Paiement",
    body: (
      <>
        <P>
          <B>Aucun paiement n&apos;est effectué sur le site.</B> Le site ne collecte ni ne conserve aucune donnée bancaire ou de paiement.
        </P>
        <P>
          Le paiement est réalisé après confirmation de la commande, selon les moyens communiqués par le Vendeur sur WhatsApp (notamment Mobile Money, ou espèces lors du retrait en
          boutique). Le Vendeur ne demandera jamais au Client de communiquer un code secret, un mot de passe ou un code de validation.
        </P>
        <P>
          Les produits restent la propriété du Vendeur jusqu&apos;au paiement intégral du prix. Pour toute commande livrée, le Vendeur peut exiger le paiement total ou partiel avant
          l&apos;expédition, en particulier pour les livraisons hors du Togo.
        </P>
      </>
    ),
  },
  {
    id: "acompte",
    title: "Retrait en boutique et réservation avec acompte",
    body: (
      <>
        <P>
          Le Client peut choisir de retirer sa commande en boutique, du lundi au samedi, aux jour et heure sélectionnés lors de la commande. La boutique est fermée le dimanche. Le
          créneau choisi est confirmé par le Vendeur sur WhatsApp.
        </P>
        <P>
          Pour garantir la réservation des produits, le Client peut verser un acompte de 25 %, 50 % ou la totalité du prix. Le solde est réglé au moment du retrait. Les produits sont
          réservés jusqu&apos;à la date de retrait convenue ; en cas d&apos;empêchement, le Client prévient le Vendeur afin de fixer un nouveau créneau.
        </P>
        <P>
          Si la commande ne peut être honorée du fait du Vendeur (produit indisponible notamment), l&apos;acompte est intégralement remboursé. En cas d&apos;annulation par le Client ou
          d&apos;absence de retrait sans nouvelles de sa part dans un délai de sept (7) jours après la date convenue, le Vendeur peut remettre les produits en vente ; le sort de
          l&apos;acompte est alors réglé à l&apos;amiable entre les parties.
        </P>
      </>
    ),
  },
  {
    id: "livraison",
    title: "Livraison",
    body: (
      <>
        <P>
          Le Vendeur livre dans les pays suivants : <B>{countries}</B>. Les frais et le délai de livraison dépendent de la destination et du volume de la commande ; ils sont communiqués
          au Client avant la confirmation de la commande.
        </P>
        <P>
          Les délais annoncés sont indicatifs. Un retard de livraison ne peut donner lieu à annulation de la commande ou à indemnisation que s&apos;il est déraisonnable et imputable au
          Vendeur. Le Vendeur ne saurait être tenu responsable des retards dus au transporteur, aux formalités douanières, à une adresse incomplète ou à l&apos;absence du destinataire.
        </P>
        <P>
          Le Client doit fournir une adresse précise et rester joignable au numéro indiqué. Les éventuels droits et taxes liés à une livraison internationale sont, sauf accord contraire,
          à la charge du Client.
        </P>
        <P>
          <B>À la réception, le Client vérifie l&apos;état des colis et des produits en présence du livreur.</B> Toute anomalie (colis endommagé, produit manquant ou non conforme) doit
          être signalée immédiatement au livreur et confirmée au Vendeur sur WhatsApp, photos à l&apos;appui, au plus tard dans les 48 heures suivant la réception.
        </P>
      </>
    ),
  },
  {
    id: "retours",
    title: "Retours, échanges et annulation",
    body: (
      <>
        <P>
          Le Client peut annuler sa commande sans frais tant qu&apos;elle n&apos;a pas été expédiée ou préparée pour le retrait. Une fois la commande remise au Client, les produits
          peuvent être échangés ou repris dans les conditions suivantes :
        </P>
        <UL
          items={[
            "la demande est formulée sur WhatsApp dans les 48 heures suivant la réception ou le retrait ;",
            "le produit est rendu complet, dans son emballage d'origine, avec ses accessoires et sa notice ;",
            <>
              les produits vendus <B>neufs et scellés</B> (jeux, consoles, manettes) ne sont ni repris ni échangés une fois l&apos;emballage ouvert, sauf défaut ou non-conformité ;
            </>,
            "les frais de retour sont à la charge du Client, sauf erreur du Vendeur ou produit défectueux.",
          ]}
        />
        <P>
          Lorsque le retour est accepté, le Vendeur procède, au choix des parties, à l&apos;échange du produit, à l&apos;émission d&apos;un avoir ou au remboursement, dans un délai
          raisonnable après réception et vérification du produit retourné.
        </P>
      </>
    ),
  },
  {
    id: "garantie",
    title: "Garantie",
    body: (
      <>
        <P>
          Les produits bénéficient d&apos;une garantie contre les défauts de fonctionnement dont la durée est indiquée sur la fiche produit ou précisée au Client lors de la confirmation
          de la commande. Le Client conserve le message de confirmation de commande, qui fait office de preuve d&apos;achat.
        </P>
        <P>En cas de panne couverte par la garantie, le Vendeur procède, à son choix, à la réparation, à l&apos;échange du produit ou, à défaut, à son remboursement.</P>
        <P>La garantie ne couvre pas :</P>
        <UL
          items={[
            "les dommages résultant d'une chute, d'un choc, d'un contact avec un liquide ou d'une mauvaise utilisation ;",
            "l'usure normale (sticks, boutons, batteries) ;",
            "les produits ouverts, modifiés ou réparés par un tiers, ou dont le scellé de garantie a été retiré ;",
            "les dommages liés à une surtension ou à un branchement non conforme.",
          ]}
        />
      </>
    ),
  },
  {
    id: "promos",
    title: "Codes promo",
    body: (
      <>
        <P>
          Les codes promo sont valables pendant leur durée de validité et selon les conditions associées (montant minimum de commande notamment). Un seul code peut être utilisé par
          commande ; il n&apos;est ni cumulable avec une autre offre, sauf mention contraire, ni échangeable contre de l&apos;argent.
        </P>
        <P>La réduction est vérifiée et appliquée par le Vendeur lors de la confirmation de la commande.</P>
      </>
    ),
  },
  {
    id: "responsabilite",
    title: "Responsabilité et force majeure",
    body: (
      <>
        <P>
          Le Vendeur est tenu d&apos;une obligation de moyens pour la mise en ligne du site et le traitement des commandes. Sa responsabilité ne peut être engagée en cas
          d&apos;interruption du site, de dysfonctionnement de WhatsApp ou du réseau, ni pour les dommages indirects liés à l&apos;utilisation des produits.
        </P>
        <P>
          Le Vendeur ne peut être tenu responsable de l&apos;inexécution de ses obligations en cas de force majeure ou d&apos;événement indépendant de sa volonté (catastrophe naturelle,
          troubles, grève, fermeture des frontières, défaillance des transporteurs, etc.).
        </P>
      </>
    ),
  },
  {
    id: "avis",
    title: "Avis clients",
    body: (
      <P>
        Les clients peuvent publier un avis sur les produits. Les avis doivent être sincères, courtois et porter sur le produit ou le service reçu. Le Vendeur se réserve le droit de
        modérer ou de supprimer tout avis injurieux, diffamatoire, hors sujet ou contenant des informations personnelles. Le traitement des informations fournies avec un avis est décrit
        dans la <Link href="/politique-de-confidentialite" className="font-semibold text-akua-blue hover:underline">politique de confidentialité</Link>.
      </P>
    ),
  },
  {
    id: "litiges",
    title: "Droit applicable et litiges",
    body: (
      <>
        <P>Les présentes CGV sont soumises au droit togolais.</P>
        <P>
          En cas de difficulté, le Client est invité à contacter le Vendeur en priorité afin de rechercher une solution amiable. À défaut d&apos;accord, le litige sera porté devant les
          juridictions compétentes de Lomé (Togo).
        </P>
        <P>
          Le Vendeur peut modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur à la date de l&apos;envoi de la commande.
        </P>
      </>
    ),
  },
];

export default function CgvPage() {
  return (
    <LegalPage
      eyebrow="Conditions générales de vente"
      title="Conditions générales de vente"
      intro="Comment se passent la commande, le paiement, la livraison, le retrait en boutique, la garantie et les retours chez AKUA Service."
      updated="7 novembre 2026"
      sections={SECTIONS}
      related={{ label: "Politique de confidentialité", href: "/politique-de-confidentialite" }}
    />
  );
}

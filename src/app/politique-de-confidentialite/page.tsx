import type { Metadata } from "next";
import Link from "next/link";
import { B, LegalPage, type LegalSection, P, UL } from "@/components/legal/legal-page";
import { SITE_NAME } from "@/config/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Quelles données ${SITE_NAME} collecte, pourquoi, combien de temps elles sont conservées et comment exercer vos droits.`,
  alternates: { canonical: "/politique-de-confidentialite" },
};

const SECTIONS: LegalSection[] = [
  {
    id: "responsable",
    title: "Qui sommes-nous ?",
    body: (
      <>
        <P>
          Le site est édité par <B>{SITE_NAME}</B>, entreprise établie à Lomé (Togo), qui est responsable du traitement des données personnelles collectées sur le site et lors des échanges
          sur WhatsApp liés à vos commandes.
        </P>
        <P>
          Nous attachons une grande importance à la protection de votre vie privée. Cette politique explique, simplement, quelles informations nous recueillons, ce que nous en faisons
          et les droits dont vous disposez, conformément à la réglementation togolaise applicable, notamment la loi n° 2019-014 du 29 octobre 2019 relative à la protection des données
          à caractère personnel.
        </P>
      </>
    ),
  },
  {
    id: "donnees",
    title: "Les données que nous collectons",
    body: (
      <>
        <P>Nous ne collectons que les informations nécessaires, et uniquement celles que vous nous transmettez :</P>
        <UL
          items={[
            <>
              <B>Lors d&apos;une commande</B> : nom, numéro WhatsApp, adresse e-mail (facultative), pays, ville et adresse de livraison, ou jour et heure de retrait, contenu du panier,
              code promo et éventuelle demande d&apos;acompte.
            </>,
            <>
              <B>Lors d&apos;une demande de vente en gros</B> : nom ou raison sociale, pays, numéro de téléphone, produits et quantités souhaités, message.
            </>,
            <>
              <B>Lors de la publication d&apos;un avis</B> : prénom, nom, pays, adresse e-mail, note et commentaire.
            </>,
            <>
              <B>Lors de nos échanges sur WhatsApp</B> : les messages que vous nous envoyez et les informations utiles au suivi de votre commande.
            </>,
          ]}
        />
        <P>
          <B>Nous ne collectons aucune donnée bancaire ni de paiement</B> : aucun paiement n&apos;est effectué sur le site. Nous ne vous demanderons jamais de code secret, de mot de
          passe ou de code de validation.
        </P>
      </>
    ),
  },
  {
    id: "finalites",
    title: "Pourquoi nous les utilisons",
    body: (
      <>
        <P>Vos données sont utilisées uniquement pour :</P>
        <UL
          items={[
            "traiter, confirmer, préparer et livrer votre commande, ou organiser votre retrait en boutique ;",
            "vous contacter au sujet de votre commande, de sa livraison, de son paiement ou de la garantie ;",
            "répondre à vos demandes de devis et de vente en gros ;",
            "publier et modérer les avis clients ;",
            "tenir notre comptabilité et respecter nos obligations légales ;",
            "améliorer notre catalogue et notre service.",
          ]}
        />
        <P>
          Ces traitements reposent sur l&apos;exécution de votre commande, sur votre consentement (publication d&apos;un avis, demande de devis), sur nos obligations légales et sur
          notre intérêt légitime à bien gérer notre activité. Nous ne vendons ni ne louons jamais vos données.
        </P>
      </>
    ),
  },
  {
    id: "whatsapp",
    title: "Commande sur WhatsApp",
    body: (
      <>
        <P>
          Lorsque vous cliquez sur « Envoyer ma commande sur WhatsApp », le site prépare un message récapitulatif et ouvre l&apos;application WhatsApp. <B>Rien n&apos;est envoyé
          tant que vous n&apos;avez pas vous-même appuyé sur « Envoyer »</B> dans WhatsApp.
        </P>
        <P>
          WhatsApp est un service fourni par une société tierce (WhatsApp, groupe Meta), qui traite les messages selon ses propres conditions et sa propre politique de confidentialité.
          Nous vous invitons à les consulter.
        </P>
      </>
    ),
  },
  {
    id: "avis",
    title: "Avis clients",
    body: (
      <>
        <P>
          Lorsque vous publiez un avis, votre <B>prénom, nom, pays, note et commentaire</B> sont visibles publiquement sur la fiche du produit.{" "}
          <B>Votre adresse e-mail n&apos;est jamais affichée</B> : elle sert uniquement à vous recontacter au sujet de votre avis et à prévenir les abus.
        </P>
        <P>Les avis peuvent être modérés. Vous pouvez demander à tout moment la modification ou la suppression de votre avis.</P>
      </>
    ),
  },
  {
    id: "stockage-local",
    title: "Cookies et stockage sur votre appareil",
    body: (
      <>
        <P>
          Le site n&apos;utilise <B>ni cookie publicitaire ni outil de suivi</B>. Pour fonctionner, il enregistre uniquement sur votre propre appareil (stockage local du navigateur) :
        </P>
        <UL
          items={[
            "le contenu de votre panier et les informations saisies dans le formulaire de commande, pour ne pas les perdre si vous quittez la page ;",
            "la liste de vos produits favoris ;",
            "les avis que vous avez publiés.",
          ]}
        />
        <P>
          Ces informations restent sur votre téléphone ou votre ordinateur et ne nous sont pas transmises tant que vous n&apos;envoyez pas votre commande. Vous pouvez les effacer à tout
          moment en vidant les données de navigation de votre navigateur.
        </P>
      </>
    ),
  },
  {
    id: "destinataires",
    title: "Qui a accès à vos données",
    body: (
      <>
        <P>Vos données sont accessibles uniquement :</P>
        <UL
          items={[
            `à l'équipe d'${SITE_NAME} chargée des ventes, de la préparation et de la livraison des commandes ;`,
            "au livreur ou au transporteur, pour les seules informations nécessaires à la livraison (nom, téléphone, adresse) ;",
            "à nos prestataires techniques (hébergement du site), qui agissent uniquement sur nos instructions ;",
            "aux autorités, lorsque la loi l'exige.",
          ]}
        />
        <P>
          Pour les livraisons hors du Togo, les informations de livraison peuvent être transmises au transporteur du pays de destination, dans la stricte mesure nécessaire.
        </P>
      </>
    ),
  },
  {
    id: "conservation",
    title: "Durée de conservation",
    body: (
      <UL
        items={[
          "Données de commande : pendant la durée nécessaire au suivi de la commande et de la garantie, puis archivées pendant la durée imposée par nos obligations comptables et légales.",
          "Demandes de devis sans suite : 12 mois maximum après le dernier échange.",
          "Avis clients : tant que l'avis est publié ; l'adresse e-mail associée est supprimée avec l'avis.",
          "Données stockées sur votre appareil : jusqu'à ce que vous les effaciez.",
        ]}
      />
    ),
  },
  {
    id: "securite",
    title: "Sécurité",
    body: (
      <P>
        Nous mettons en œuvre des mesures raisonnables pour protéger vos données contre la perte, l&apos;accès non autorisé ou la divulgation : connexion sécurisée au site (HTTPS),
        accès limité aux seules personnes qui en ont besoin, absence de collecte de données de paiement. Aucun système n&apos;étant totalement infaillible, nous vous invitons aussi à
        protéger l&apos;accès à votre téléphone et à votre compte WhatsApp.
      </P>
    ),
  },
  {
    id: "droits",
    title: "Vos droits",
    body: (
      <>
        <P>Vous disposez à tout moment des droits suivants sur vos données :</P>
        <UL
          items={[
            "droit d'accès : savoir quelles données nous détenons sur vous ;",
            "droit de rectification : corriger des informations inexactes ;",
            "droit d'effacement : demander la suppression de vos données, sous réserve de nos obligations légales ;",
            "droit d'opposition : vous opposer à certains usages, notamment à l'envoi d'offres commerciales ;",
            "droit de retirer votre consentement à tout moment, par exemple pour un avis publié.",
          ]}
        />
        <P>
          Pour exercer ces droits, contactez-nous via la <Link href="/contact" className="font-semibold text-akua-blue hover:underline">page Contact</Link> ou sur WhatsApp. Nous vous
          répondons dans les meilleurs délais. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir l&apos;autorité togolaise compétente en matière de protection des
          données personnelles.
        </P>
      </>
    ),
  },
  {
    id: "mineurs",
    title: "Mineurs",
    body: (
      <P>
        Le site s&apos;adresse à un public adulte pour la passation de commandes. Les mineurs doivent obtenir l&apos;accord de leurs parents ou de leur représentant légal avant de
        passer commande ou de nous transmettre des informations personnelles.
      </P>
    ),
  },
  {
    id: "modifications",
    title: "Modification de cette politique",
    body: (
      <P>
        Nous pouvons mettre à jour cette politique, notamment en cas d&apos;évolution du site (création de comptes clients, paiement en ligne) ou de la réglementation. La date de
        dernière mise à jour figure en haut de cette page. En cas de changement important, nous vous en informerons sur le site.
      </P>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Politique de confidentialité"
      title="Politique de confidentialité"
      intro="Quelles informations nous recueillons, pourquoi, combien de temps nous les gardons et comment exercer vos droits."
      updated="7 novembre 2026"
      sections={SECTIONS}
      related={{ label: "Conditions générales de vente", href: "/conditions-generales-de-vente" }}
    />
  );
}

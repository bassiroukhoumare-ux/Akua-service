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
          Le site est édité par <B>{SITE_NAME}</B>, entreprise établie à Lomé (Togo), Agoè-Assiyéyé, à 50 m de la Poste, qui est responsable du traitement des données personnelles collectées sur le site et lors des échanges
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
              <B>Lors d&apos;une commande</B> : nom, numéro WhatsApp, adresse e-mail (facultative), pays, ville, adresse de livraison et point de repère, ou jour et heure de retrait,
              contenu du panier, code promo et éventuelle demande d&apos;acompte. La commande est enregistrée sur notre serveur avec une référence (par exemple CMD-AKUA-0001).
            </>,
            <>
              <B>Lorsque vous enregistrez votre panier</B> sans commander : nom, numéro WhatsApp, pays et contenu du panier, pour que nous puissions vous recontacter et vous aider à
              finaliser votre achat.
            </>,
            <>
              <B>Lors d&apos;une demande de vente en gros ou d&apos;un message de contact</B> : nom, entreprise (facultative), numéro de téléphone, pays, ville, adresse, produits et quantités
              souhaités, message. Ces informations sont transmises par WhatsApp et ne sont pas enregistrées sur notre serveur.
            </>,
            <>
              <B>Lors de la publication d&apos;un avis</B> : prénom, nom, pays, adresse e-mail, note et commentaire.
            </>,
            <>
              <B>Lorsque vous ajoutez un produit en favori</B> : le produit concerné, associé à un identifiant anonyme (sans nom ni numéro), pour connaître les produits les plus appréciés.
            </>,
            <>
              <B>Statistiques de visite anonymes</B> : pages consultées, provenance de la visite (recherche, réseau social, lien direct), pays déduit de la connexion et type d&apos;appareil
              (téléphone, ordinateur), associés à un identifiant anonyme tiré au hasard. <B>Votre adresse IP n&apos;est pas conservée</B> et ces statistiques ne permettent pas de vous
              identifier.
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
            "vous recontacter, si vous avez enregistré votre panier, pour vous aider à finaliser votre commande ;",
            "tenir notre comptabilité et respecter nos obligations légales ;",
            "mesurer la fréquentation du site et améliorer notre catalogue et notre service.",
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
          Lorsque vous cliquez sur « Envoyer ma commande sur WhatsApp », votre commande est enregistrée sur notre serveur, puis le site prépare un message récapitulatif et ouvre
          l&apos;application WhatsApp. <B>Le message n&apos;est envoyé que lorsque vous appuyez vous-même sur « Envoyer »</B> dans WhatsApp. Il en va de même pour les demandes de devis
          et les messages de contact.
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
          Le site n&apos;utilise <B>ni cookie publicitaire ni outil de suivi publicitaire</B> (pas de Google Analytics ni de pixel Facebook). Pour fonctionner, il enregistre sur votre
          propre appareil (stockage local du navigateur) :
        </P>
        <UL
          items={[
            "le contenu de votre panier et les informations saisies dans le formulaire de commande, pour ne pas les perdre si vous quittez la page ;",
            "la liste de vos produits favoris ;",
            "la devise choisie pour afficher les prix (F CFA, euro ou dollar) ;",
            "un identifiant anonyme tiré au hasard, utilisé pour les statistiques de visite et les favoris.",
          ]}
        />
        <P>
          Vous pouvez effacer ces informations à tout moment en vidant les données de navigation de votre navigateur. La carte de la page Contact est fournie par Google Maps : en
          l&apos;affichant, Google peut déposer ses propres cookies, selon sa politique de confidentialité.
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
            "à nos prestataires techniques (hébergement du site chez Vercel et base de données chez Neon), qui agissent uniquement sur nos instructions ;",
            "aux autorités, lorsque la loi l'exige.",
          ]}
        />
        <P>
          Pour une expédition hors du Togo, les informations de livraison peuvent être transmises au transporteur ou au partenaire chargé de l&apos;envoi, dans la stricte mesure
          nécessaire. Nos prestataires techniques peuvent héberger les données hors du Togo, avec des garanties de sécurité adaptées.
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
          "Paniers enregistrés sans commande : 12 mois maximum, puis suppression automatique.",
          "Demandes de devis et messages de contact (sur WhatsApp) : 12 mois maximum après le dernier échange.",
          "Favoris et statistiques de visite anonymes : 24 mois maximum, puis suppression automatique.",
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
        espace de gestion protégé par mot de passe, accès de chaque membre de l&apos;équipe limité aux seules informations dont il a besoin, absence de collecte de données de paiement. Aucun système n&apos;étant totalement infaillible, nous vous invitons aussi à
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
      updated="13 novembre 2026"
      sections={SECTIONS}
      related={{ label: "Conditions générales de vente", href: "/conditions-generales-de-vente" }}
    />
  );
}

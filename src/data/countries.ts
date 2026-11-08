import { DELIVERY_COUNTRIES } from "@/config/site";

/** Pays proposés dans les formulaires (devis, avis…). Les pays livrés directement sont listés en premier. */
const OTHERS = [
  // Afrique de l'Ouest et du Centre
  "Sénégal", "Guinée", "Guinée-Bissau", "Gambie", "Sierra Leone", "Liberia", "Nigeria", "Cap-Vert", "Mauritanie",
  "Cameroun", "Gabon", "Congo", "RD Congo", "Tchad", "Centrafrique", "Guinée équatoriale", "São Tomé-et-Príncipe",
  // reste de l'Afrique
  "Afrique du Sud", "Algérie", "Angola", "Botswana", "Burundi", "Comores", "Djibouti", "Égypte", "Érythrée", "Eswatini",
  "Éthiopie", "Kenya", "Lesotho", "Libye", "Madagascar", "Malawi", "Maroc", "Maurice", "Mozambique", "Namibie", "Ouganda",
  "Rwanda", "Seychelles", "Somalie", "Soudan", "Soudan du Sud", "Tanzanie", "Tunisie", "Zambie", "Zimbabwe",
  // Europe
  "Allemagne", "Autriche", "Belgique", "Danemark", "Espagne", "Finlande", "France", "Grèce", "Irlande", "Italie",
  "Luxembourg", "Monaco", "Norvège", "Pays-Bas", "Pologne", "Portugal", "Roumanie", "Royaume-Uni", "Russie", "Suède",
  "Suisse", "Tchéquie", "Turquie", "Ukraine",
  // Amériques
  "Argentine", "Brésil", "Canada", "Chili", "Colombie", "Cuba", "États-Unis", "Haïti", "Mexique", "Pérou",
  // Asie et Moyen-Orient
  "Arabie saoudite", "Chine", "Corée du Sud", "Émirats arabes unis", "Inde", "Indonésie", "Israël", "Japon", "Jordanie",
  "Koweït", "Liban", "Malaisie", "Oman", "Pakistan", "Philippines", "Qatar", "Singapour", "Thaïlande", "Viêt Nam",
  // Océanie
  "Australie", "Nouvelle-Zélande",
].sort((a, b) => a.localeCompare(b, "fr"));

export const DELIVERY_COUNTRY_NAMES: string[] = DELIVERY_COUNTRIES.map((c) => c.name);
export const OTHER_COUNTRY_NAMES = OTHERS.filter((n) => !DELIVERY_COUNTRY_NAMES.includes(n));

export const SITE_NAME = "AKUA Service";
export const SITE_TAGLINE = "Votre référence High-Tech en Afrique de l'Ouest";
export const SITE_URL = "https://akuaservice.com"; // TODO domaine définitif

// TODO numéro à remplacer (format international sans +)
export const WHATSAPP_NUMBER = "228XXXXXXXX";
export const WHATSAPP_DISPLAY = "+228 [NUMÉRO]";

export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100086873081543";
// TODO à confirmer : identifiant repéré en filigrane sur les photos de la boutique
export const TIKTOK_URL = "https://www.tiktok.com/@akua.service.togo";
export const TIKTOK_HANDLE = "@akua.service.togo";

export const ADDRESS = "Togo";
export const OPENING_HOURS = "Lun – Sam : 10h – 20h";
export const OPENING_SCHEDULE = [
  { days: "Lundi – Samedi", hours: "10h – 20h" },
  { days: "Dimanche", hours: "Fermé" },
] as const;

export const DELIVERY_COUNTRIES = [
  { code: "TG", name: "Togo" },
  { code: "BJ", name: "Bénin" },
  { code: "GH", name: "Ghana" },
  { code: "BF", name: "Burkina Faso" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "NE", name: "Niger" },
  { code: "ML", name: "Mali" },
] as const;

export type DeliveryCountryCode = (typeof DELIVERY_COUNTRIES)[number]["code"];

export const MAIN_NAV = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "Packs", href: "/packs" },
  { label: "Jeux", href: "/boutique/jeux" },
  { label: "Vente en gros", href: "/vente-en-gros" },
  { label: "Contact", href: "/contact" },
] as const;

export const MARQUEE_ITEMS = [
  "Neuf scellé",
  "Garantie",
  "Livraison 7 pays",
  "Gros et détail",
  "Commande en 1 clic sur WhatsApp",
] as const;

export const siteConfig = {
  name: SITE_NAME,
  tagline: SITE_TAGLINE,
  url: SITE_URL,
  whatsapp: WHATSAPP_NUMBER,
  whatsappDisplay: WHATSAPP_DISPLAY,
  facebook: FACEBOOK_URL,
  address: ADDRESS,
  hours: OPENING_HOURS,
  countries: DELIVERY_COUNTRIES,
  nav: MAIN_NAV,
} as const;

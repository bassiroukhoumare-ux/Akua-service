export const SITE_NAME = "AKUA Service";
export const SITE_TAGLINE = "Votre référence High-Tech en Afrique de l'Ouest";
export const SITE_URL = "https://akuaservice.com"; // TODO domaine définitif

// format international sans « + » (utilisé dans les liens wa.me)
export const WHATSAPP_NUMBER = "22893569542";
export const WHATSAPP_DISPLAY = "+228 93 56 95 42";

export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100086873081543";
export const TIKTOK_URL = "https://www.tiktok.com/@akua.service.togo";
export const TIKTOK_HANDLE = "@akua.service.togo";

export const ADDRESS = "Lomé, Togo";
export const MAPS_URL = "https://maps.app.goo.gl/XjkoBGehYDk1kRS4A";
// Position de la boutique (issue du lien ci-dessus). Pour un repère plus précis,
// remplacez ces coordonnées par celles de l'épingle exacte de la boutique.
export const SHOP_COORDS = { lat: 6.1295577, lng: 1.2196502 };
const coords = `${SHOP_COORDS.lat},${SHOP_COORDS.lng}`;
/** Carte intégrée (zoom, déplacement) sans clé d'API. */
export const MAPS_EMBED_URL = `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${coords}!6i15!3m1!1sfr!5m1!1sfr`;
/** Ouvre Google Maps (application sur téléphone) avec l'itinéraire jusqu'à la boutique. */
export const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
export const DELIVERY_TAGLINE = "Livraison disponible au Togo et dans la sous-région.";
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
  "Neuf ou venant",
  "Garantie",
  "Togo et sous-région",
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

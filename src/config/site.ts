export const SITE_NAME = "AKUA.SERVICE";
export const SITE_TAGLINE = "La technologie à votre service";
export const SITE_URL = "https://akuaservice.com"; // TODO domaine définitif

// format international sans « + » (utilisé dans les liens wa.me)
export const WHATSAPP_NUMBER = "22893569542";
export const WHATSAPP_DISPLAY = "+228 93 56 95 42";

export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100086873081543";
export const TIKTOK_URL = "https://www.tiktok.com/@akua.service.togo";
export const TIKTOK_HANDLE = "@akua.service.togo";

export const ADDRESS = "Agoè-Assiyéyé, à 50 m de la Poste, Lomé";
export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=6.2307916,1.1989111";
// Position de la boutique : Agoè-Assiyéyé, à 50 m du bureau de poste. Pour un repère plus précis,
// collez le lien Google Maps de la boutique dans l'admin (Paramètres › Localisation).
export const SHOP_COORDS = { lat: 6.2307916, lng: 1.1989111 };
const coords = `${SHOP_COORDS.lat},${SHOP_COORDS.lng}`;
/** Carte intégrée (zoom, déplacement) sans clé d'API. */
export const MAPS_EMBED_URL = `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${coords}!6i15!3m1!1sfr!5m1!1sfr`;
/** Ouvre Google Maps (application sur téléphone) avec l'itinéraire jusqu'à la boutique. */
export const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
export const DELIVERY_TAGLINE = "Livraison et expédition possibles.";
export const OPENING_HOURS = "Lun – Sam : 8h – 20h";
export const OPENING_SCHEDULE = [
  { days: "Lundi – Samedi", hours: "8h – 20h" },
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
  { label: "Vente en gros", href: "/vente-en-gros" },
  { label: "Contact", href: "/contact" },
] as const;

export const MARQUEE_ITEMS = [
  "Neuf ou venant",
  "Garantie",
  "Livraison et expédition possibles",
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

import { DELIVERY_COUNTRIES } from "@/config/site";
import { CITIES } from "@/data/cities";

/**
 * Principales villes par pays (nom du pays tel qu'il apparaît dans la liste des pays).
 * Pays livrés : villes desservies. Autres pays : grandes villes, pour aller vite.
 * Si la ville n'y est pas, le client choisit « Autre ville » et l'écrit lui-même.
 */
const OTHER_CITIES: Record<string, string[]> = {
  // Afrique de l'Ouest et du Centre
  Sénégal: ["Dakar", "Thiès", "Touba", "Saint-Louis", "Kaolack", "Ziguinchor", "Mbour", "Rufisque"],
  Guinée: ["Conakry", "Kankan", "Nzérékoré", "Kindia", "Labé", "Boké", "Mamou"],
  "Guinée-Bissau": ["Bissau", "Bafatá", "Gabú"],
  Gambie: ["Banjul", "Serekunda", "Brikama"],
  "Sierra Leone": ["Freetown", "Bo", "Kenema", "Makeni"],
  Liberia: ["Monrovia", "Gbarnga", "Buchanan"],
  Nigeria: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City", "Kaduna", "Enugu"],
  "Cap-Vert": ["Praia", "Mindelo"],
  Mauritanie: ["Nouakchott", "Nouadhibou", "Kiffa"],
  Cameroun: ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda", "Maroua", "Kribi", "Limbé"],
  Gabon: ["Libreville", "Port-Gentil", "Franceville", "Oyem"],
  Congo: ["Brazzaville", "Pointe-Noire", "Dolisie"],
  "RD Congo": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kisangani", "Goma", "Bukavu", "Matadi"],
  Tchad: ["N'Djamena", "Moundou", "Abéché", "Sarh"],
  Centrafrique: ["Bangui", "Bimbo", "Berbérati"],
  "Guinée équatoriale": ["Malabo", "Bata"],
  // reste de l'Afrique
  Maroc: ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"],
  Algérie: ["Alger", "Oran", "Constantine", "Annaba"],
  Tunisie: ["Tunis", "Sfax", "Sousse"],
  Égypte: ["Le Caire", "Alexandrie", "Gizeh"],
  "Afrique du Sud": ["Johannesburg", "Le Cap", "Durban", "Pretoria"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu"],
  Rwanda: ["Kigali", "Butare", "Gisenyi"],
  Éthiopie: ["Addis-Abeba", "Dire Dawa"],
  Madagascar: ["Antananarivo", "Toamasina", "Mahajanga"],
  Angola: ["Luanda", "Huambo", "Lobito"],
  // Europe
  France: ["Paris", "Lyon", "Marseille", "Lille", "Toulouse", "Bordeaux", "Nice", "Nantes", "Strasbourg"],
  Belgique: ["Bruxelles", "Anvers", "Liège", "Gand", "Charleroi"],
  Suisse: ["Genève", "Zurich", "Lausanne", "Berne", "Bâle"],
  Allemagne: ["Berlin", "Hambourg", "Munich", "Francfort", "Cologne"],
  Italie: ["Rome", "Milan", "Naples", "Turin"],
  Espagne: ["Madrid", "Barcelone", "Valence", "Séville"],
  Portugal: ["Lisbonne", "Porto"],
  "Royaume-Uni": ["Londres", "Manchester", "Birmingham", "Liverpool"],
  "Pays-Bas": ["Amsterdam", "Rotterdam", "La Haye"],
  // Amériques
  Canada: ["Montréal", "Toronto", "Ottawa", "Québec", "Vancouver", "Calgary"],
  "États-Unis": ["New York", "Washington", "Atlanta", "Houston", "Los Angeles", "Chicago", "Miami"],
  Brésil: ["São Paulo", "Rio de Janeiro", "Brasília"],
  // Asie et Moyen-Orient
  Chine: ["Pékin", "Shanghai", "Canton (Guangzhou)", "Shenzhen", "Yiwu", "Hong Kong"],
  "Émirats arabes unis": ["Dubaï", "Abou Dabi", "Charjah"],
  Turquie: ["Istanbul", "Ankara", "Izmir"],
  Inde: ["New Delhi", "Bombay", "Bangalore"],
  Liban: ["Beyrouth", "Tripoli"],
  "Arabie saoudite": ["Riyad", "Djeddah", "La Mecque"],
};

const DELIVERY: Record<string, string[]> = Object.fromEntries(DELIVERY_COUNTRIES.map((c) => [c.name, CITIES[c.code]]));

/** Villes proposées pour un pays (liste vide si aucune : la ville se saisit à la main). */
export function citiesOf(country: string): string[] {
  return DELIVERY[country] ?? OTHER_CITIES[country] ?? [];
}

/** Pays livré directement (Togo et sous-région) ? */
export const isDeliveryCountry = (country: string) => DELIVERY_COUNTRIES.some((c) => c.name === country);

import type { DeliveryCountryCode } from "@/config/site";

/** Principales villes desservies, proposées dans la liste déroulante du formulaire de livraison. */
export const CITIES: Record<DeliveryCountryCode, string[]> = {
  TG: ["Lomé", "Tsévié", "Aného", "Kpalimé", "Atakpamé", "Notsé", "Sokodé", "Tchamba", "Bassar", "Kara", "Niamtougou", "Mango", "Dapaong"],
  BJ: ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Ouidah", "Lokossa", "Bohicon", "Abomey", "Parakou", "Djougou", "Natitingou", "Kandi"],
  GH: ["Accra", "Tema", "Kumasi", "Takoradi", "Cape Coast", "Ho", "Aflao", "Tamale"],
  BF: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora", "Kaya", "Fada N'Gourma"],
  CI: ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro", "Daloa", "Korhogo", "Man", "Grand-Bassam"],
  NE: ["Niamey", "Zinder", "Maradi", "Tahoua", "Dosso", "Agadez"],
  ML: ["Bamako", "Sikasso", "Ségou", "Kayes", "Mopti", "Koutiala"],
};

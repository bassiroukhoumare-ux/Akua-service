// Affiche verticale (format 4:5) de la page d'accueil : à droite des catégories
// sur ordinateur, juste en dessous sur mobile. Format conseillé : 1600 × 2000 px.
// Pour la changer : déposez l'image dans /public/banners puis modifiez « src »
// (et « width » / « height » si les proportions changent).
export const HOME_VISUAL = {
  src: "/banners/switch-oled.webp",
  width: 1600,
  height: 1999,
  alt: "Nintendo Switch OLED neuve en carton à 250 000 FCFA chez AKUA Service",
  href: "/boutique/consoles-jeux-video?type=consoles",
};

// Bannière horizontale : sous les catégories sur ordinateur (alignée en bas avec
// l'affiche), sous l'affiche sur mobile. Format obligatoire : 1800 × 600 px (3:1).
// Fichier source fourni : « banner pro.webp ».
export const HOME_BANNER = {
  src: "/banners/banner-pro.webp",
  alt: "AKUA Service, votre référence high-tech en Afrique de l'Ouest : consoles, jeux vidéo, ordinateurs, accessoires et caméras de surveillance",
  href: "/boutique",
};

import type { Banner } from "@/types/catalog";

export const banners: Banner[] = [
  // Hero (1 slide sur 3 en noir)
  { id: "b-hero-1", placement: "hero", theme: "blue", eyebrow: "Pack complet", title: "La PS4 prête à jouer", subtitle: "2 manettes, 10 jeux et tous les accessoires", priceLabel: "À partir de 170 000 F", ctaLabel: "Je commande", href: "/produit/ps4-slim-complete", productId: "p-ps4-slim-complete", order: 1 },
  { id: "b-hero-2", placement: "hero", theme: "dark", eyebrow: "Nouveau", title: "Nintendo Switch 2", subtitle: "Carton scellé, 100 % authentique", priceLabel: "395 000 F", ctaLabel: "Je commande", href: "/produit/nintendo-switch-2", productId: "p-switch-2", order: 2 },
  { id: "b-hero-3", placement: "hero", theme: "blue", eyebrow: "Manettes", title: "Jouez sans limite", subtitle: "Manettes PS4, PS5, Xbox et Android dès 5 000 F", priceLabel: "Dès 5 000 F", ctaLabel: "Voir les manettes", href: "/boutique/consoles-jeux-video?type=manettes", categoryId: "cat-consoles", order: 3 },

  // Trio promo
  { id: "b-trio-1", placement: "promo-trio", theme: "light", eyebrow: "Petits prix", title: "Manettes dès 5 000 F", subtitle: "PS3, PS4, Xbox 360 et Android", ctaLabel: "J'en profite", href: "/boutique/consoles-jeux-video?type=manettes", categoryId: "cat-consoles", order: 1 },
  { id: "b-trio-2", placement: "promo-trio", theme: "light", eyebrow: "Nouveautés", title: "Jeux FC27 disponibles", subtitle: "PS5, PS4 et Switch 2", ctaLabel: "Découvrir", href: "/boutique/consoles-jeux-video?type=jeux", categoryId: "cat-consoles", order: 2 },
  { id: "b-trio-3", placement: "promo-trio", theme: "light", eyebrow: "Premium", title: "PS4 Pro 1 To", subtitle: "15 jeux déjà installés", ctaLabel: "Voir le pack", href: "/produit/ps4-pro-1-to", productId: "p-ps4-pro-1to", order: 3 },

  // Bannières asymétriques
  { id: "b-asym-1", placement: "asymmetric", theme: "light", eyebrow: "Zone rétro", title: "PS3 Slim et Xbox 360", subtitle: "Complètes, avec jeux, dès 70 000 F", ctaLabel: "Je découvre", href: "/boutique/consoles-jeux-video?type=consoles", categoryId: "cat-consoles", order: 1 },
  { id: "b-asym-2", placement: "asymmetric", theme: "light", eyebrow: "Simulation", title: "Volant G29 + levier", ctaLabel: "Voir", href: "/boutique/consoles-jeux-video?type=simulation", productId: "p-g29", order: 2 },
  { id: "b-asym-3", placement: "asymmetric", theme: "light", eyebrow: "Stockage", title: "Disques durs WD", ctaLabel: "Voir", href: "/boutique/ordinateurs-informatique?type=stockage", productId: "p-wd-elements", order: 3 },

  // Bannière finale
  { id: "b-final", placement: "final", theme: "light", eyebrow: "Professionnels", title: "Équipez votre salle de jeux", subtitle: "Consoles, manettes et jeux à tarifs dégressifs, livrés au Togo et dans la sous-région.", ctaLabel: "Vente en gros", href: "/vente-en-gros", categoryId: "cat-consoles", order: 1 },
];

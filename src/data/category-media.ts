import { categories } from "./categories";

// Visuel de secours de chaque catégorie (si aucune image n'est définie dans l'admin).
export const categoryImages: Record<string, string> = Object.fromEntries(categories.filter((c) => c.image).map((c) => [c.id, c.image!]));

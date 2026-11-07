// Vidéos des deux cartes portrait de la section « Offre spéciale » :
// la 1re carte est à gauche des promotions, la 2e à droite (sur mobile, côte à côte au-dessus).
//
// Deux possibilités, mélangeables dans la liste :
//  1. Fichier vidéo (recommandé) : déposez le fichier .mp4 dans /public/videos puis écrivez
//     son chemin, ex. "/videos/ps3-slim.mp4". Lecture propre, sans aucun élément TikTok.
//     Format conseillé : vertical 9:16 (1080 × 1920), moins de 15 Mo.
//  2. Lien TikTok : collez le lien de la vidéo (« Partager » > « Copier le lien »).
//     Le lecteur officiel TikTok affiche obligatoirement le nom du compte, le logo
//     TikTok et les boutons j'aime / commenter / partager. La vidéo doit être publique.
//
// Chaque carte reçoit une liste : une seule vidéo tourne en boucle ; plusieurs s'enchaînent, puis recommencent.
export const PROMO_VIDEO_CARDS: [string[], string[]] = [
  ["https://www.tiktok.com/@akua.service.togo/video/7680223103498095890"], // carte de gauche
  ["https://www.tiktok.com/@akua.service.togo/video/7703833037175311634"], // carte de droite
];

export type PromoVideoSource = { kind: "file"; src: string } | { kind: "tiktok"; id: string };

/** Identifie la source : fichier vidéo du site ou vidéo TikTok. */
export function parsePromoVideo(entry: string): PromoVideoSource | null {
  const v = entry.trim();
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(v)) return { kind: "file", src: v };
  const m = v.match(/(?:\/video\/|^)(\d{15,25})/);
  return m ? { kind: "tiktok", id: m[1] } : null;
}

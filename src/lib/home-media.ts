// Visuels de l'accueil (affiche et bannière) : image ou vidéo, importée ou par lien externe.
export type MediaKind = "image" | "video";

/** Identifiant d'une vidéo YouTube (lien classique, court, Shorts ou intégré). */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** Lien direct vers un fichier vidéo lisible par le navigateur. */
export const isVideoFile = (url: string) => /^\/api\/media\/|\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);

/** Le lien externe est-il une vidéo exploitable (fichier ou YouTube) ? */
export const isVideoLink = (url: string) => isVideoFile(url) || !!youtubeId(url);

/** Adresse d'intégration YouTube : lecture auto, sans son, en boucle, sans interface. */
export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&modestbranding=1&rel=0`;

/** Image stockée sur le site (optimisable) ou externe (affichée telle quelle). */
export const isLocalImage = (src: string) => src.startsWith("/");

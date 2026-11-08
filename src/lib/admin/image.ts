"use client";

/** Lit un fichier image en Data URL (pleine résolution, pour recadrer ensuite). */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("lecture impossible"));
    r.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image illisible"));
    img.src = src;
  });
}

/**
 * Recadre une image au format voulu (ratio largeur/hauteur), en gardant la zone indiquée
 * par `focus` (0 = début, 0,5 = centre, 1 = fin, sur l'axe qui dépasse), puis l'exporte en WebP.
 */
export async function cropToRatio(src: string, ratio: number, outW: number, focus = 0.5): Promise<string> {
  const img = await loadImage(src);
  const r = img.width / img.height;
  let sw = img.width;
  let sh = img.height;
  let sx = 0;
  let sy = 0;
  if (r > ratio) {
    sw = img.height * ratio;
    sx = (img.width - sw) * focus;
  } else {
    sh = img.width / ratio;
    sy = (img.height - sh) * focus;
  }
  // jamais agrandie : largeur de sortie plafonnée à la taille utile de l'image
  const c = document.createElement("canvas");
  c.width = Math.round(Math.min(outW, sw));
  c.height = Math.round(c.width / ratio);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c.toDataURL("image/webp", 0.85);
}

/** Axe qui dépasse du cadre : la position se règle sur cet axe. */
export async function overflowAxis(src: string, ratio: number): Promise<"x" | "y" | null> {
  const img = await loadImage(src);
  const r = img.width / img.height;
  if (Math.abs(r - ratio) < 0.01) return null;
  return r > ratio ? "x" : "y";
}

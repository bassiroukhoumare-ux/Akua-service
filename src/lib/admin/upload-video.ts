"use client";

/** Lit un morceau de fichier en base64 (sans l'en-tête data:). */
function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(new Error("lecture impossible"));
    r.readAsDataURL(blob);
  });
}

async function post(base: string, body: object) {
  const res = await fetch(`${base}/api/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { error?: string; id?: string; chunk?: number; url?: string };
  if (!res.ok) throw new Error(data.error ?? "Envoi impossible");
  return data;
}

/** Envoie une vidéo par morceaux ; `onProgress` reçoit 0 → 1. Renvoie son adresse sur le site. */
export async function uploadVideo(base: string, file: File, onProgress: (p: number) => void): Promise<string> {
  // certains téléphones ne donnent pas le type : on le déduit de l'extension
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type || ({ mov: "video/quicktime", m4v: "video/mp4", mp4: "video/mp4", webm: "video/webm" } as Record<string, string>)[ext] || "video/mp4";
  const { id, chunk } = await post(base, { action: "start", mime: mime === "video/x-m4v" ? "video/mp4" : mime, size: file.size });
  const size = chunk!;
  const n = Math.ceil(file.size / size);
  for (let i = 0; i < n; i++) {
    const data = await toBase64(file.slice(i * size, (i + 1) * size));
    for (let attempt = 0; ; attempt++) {
      try {
        await post(base, { action: "chunk", id, idx: i, data });
        break;
      } catch (e) {
        if (attempt >= 2) throw e;
      }
    }
    onProgress((i + 1) / n);
  }
  return (await post(base, { action: "finish", id })).url!;
}

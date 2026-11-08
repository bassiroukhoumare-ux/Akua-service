// Provenance d'une visite : lien de suivi (?utm_source=…) en priorité, sinon le site d'où vient le visiteur.
// Fonction pure, utilisée par le compteur du site public.

export type SourceId = "whatsapp" | "tiktok" | "google" | "facebook" | "instagram" | "youtube" | "snapchat" | "x" | "search" | "other" | "direct";

export const SOURCE_LABEL: Record<SourceId, string> = {
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  google: "Google",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  snapchat: "Snapchat",
  x: "X (Twitter)",
  search: "Autres moteurs",
  other: "Autres sites",
  direct: "Accès direct",
};

export const SOURCE_IDS = Object.keys(SOURCE_LABEL) as SourceId[];

const RULES: [SourceId, RegExp][] = [
  ["whatsapp", /(^|\.)(whatsapp\.(com|net)|wa\.me|wl\.co)$|^whatsapp$|^wa$/],
  ["tiktok", /(^|\.)tiktok\.com$|^tiktok$|^tt$/],
  ["google", /(^|\.)google\.[a-z.]+$|^google$/],
  ["facebook", /(^|\.)(facebook\.com|fb\.me|fb\.com|messenger\.com)$|^(facebook|fb|messenger)$/],
  ["instagram", /(^|\.)instagram\.com$|^(instagram|ig|insta)$/],
  ["youtube", /(^|\.)(youtube\.com|youtu\.be)$|^(youtube|yt)$/],
  ["snapchat", /(^|\.)snapchat\.com$|^(snapchat|snap)$/],
  ["x", /(^|\.)(twitter\.com|x\.com|t\.co)$|^(x|twitter)$/],
  ["search", /(^|\.)(bing\.com|yahoo\.[a-z.]+|duckduckgo\.com|ecosia\.org|qwant\.com|yandex\.[a-z.]+|baidu\.com)$|^(bing|yahoo|duckduckgo)$/],
];

/**
 * @param utm valeur de utm_source (ou ref) dans l'adresse
 * @param referrer document.referrer
 * @param ownHost domaine du site (un lien interne ne compte pas comme provenance)
 */
export function classifySource(utm: string | null, referrer: string, ownHost: string): SourceId {
  const tag = (utm ?? "").trim().toLowerCase();
  if (tag) {
    for (const [id, re] of RULES) if (re.test(tag)) return id;
    return "other";
  }
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "direct";
  }
  if (!host || host === ownHost.replace(/^www\./, "")) return "direct";
  // applications Android : android-app://com.whatsapp/
  if (/^com\.whatsapp/.test(host)) return "whatsapp";
  if (/^com\.(zhiliaoapp|ss\.android)/.test(host)) return "tiktok";
  if (/^com\.facebook/.test(host)) return "facebook";
  if (/^com\.instagram/.test(host)) return "instagram";
  if (/^com\.google/.test(host)) return "google";
  for (const [id, re] of RULES) if (re.test(host)) return id;
  return "other";
}

export type Device = "mobile" | "tablet" | "desktop";

export function deviceFromUA(ua: string): Device {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(ua)) return "mobile";
  return "desktop";
}

export const isBot = (ua: string) => !ua || /bot|crawl|spider|slurp|facebookexternalhit|whatsapp\/|preview|lighthouse|pingdom|monitor/i.test(ua);

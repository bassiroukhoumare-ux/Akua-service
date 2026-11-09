import { Ghost, Link2, Send } from "lucide-react";
import type { SocialNetwork } from "@/lib/shop-settings";
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, XIcon, YouTubeIcon } from "./social-icons";

/** Icône d'un réseau social réglé dans l'admin (Paramètres > Réseaux sociaux). */
export function SocialLinkIcon({ network, className }: { network: SocialNetwork; className?: string }) {
  switch (network) {
    case "facebook":
      return <FacebookIcon className={className} />;
    case "tiktok":
      return <TikTokIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "youtube":
      return <YouTubeIcon className={className} />;
    case "x":
      return <XIcon className={className} />;
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "snapchat":
      return <Ghost aria-hidden className={className} strokeWidth={2} />;
    case "telegram":
      return <Send aria-hidden className={className} strokeWidth={2} />;
    default:
      return <Link2 aria-hidden className={className} strokeWidth={2} />;
  }
}

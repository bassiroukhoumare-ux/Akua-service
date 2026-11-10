import { Ghost, Globe, MousePointer2, Search } from "lucide-react";
import { FacebookIcon, InstagramIcon, TikTokIcon, XIcon, YouTubeIcon } from "@/components/ui/social-icons";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import type { SourceId } from "@/lib/analytics/sources";
import { cn } from "@/lib/utils";

/** Icône de la provenance d'une visite (WhatsApp, TikTok, Google…). */
export function SourceIcon({ id }: { id: SourceId }) {
  const c = "size-4 shrink-0";
  switch (id) {
    case "whatsapp":
      return <WhatsAppIcon size={16} variant="color" />;
    case "tiktok":
      return <TikTokIcon className={c} />;
    case "facebook":
      return <FacebookIcon className={cn(c, "text-[#1877f2]")} />;
    case "instagram":
      return <InstagramIcon className={cn(c, "text-[#d62976]")} />;
    case "youtube":
      return <YouTubeIcon className={cn(c, "text-[#ff0000]")} />;
    case "x":
      return <XIcon className={c} />;
    case "snapchat":
      return <Ghost aria-hidden className={cn(c, "text-akua-ink")} strokeWidth={1.8} />;
    case "google":
    case "search":
      return <Search aria-hidden className={cn(c, "text-akua-ink")} strokeWidth={1.9} />;
    case "other":
      return <Globe aria-hidden className={cn(c, "text-akua-gray-500")} strokeWidth={1.8} />;
    default:
      return <MousePointer2 aria-hidden className={cn(c, "text-akua-gray-500")} strokeWidth={1.8} />;
  }
}

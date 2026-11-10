import Image from "next/image";
import { isLocalImage, youtubeEmbed, youtubeId } from "@/lib/home-media";
import { AutoVideo } from "./auto-video";
import { cn } from "@/lib/utils";

/** Visuel de l'accueil : image (locale ou externe) ou vidéo (importée, fichier ou YouTube), en lecture automatique sans son. */
export function HomeMedia({ src, alt, media = "image", fit = "cover", sizes, priority, className }: { src: string; alt: string; media?: "image" | "video"; fit?: "cover" | "contain"; sizes?: string; priority?: boolean; className?: string }) {
  const objectFit = fit === "cover" ? "object-cover" : "object-contain";
  if (media === "video") {
    const yt = youtubeId(src);
    if (yt) {
      return (
        <div className={cn("absolute inset-0 overflow-hidden", className)}>
          {/* vidéo agrandie pour masquer les bandes noires de YouTube */}
          <iframe src={youtubeEmbed(yt)} title={alt || "Vidéo"} allow="autoplay; encrypted-media; picture-in-picture" className="pointer-events-none absolute top-1/2 left-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 border-0" />
        </div>
      );
    }
    return <AutoVideo src={src} label={alt} className={cn("absolute inset-0 size-full", objectFit, className)} />;
  }
  if (isLocalImage(src)) return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={cn(objectFit, className)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className={cn("absolute inset-0 size-full", objectFit, className)} />;
}

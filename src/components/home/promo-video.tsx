"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { TikTokIcon } from "@/components/ui/social-icons";
import { parsePromoVideo, type PromoVideoSource } from "@/config/promo-video";
import { TIKTOK_URL } from "@/config/site";
import { cn } from "@/lib/utils";

const ORIGIN = "https://www.tiktok.com";
// Lecteur officiel TikTok : lecture auto sans le son (obligatoire pour les navigateurs), en boucle, interface réduite.
const PARAMS = "autoplay=1&muted=1&loop=1&controls=0&description=0&music_info=0&rel=0&native_context_menu=0&closed_caption=0";

type PlayerMsg = { type?: string; value?: unknown; "x-tiktok-player"?: boolean };
// une seule carte avec le son à la fois : activer le son d'une carte coupe les autres
const SOUND_EVENT = "akua:promo-video-sound";

/**
 * Carte portrait qui lit les vidéos de la boutique en boucle : fichier vidéo du site
 * (sans aucun élément TikTok) ou lecteur officiel TikTok.
 * La vidéo n'est chargée qu'à l'approche de la section, et mise en pause quand elle sort de l'écran.
 */
export function PromoVideo({ videos, className }: { videos: string[]; className?: string }) {
  const uid = useId();
  const sources = videos.map(parsePromoVideo).filter((s): s is PromoVideoSource => !!s);
  const [idx, setIdx] = useState(0);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const wantSound = useRef(false);
  const visible = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const src = sources[idx % Math.max(sources.length, 1)];
  const many = sources.length > 1;

  const sendTikTok = (type: string, value?: unknown) =>
    frame.current?.contentWindow?.postMessage({ type, value, "x-tiktok-player": true }, ORIGIN);

  const next = () => {
    setReady(false);
    setIdx((i) => i + 1);
  };

  // chargement à l'approche, pause / reprise selon la visibilité
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        if (e.isIntersecting) setLoad(true);
        sendTikTok(e.isIntersecting ? "play" : "pause");
        const v = video.current;
        if (v) {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // une autre carte vient d'activer son son : on coupe celui-ci
  useEffect(() => {
    const on = (e: Event) => {
      if ((e as CustomEvent<string>).detail === uid) return;
      wantSound.current = false;
      if (video.current) video.current.muted = true;
      sendTikTok("mute");
      setMuted(true);
    };
    window.addEventListener(SOUND_EVENT, on);
    return () => window.removeEventListener(SOUND_EVENT, on);
  }, [uid]);

  // événements du lecteur TikTok
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== ORIGIN || e.source !== frame.current?.contentWindow) return;
      let d: PlayerMsg = e.data;
      if (typeof d === "string") {
        try {
          d = JSON.parse(d);
        } catch {
          return;
        }
      }
      if (!d?.["x-tiktok-player"]) return;
      if (d.type === "onPlayerReady") {
        setReady(true);
        if (wantSound.current) sendTikTok("unMute");
      } else if (d.type === "onMute") setMuted(Boolean(d.value));
      else if (d.type === "onStateChange" && d.value === 0) {
        // fin de la vidéo : suivante s'il y en a plusieurs, sinon on relance
        if (many) next();
        else {
          sendTikTok("seekTo", 0);
          sendTikTok("play");
        }
      }
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [many]);

  if (!src) return null;

  const toggleSound = () => {
    wantSound.current = muted;
    if (muted) window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: uid }));
    if (src.kind === "file") {
      const v = video.current;
      if (!v) return;
      v.muted = !muted;
      if (!v.muted) v.play().catch(() => {});
      setMuted(v.muted);
    } else sendTikTok(muted ? "unMute" : "mute");
  };

  return (
    <div ref={box} className={cn("relative isolate overflow-hidden rounded-[24px] bg-akua-ink", className)}>
      {load && src.kind === "file" && (
        <video
          key={src.src}
          ref={video}
          src={src.src}
          autoPlay
          muted={!wantSound.current}
          loop={!many}
          playsInline
          preload="metadata"
          aria-label="Vidéo AKUA Service"
          onLoadedData={(e) => {
            setReady(true);
            setMuted(e.currentTarget.muted);
            if (!visible.current) e.currentTarget.pause();
          }}
          onEnded={many ? next : undefined}
          className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}
        />
      )}

      {load && src.kind === "tiktok" && (
        <iframe
          key={src.id}
          ref={frame}
          src={`${ORIGIN}/player/v1/${src.id}?${PARAMS}`}
          title="Vidéo TikTok AKUA Service"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          className={cn("absolute inset-0 size-full border-0 transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}
        />
      )}

      {/* attente de la vidéo */}
      {!ready && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 animate-pulse place-items-center rounded-full bg-akua-white/10 text-akua-white">
            <TikTokIcon className="size-6" />
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={toggleSound}
        disabled={!ready}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        aria-pressed={!muted}
        title={muted ? "Activer le son" : "Couper le son"}
        className="absolute bottom-3 left-3 z-10 grid size-10 place-items-center rounded-full bg-akua-black/60 text-akua-white ring-1 ring-akua-white/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-akua-black/80 disabled:opacity-0"
      >
        {muted ? <VolumeX aria-hidden className="size-[18px]" /> : <Volume2 aria-hidden className="size-[18px]" />}
      </button>

      <a
        href={TIKTOK_URL}
        target="_blank"
        rel="noopener"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:rounded-full focus:bg-akua-white focus:px-3 focus:py-1.5 focus:text-[12.5px] focus:font-semibold"
      >
        Voir AKUA Service sur TikTok
      </a>
    </div>
  );
}

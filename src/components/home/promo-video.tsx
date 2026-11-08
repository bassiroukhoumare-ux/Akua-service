"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { TikTokIcon } from "@/components/ui/social-icons";
import { parsePromoVideo, type PromoVideoSource } from "@/config/promo-video";
import { TIKTOK_URL } from "@/config/site";
import { cn } from "@/lib/utils";

const ORIGIN = "https://www.tiktok.com";
// Lecteur officiel TikTok. Avant le clic : simple aperçu (sans lecture automatique, le lecteur
// ne répond à aucune commande). Au clic : le lecteur est rechargé en mode lecture, avec le son.
const BASE = "loop=1&controls=0&description=0&music_info=0&rel=0&native_context_menu=0&closed_caption=0";
const POSTER_PARAMS = `autoplay=0&muted=1&${BASE}`;
const LIVE_PARAMS = `autoplay=1&muted=0&${BASE}`;

type PlayerMsg = { type?: string; value?: unknown; "x-tiktok-player"?: boolean };
// une seule vidéo à la fois : lancer une carte met les autres en pause
const PLAY_EVENT = "akua:promo-video-play";

/**
 * Carte portrait qui lit les vidéos de la boutique à la demande : fichier vidéo du site
 * (sans aucun élément TikTok) ou lecteur officiel TikTok.
 * Rien ne se lance tout seul : bouton lecture / pause par carte, et une seule vidéo joue à la fois.
 */
export function PromoVideo({ videos, className }: { videos: string[]; className?: string }) {
  const uid = useId();
  const sources = videos.map(parsePromoVideo).filter((s): s is PromoVideoSource => !!s);
  const [idx, setIdx] = useState(0);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  // lecteur TikTok chargé en mode lecture (après le premier clic)
  const [started, setStarted] = useState(false);
  const wantPlay = useRef(false);
  const gotPlaying = useRef(false);
  const lastPlayAt = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const src = sources[idx % Math.max(sources.length, 1)];
  const many = sources.length > 1;

  const sendTikTok = (type: string, value?: unknown) =>
    frame.current?.contentWindow?.postMessage({ type, value, "x-tiktok-player": true }, ORIGIN);

  const pause = () => {
    wantPlay.current = false;
    setPlaying(false);
    video.current?.pause();
    sendTikTok("pause");
  };

  const play = () => {
    wantPlay.current = true;
    lastPlayAt.current = Date.now();
    setPlaying(true);
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: uid }));
    if (src?.kind === "file") {
      const v = video.current;
      if (!v) return;
      v.muted = muted;
      v.play().catch(() => {
        // le navigateur refuse le son : on relance sans le son
        v.muted = true;
        setMuted(true);
        v.play().catch(() => setPlaying(false));
      });
    } else if (!started) setStarted(true);
    else {
      sendTikTok("play");
      sendTikTok(muted ? "mute" : "unMute");
    }
  };

  const next = () => {
    setReady(false);
    setIdx((i) => i + 1);
  };

  // le lecteur n'est chargé qu'à l'approche de la section ; hors écran, la vidéo se met en pause
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setLoad(true);
        else if (wantPlay.current) pause();
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // une autre carte vient d'être lancée : celle-ci se met en pause
  useEffect(() => {
    const on = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== uid && wantPlay.current) pause();
    };
    window.addEventListener(PLAY_EVENT, on);
    return () => window.removeEventListener(PLAY_EVENT, on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        gotPlaying.current = false;
        if (!wantPlay.current) sendTikTok("pause");
        else {
          // le visiteur a cliqué sur lecture : on active le son
          sendTikTok("unMute");
          sendTikTok("play");
          // lecture avec le son refusée par le navigateur : on relance sans le son
          window.setTimeout(() => {
            if (wantPlay.current && !gotPlaying.current) {
              sendTikTok("mute");
              sendTikTok("play");
            }
          }, 2500);
        }
      } else if (d.type === "onMute") setMuted(Boolean(d.value));
      else if (d.type === "onStateChange") {
        if (d.value === 0) {
          // fin : suivante s'il y en a plusieurs, sinon on relance
          if (many) next();
          else if (wantPlay.current) {
            sendTikTok("seekTo", 0);
            sendTikTok("play");
          }
        } else if (d.value === 1) {
          gotPlaying.current = true;
          if (!wantPlay.current) sendTikTok("pause");
          else setPlaying(true);
        } else if (d.value === 2 && wantPlay.current && Date.now() - lastPlayAt.current < 1500) {
          // le navigateur a bloqué la lecture avec le son : on relance sans le son
          sendTikTok("mute");
          sendTikTok("play");
        }
      }
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
     
  }, [many, muted]);

  if (!src) return null;

  const toggleSound = () => {
    const m = !muted;
    setMuted(m);
    if (src.kind === "file") {
      if (video.current) video.current.muted = m;
    } else sendTikTok(m ? "mute" : "unMute");
  };

  return (
    <div ref={box} className={cn("group/video relative isolate overflow-hidden rounded-[24px] bg-akua-ink", className)}>
      {load && src.kind === "file" && (
        <video
          key={src.src}
          ref={video}
          src={src.src}
          loop={!many}
          playsInline
          preload="metadata"
          aria-label="Vidéo AKUA Service"
          onLoadedData={(e) => {
            setReady(true);
            if (wantPlay.current) e.currentTarget.play().catch(() => {});
          }}
          onPause={(e) => {
            if (e.currentTarget.ended) return;
            wantPlay.current = false;
            setPlaying(false);
          }}
          onPlay={() => setPlaying(true)}
          onEnded={many ? next : undefined}
          className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}
        />
      )}

      {load && src.kind === "tiktok" && (
        <iframe
          key={`${src.id}-${started}`}
          ref={frame}
          src={`${ORIGIN}/player/v1/${src.id}?${started ? LIVE_PARAMS : POSTER_PARAMS}`}
          onLoad={() => !started && setReady(true)}
          title="Vidéo TikTok AKUA Service"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          tabIndex={-1}
          className={cn("absolute inset-0 size-full border-0 transition-opacity duration-500", ready ? "opacity-100" : "opacity-0")}
        />
      )}

      {/* attente du lecteur */}
      {!ready && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 animate-pulse place-items-center rounded-full bg-akua-white/10 text-akua-white">
            <TikTokIcon className="size-6" />
          </span>
        </div>
      )}

      {/* couche de contrôle : un toucher sur la vidéo lance ou met en pause */}
      <button
        type="button"
        onClick={() => (playing ? pause() : play())}
        disabled={!ready}
        aria-label={playing ? "Mettre la vidéo en pause" : "Lire la vidéo"}
        className={cn(
          "absolute inset-0 z-[5] grid place-items-center outline-none transition-colors duration-300 focus-visible:ring-4 focus-visible:ring-akua-blue/60 focus-visible:ring-inset disabled:cursor-default",
          playing ? "bg-transparent" : "bg-[radial-gradient(circle_at_50%_50%,rgb(11_16_32/0.12),rgb(11_16_32/0.45))]",
        )}
      >
        {ready && (
          <span
            className={cn(
              "grid place-items-center rounded-full text-akua-white ring-1 ring-akua-white/30 backdrop-blur-md transition-all duration-300 ease-akua",
              playing
                ? "size-14 scale-90 bg-akua-black/45 opacity-0 group-hover/video:opacity-100 group-focus-within/video:opacity-100"
                : "size-16 bg-akua-white/20 shadow-[0_12px_30px_-10px_rgb(0_0_0/0.6)] group-hover/video:scale-105 group-hover/video:bg-akua-white/30 md:size-[72px]",
            )}
          >
            {playing ? <Pause aria-hidden className="size-6 fill-current" strokeWidth={0} /> : <Play aria-hidden className="ml-1 size-7 fill-current md:size-8" strokeWidth={0} />}
          </span>
        )}
      </button>

      {/* son : visible pendant la lecture */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        aria-pressed={!muted}
        title={muted ? "Activer le son" : "Couper le son"}
        className={cn(
          "absolute bottom-3 left-3 z-10 grid size-10 place-items-center rounded-full bg-akua-black/60 text-akua-white ring-1 ring-akua-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-akua-black/80",
          playing ? "opacity-100" : "pointer-events-none opacity-0",
        )}
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

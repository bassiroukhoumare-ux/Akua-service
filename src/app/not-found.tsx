import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-akua pt-8 md:pt-14">
      <div className="relative overflow-hidden rounded-[32px] bg-akua-tile px-6 py-14 text-center md:py-20">
        <p aria-hidden className="text-mega pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-[clamp(120px,30vw,380px)] text-akua-white select-none">
          404
        </p>
        <div className="relative mx-auto aspect-[8/7] w-48 -rotate-12 animate-[akua-float_6s_ease-in-out_infinite] md:w-60">
          <Image src="/products/ds4.webp" alt="" fill sizes="240px" className="object-contain drop-shadow-[0_30px_30px_rgb(11_16_32/0.3)]" />
        </div>
        <p className="relative mt-6 text-[12.5px] font-medium text-akua-blue">Erreur 404</p>
        <h1 className="relative mt-1 font-display text-[40px] font-semibold md:text-[60px]">Game over…</h1>
        <p className="relative mx-auto mt-3 max-w-md text-[15px] text-akua-gray-500">Cette page n&apos;existe pas ou a été déplacée. Appuyez sur Start pour revenir à la partie.</p>
        <Link href="/" className="btn-shine relative mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-akua-ink px-6 font-semibold text-akua-white hover:bg-akua-blue">
          <ArrowLeft aria-hidden className="size-4" /> Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

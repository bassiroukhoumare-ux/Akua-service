import { cn } from "@/lib/utils";

// Drapeaux simplifiés des pays livrés (couleurs officielles : données, pas thème).
const STAR = "M5 0l1.18 3.62H10L6.9 5.86 8.09 9.5 5 7.26 1.9 9.5l1.2-3.64L0 3.62h3.82z";

export function Flag({ code, className }: { code: string; className?: string }) {
  const c = cn("h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-akua-ink/10", className);
  switch (code) {
    case "TG":
      return (
        <svg viewBox="0 0 30 20" className={c} aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} y={i * 4} width="30" height="4" fill={i % 2 ? "#ffce00" : "#006a4e"} />
          ))}
          <rect width="12" height="12" fill="#d21034" />
          <path d={STAR} fill="#fff" transform="translate(1 1.2) scale(1)" />
        </svg>
      );
    case "BJ":
      return (
        <svg viewBox="0 0 30 20" className={c} aria-hidden>
          <rect width="30" height="10" fill="#fcd116" />
          <rect y="10" width="30" height="10" fill="#e8112d" />
          <rect width="12" height="20" fill="#008751" />
        </svg>
      );
    case "GH":
      return (
        <svg viewBox="0 0 30 20" className={c} aria-hidden>
          <rect width="30" height="7" fill="#ce1126" />
          <rect y="7" width="30" height="6" fill="#fcd116" />
          <rect y="13" width="30" height="7" fill="#006b3f" />
          <path d={STAR} fill="#000" transform="translate(10 5.2)" />
        </svg>
      );
    case "BF":
      return (
        <svg viewBox="0 0 30 20" className={c} aria-hidden>
          <rect width="30" height="10" fill="#ef2b2d" />
          <rect y="10" width="30" height="10" fill="#009e49" />
          <path d={STAR} fill="#fcd116" transform="translate(10 5.2)" />
        </svg>
      );
    case "CI":
      return (
        <svg viewBox="0 0 30 20" className={c} aria-hidden>
          <rect width="10" height="20" fill="#f77f00" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#009e60" />
        </svg>
      );
    case "NE":
      return (
        <svg viewBox="0 0 30 20" className={c} aria-hidden>
          <rect width="30" height="7" fill="#e05206" />
          <rect y="7" width="30" height="6" fill="#fff" />
          <rect y="13" width="30" height="7" fill="#0db02b" />
          <circle cx="15" cy="10" r="2.2" fill="#e05206" />
        </svg>
      );
    case "ML":
      return (
        <svg viewBox="0 0 30 20" className={c} aria-hidden>
          <rect width="10" height="20" fill="#14b53a" />
          <rect x="10" width="10" height="20" fill="#fcd116" />
          <rect x="20" width="10" height="20" fill="#ce1126" />
        </svg>
      );
    default:
      return null;
  }
}

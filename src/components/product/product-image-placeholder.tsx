import { categories } from "@/data/categories";
import { getCategoryIcon, ICON_STROKE } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface ProductImagePlaceholderProps {
  name: string;
  categoryId: string;
  className?: string;
  tone?: "light" | "dark";
  showName?: boolean;
}

/** Visuel de repli élégant tant que les photos produits ne sont pas fournies. */
export function ProductImagePlaceholder({
  name,
  categoryId,
  className,
  tone = "light",
  showName = true,
}: ProductImagePlaceholderProps) {
  const category = categories.find((c) => c.id === categoryId);
  const Icon = getCategoryIcon(category?.icon);
  const dark = tone === "dark";

  return (
    <div
      role="img"
      aria-label={`${name}, photo à venir`}
      className={cn(
        "relative isolate flex size-full flex-col items-center justify-center gap-3 overflow-hidden",
        dark ? "bg-akua-surface-dark" : "bg-akua-gray-50",
        className,
      )}
    >
      {/* halo + grille fine */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          "[background-image:radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--akua-blue)_16%,transparent),transparent_62%)]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 opacity-60 [background-size:22px_22px]",
          dark
            ? "[background-image:linear-gradient(var(--akua-line-dark)_1px,transparent_1px),linear-gradient(90deg,var(--akua-line-dark)_1px,transparent_1px)]"
            : "[background-image:radial-gradient(var(--akua-gray-200)_1px,transparent_1px)]",
          "[mask-image:radial-gradient(circle_at_50%_50%,black,transparent_75%)]",
        )}
      />
      <Icon
        aria-hidden
        strokeWidth={ICON_STROKE * 0.6}
        className={cn("size-[38%] max-h-40", dark ? "text-akua-blue" : "text-akua-blue/70")}
      />
      {showName && (
        <span
          className={cn(
            "max-w-[80%] truncate text-center text-[11px] font-semibold tracking-wide uppercase",
            dark ? "text-akua-white/50" : "text-akua-gray-500",
          )}
        >
          {name}
        </span>
      )}
    </div>
  );
}

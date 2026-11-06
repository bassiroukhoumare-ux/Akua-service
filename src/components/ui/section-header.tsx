import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  center?: ReactNode;
  right?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}

export function SectionHeader({ eyebrow, title, href, linkLabel = "Voir tout", center, right, tone = "light", className }: SectionHeaderProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-x-6 gap-y-3", className)}>
      <div>
        {eyebrow && (
          <p className={cn("mb-1.5 text-[11px] font-extrabold tracking-[0.16em] uppercase", dark ? "text-akua-blue" : "text-akua-blue")}>{eyebrow}</p>
        )}
        <h2 className={cn("text-[20px] font-bold md:text-[24px]", dark ? "text-akua-white" : "text-akua-ink")}>{title}</h2>
      </div>
      {center}
      <div className="flex items-center gap-4">
        {right}
        {href && (
          <Link href={href} className={cn("group flex items-center gap-1.5 text-[13.5px] font-bold", dark ? "text-akua-white" : "text-akua-blue")}>
            {linkLabel}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

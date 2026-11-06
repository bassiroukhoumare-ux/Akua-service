import { cn } from "@/lib/utils";

export function SectionHeading({ index, eyebrow, title, children, className }: { index: string; eyebrow: string; title: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}>
      <div>
        <p className="flex items-center gap-2.5 text-[12px] font-semibold tracking-[0.16em] text-akua-gray-500 uppercase">
          <span className="text-akua-blue">{index}</span>
          <span className="h-px w-8 bg-akua-gray-200" />
          {eyebrow}
        </p>
        <h2 className="mt-2.5 text-[28px] leading-[1.08] font-extrabold tracking-[-0.035em] text-akua-ink md:text-[42px]">{title}</h2>
      </div>
      {children}
    </div>
  );
}


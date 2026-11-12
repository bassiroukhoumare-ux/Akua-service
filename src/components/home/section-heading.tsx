import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  eyebrow,
  title,
  children,
  className,
  centerMobile,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** titre, sur-titre et actions centrés sur mobile, alignés à gauche à partir de la tablette */
  centerMobile?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", centerMobile && "max-md:flex-col max-md:items-center max-md:text-center", className)}>
      <div className={cn(centerMobile && "max-md:flex max-md:flex-col max-md:items-center")}>
        <p className="flex items-center gap-2.5 text-[12px] font-semibold tracking-[0.16em] text-akua-gray-500 uppercase">
          {index && (
            <>
              <span className="text-akua-blue">{index}</span>
              <span className="h-px w-8 bg-akua-gray-200" />
            </>
          )}
          {eyebrow}
          {centerMobile && <span aria-hidden className="h-px w-8 bg-akua-gray-200 md:hidden" />}
        </p>
        <h2 className="mt-2.5 text-[28px] leading-[1.08] font-extrabold tracking-[-0.035em] text-balance text-akua-ink md:text-[42px]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

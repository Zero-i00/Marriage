import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { delay } from "@/shared/lib/section-animation";

/** Декоративная росчерк-линия у имени "Артём" в hero — рисуется штрихом. */
export function ArtemLine({ className, ...rest }: ComponentProps<"svg">) {
  return (
    <svg
      className={twMerge(
        "aspect-1264/136 h-auto min-w-0 flex-1 max-[900px]:hidden",
        className,
      )}
      viewBox="0 0 1264 136"
      fill="none"
      preserveAspectRatio="xMaxYMax meet"
      aria-hidden="true"
      {...rest}
    >
      <path
        className="animate-draw"
        style={delay(1.4)}
        d="M1264 134.171C1066.25 134.292 965.473 27.7853 862.312 15.388C792.142 6.9554 757.688 145.807 595.585 95.1184C427.3 30.6856 320.084 85.2668 366.855 109.607C413.626 133.948 630.346 32.2878 491.965 5.48972C353.582 -21.3083 121.05 85.5963 -95 79.8217"
        stroke="var(--color-primary-900)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
    </svg>
  );
}

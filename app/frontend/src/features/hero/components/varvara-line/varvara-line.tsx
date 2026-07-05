import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { delay } from "@/shared/lib/section-animation";

/** Декоративная росчерк-линия у имени "Варвара" в hero — рисуется штрихом в обратном направлении. */
export function VarvaraLine({ className, ...rest }: ComponentProps<"svg">) {
  return (
    <svg
      className={twMerge(
        "aspect-1097/126 h-auto w-20 shrink-0 min-[901px]:w-auto min-[901px]:min-w-0 min-[901px]:flex-1",
        className,
      )}
      viewBox="0 0 1097 126"
      fill="none"
      preserveAspectRatio="xMinYMax meet"
      aria-hidden="true"
      {...rest}
    >
      <path
        className="animate-draw-reverse"
        style={delay(0.6)}
        d="M1097 92.9266C906.671 71.4517 687.077 147.514 657.122 116.611C619.676 77.9824 709.672 -39.9098 730.189 15.8004C748.779 66.2743 613.694 103.09 549.454 92.9259C456.889 78.2809 425.132 -4.25839 302.705 15.8028C180.28 35.8641 137.351 104.95 0.00488281 104.394"
        stroke="var(--color-primary-900)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
      />
    </svg>
  );
}

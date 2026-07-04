import Image from "next/image";
import type { ComponentProps, CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";

function delay(seconds: number): CSSProperties {
  return { "--delay": `${seconds}s` } as CSSProperties;
}

export function HeroSection({
  id = ROOT_SECTION.HERO,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <section
      id={id}
      className={twMerge(
        "relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-[var(--color-natural-100)] px-24 py-24 max-[900px]:justify-start max-[900px]:gap-10 max-[900px]:px-6 max-[900px]:py-12",
        className,
      )}
      {...rest}
    >
      <div className="flex items-center justify-start max-[900px]:justify-center">
        <Image
          src="/hero/varvara.webp"
          alt="Варвара"
          width={520}
          height={140}
          priority
          className="animate-fade-in-up relative z-10 h-auto w-[clamp(9rem,20vw,22rem)] shrink-0 max-[900px]:w-[clamp(10rem,60vw,18rem)]"
          style={delay(0.1)}
        />
        {/* ponytail: макет — только desktop, мобильного варианта росчерков нет; на узких экранах линия не читается между блоками, прячем её */}
        <svg
          className="aspect-[1097/126] h-auto min-w-0 flex-1 max-[900px]:hidden"
          viewBox="0 0 1097 126"
          fill="none"
          preserveAspectRatio="xMinYMax meet"
          aria-hidden="true"
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
      </div>

      <div
        className="animate-fade-in-up flex flex-col items-center gap-3 text-center"
        style={delay(0.9)}
      >
        <Typography
          variant="overline"
          as="p"
          className="uppercase tracking-[0.08em] text-[var(--color-gray-700)]"
        >
          приглашение на свадьбу
        </Typography>
        <Image
          src="/hero/couple.webp"
          alt="Артём & Варвара"
          width={420}
          height={220}
          priority
          className="h-auto w-[clamp(14rem,24vw,26rem)] max-[900px]:w-[clamp(11rem,60vw,18rem)]"
        />
        <Typography
          variant="subtitle-1"
          as="p"
          className="text-[var(--color-gray-700)]"
        >
          28/08/2026
        </Typography>
      </div>

      <div className="flex items-center justify-end max-[900px]:justify-center">
        <svg
          className="aspect-[1264/136] h-auto min-w-0 flex-1 max-[900px]:hidden"
          viewBox="0 0 1264 136"
          fill="none"
          preserveAspectRatio="xMaxYMax meet"
          aria-hidden="true"
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
        <Image
          src="/hero/artem.webp"
          alt="Артём"
          width={420}
          height={140}
          priority
          className="animate-fade-in-up relative z-10 h-auto w-[clamp(9rem,20vw,22rem)] shrink-0 max-[900px]:w-[clamp(10rem,60vw,18rem)]"
          style={delay(1.9)}
        />
      </div>
    </section>
  );
}

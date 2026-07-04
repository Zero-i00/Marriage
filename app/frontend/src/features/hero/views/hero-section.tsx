import Image from "next/image";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatedSection } from "@/shared/components/animated-section";
import { delay } from "@/shared/lib/section-animation";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";

export function HeroSection({
  id = ROOT_SECTION.HERO,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <AnimatedSection
      id={id}
      className={twMerge(
        //   FIXME вместо px и py используй container миксины, описанные в global.css
        //   FIXME если пишешь адаптив, то выноси его отдельной строчкой, например 1 строка в twMerge функции под desktop, потом запятая, новая строчка под sm
        "relative flex min-h-svh flex-col justify-between overflow-hidden bg-(--color-natural-100) px-24 py-24 max-[900px]:justify-start max-[900px]:gap-10 max-[900px]:px-6 max-[900px]:py-12",
        className,
      )}
      {...rest}
    >
      <div className="flex items-center justify-start max-[900px]:justify-center">
        {/* intrinsic 2501x400, capH=400 → ширина = intrinsicW*80/400, единый кегль имён hero */}
        {/* FIXME мне не нравятся конкретные числа width и height, как мы будем с ними адатировать под мобилки все эти картинки?*/}
        <Image
          src="/hero/varvara.webp"
          alt="Варвара"
          width={2501}
          height={400}
          priority
          className="animate-fade-in-up relative z-10 h-auto w-[clamp(216px,39vw,500px)] shrink-0"
          style={delay(0.1)}
        />
        {/* FIXME Вынести в отдельный компонент varvara-line (уже создал папку, тебе нужно создать файл и вынести, не забудь прокинут пропсы через ComponentProps<'svg'>) и использовать ..rest */}
        <svg
          className="aspect-1097/126 h-auto min-w-0 flex-1 max-[900px]:hidden"
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
          className="uppercase tracking-[0.08em] text-gray-700"
        >
          приглашение на свадьбу
        </Typography>
        {/* intrinsic 1501x896, capH≈240/строка → ширина = intrinsicW*80/240, единый кегль имён hero */}
        {/* FIXME мне не нравятся конкретные числа width и height, как мы будем с ними адатировать под мобилки все эти картинки?*/}
        <Image
          src="/hero/couple.webp"
          alt="Артём & Варвара"
          width={1501}
          height={896}
          priority
          className="h-auto w-[clamp(216px,39vw,500px)]"
        />
        <Typography
          variant="subtitle-1"
          as="p"
          className="text-gray-700"
        >
          28/08/2026
        </Typography>
      </div>

      {/* FIXME Вынести в отдельный компонент artem-line (уже создал папку, тебе нужно создать файл и вынести, не забудь прокинут пропсы через ComponentProps<'svg'>) и использовать ..rest */}
      <div className="flex items-center justify-end max-[900px]:justify-center">
        <svg
          className="aspect-1264/136 h-auto min-w-0 flex-1 max-[900px]:hidden"
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
        {/* intrinsic 1832x400, capH=400 → ширина = intrinsicW*80/400, единый кегль имён hero */}
        {/* FIXME мне не нравятся конкретные числа width и height, как мы будем с ними адатировать под мобилки все эти картинки?*/}
        <Image
          src="/hero/artem.webp"
          alt="Артём"
          width={1832}
          height={400}
          priority
          className="animate-fade-in-up relative z-10 h-auto w-[clamp(159px,29vw,366px)] shrink-0"
          style={delay(1.9)}
        />
      </div>
    </AnimatedSection>
  );
}

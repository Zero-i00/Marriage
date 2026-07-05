import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { ArtemLine } from "@/features/hero/components/artem-line";
import { VarvaraLine } from "@/features/hero/components/varvara-line";
import { TitleImage } from "@/shared/components/elements/title-image";
import { AnimatedSection } from "@/shared/components/layout/animated-section";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import { delay } from "@/shared/lib/section-animation";

export function HeroSection({
  id = ROOT_SECTION.HERO,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <AnimatedSection
      id={id}
      className={twMerge(
        "container-section relative flex min-h-svh flex-col justify-between overflow-hidden bg-(--color-natural-100) py-24 max-[900px]:py-16",
        className,
      )}
      {...rest}
    >
      {/* ≥901px: три горизонтальных ряда, линии заполняют оставшееся место */}
      <div className="flex flex-1 flex-col justify-between max-[900px]:hidden">
        <div className="flex items-center justify-start">
          <TitleImage
            src="/hero/varvara.webp"
            alt="Варвара"
            intrinsic={[2501, 400]}
            width="clamp(216px,39vw,500px)"
            priority
            className="animate-fade-in-up relative z-10 shrink-0"
            style={delay(0.1)}
          />
          <VarvaraLine />
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
          <TitleImage
            src="/hero/couple.webp"
            alt="Артём & Варвара"
            intrinsic={[1501, 896]}
            width="clamp(216px,39vw,500px)"
            priority
          />
          <Typography variant="subtitle-1" as="p" className="text-gray-700">
            28/08/2026
          </Typography>
        </div>

        <div className="flex items-center justify-end">
          <ArtemLine />
          <TitleImage
            src="/hero/artem.webp"
            alt="Артём"
            intrinsic={[1832, 400]}
            width="clamp(159px,29vw,366px)"
            priority
            className="animate-fade-in-up relative z-10 shrink-0"
            style={delay(1.9)}
          />
        </div>
      </div>

      {/* ≤900px: имена вертикально по краям (по мокапу), центр — как на десктопе */}
      <div className="hidden max-[900px]:flex max-[900px]:flex-1 max-[900px]:flex-col max-[900px]:items-center max-[900px]:justify-center">
        <div className="absolute left-2 top-1/2 h-[62svh] w-20 -translate-y-1/2">
          <div className="absolute left-1/2 top-1/2 flex w-[62svh] -translate-x-1/2 -translate-y-1/2 -rotate-90 items-center gap-3">
            <TitleImage
              src="/hero/varvara.webp"
              alt="Варвара"
              intrinsic={[2501, 400]}
              width="clamp(140px,26svh,220px)"
              priority
              className="animate-fade-in-up shrink-0"
              style={delay(0.1)}
            />
            <VarvaraLine />
          </div>
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
          <TitleImage
            src="/hero/couple.webp"
            alt="Артём & Варвара"
            intrinsic={[1501, 896]}
            width="clamp(200px,50vw,300px)"
            priority
          />
          <Typography variant="subtitle-1" as="p" className="text-gray-700">
            28/08/2026
          </Typography>
        </div>

        <div className="absolute right-2 top-1/2 h-[62svh] w-20 -translate-y-1/2">
          <div className="absolute left-1/2 top-1/2 flex w-[62svh] -translate-x-1/2 -translate-y-1/2 rotate-90 items-center gap-3">
            <ArtemLine />
            <TitleImage
              src="/hero/artem.webp"
              alt="Артём"
              intrinsic={[1832, 400]}
              width="clamp(120px,22svh,190px)"
              priority
              className="animate-fade-in-up shrink-0"
              style={delay(1.9)}
            />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

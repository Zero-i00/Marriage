import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { ArtemName } from "@/features/hero/components/artem-name";
import { VarvaraName } from "@/features/hero/components/varvara-name";
import { TitleImage } from "@/shared/components/elements/title-image";
import { AnimatedSection } from "@/shared/components/layout/animated-section";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import { delay } from "@/shared/lib/section-animation";

function CenterBlock() {
  return (
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
        width="clamp(200px,39vw,500px)"
        priority
      />
      <Typography variant="subtitle-1" as="p" className="text-gray-700">
        28/08/2026
      </Typography>
    </div>
  );
}

export function HeroSection({
  id = ROOT_SECTION.HERO,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <AnimatedSection
      id={id}
      className={twMerge(
        "container-section relative flex min-h-svh flex-col justify-between overflow-hidden py-24 max-[900px]:py-16",
        className,
      )}
      {...rest}
    >
      {/* ≥901px: имя+линия одним рядом через всю ширину */}
      <div className="flex items-center justify-start overflow-hidden max-[900px]:hidden">
        <VarvaraName className="h-auto w-full max-w-[900px]" />
      </div>

      <div className="max-[900px]:hidden">
        <CenterBlock />
      </div>

      <div className="flex items-center justify-end overflow-hidden max-[900px]:hidden">
        <ArtemName className="h-auto w-full max-w-[900px]" />
      </div>

      {/* ≤900px: имя+линия повёрнуты вертикально вдоль краёв (по мокапу) */}
      <div className="hidden max-[900px]:flex max-[900px]:flex-1 max-[900px]:flex-col max-[900px]:items-center max-[900px]:justify-center">
        <div className="absolute left-2 top-1/2 h-[68svh] w-16 -translate-y-1/2">
          <div className="absolute left-1/2 top-1/2 w-[68svh] -translate-x-1/2 -translate-y-1/2 -rotate-90">
            <VarvaraName className="h-auto w-full" />
          </div>
        </div>

        <CenterBlock />

        <div className="absolute right-2 top-2 h-[68svh] w-16">
          <div className="absolute left-1/2 top-1/2 w-[68svh] -translate-x-1/2 -translate-y-1/2 -rotate-90">
            <ArtemName className="h-auto w-full" />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

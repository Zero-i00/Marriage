import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { ArtemLine } from "@/features/hero/components/artem-line";
import { VarvaraLine } from "@/features/hero/components/varvara-line";
import { AnimatedSection } from "@/shared/components/layout/animated-section";
import { TitleImage } from "@/shared/components/elements/title-image";
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
        "container-section relative flex min-h-svh flex-col justify-between overflow-hidden bg-(--color-natural-100) py-24",
        "max-[900px]:justify-start max-[900px]:gap-10 max-[900px]:py-12",
        className,
      )}
      {...rest}
    >
      <div className="flex items-center justify-start max-[900px]:justify-center">
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

      <div className="flex items-center justify-end max-[900px]:justify-center">
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
    </AnimatedSection>
  );
}

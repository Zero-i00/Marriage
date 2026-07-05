import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { Arch } from "@/features/about/components/arch";
import { TitleImage } from "@/shared/components/elements/title-image";
import { AnimatedSection } from "@/shared/components/layout/animated-section";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import { delay } from "@/shared/lib/section-animation";
import "./about-section.css";

export function AboutSection({
  id = ROOT_SECTION.ABOUT,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <AnimatedSection
      id={id}
      className={twMerge(
        "about-reveal container-section bg-(--color-natural-100)",
        className,
      )}
      {...rest}
    >
      <div className="mx-auto flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="order-2 mx-auto w-full max-w-110 sm:max-w-130 lg:order-1 lg:max-w-160">
          <Arch />
        </div>

        <div className="order-1 flex flex-col gap-8 lg:order-2 lg:flex-1 lg:items-end lg:text-right">
          <div
            className="animate-fade-in-up flex justify-center lg:justify-end"
            style={delay(0)}
          >
            <TitleImage
              src="/about/title.webp"
              alt="Дорогие наши друзья и родные!"
              intrinsic={[2908, 1199]}
              width="clamp(322px,57vw,730px)"
              sizes="(min-width: 1024px) 730px, 57vw"
              priority
            />
          </div>

          <div
            className="flex max-w-prose flex-col gap-6 animate-fade-in-up"
            style={delay(0.2)}
          >
            <Typography variant="body-1" className="text-(--color-primary-900)">
              Один день в этом году будет для нас особенным, и мы хотим провести
              его в кругу близких и друзей.
            </Typography>
            <Typography variant="body-1" className="text-(--color-primary-900)">
              С огромной радостью приглашаем Вас на главное событие в нашей
              жизни - нашу свадьбу!
            </Typography>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

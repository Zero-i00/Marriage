import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { TitleImage } from "@/shared/components/elements/title-image";
import { AnimatedSection } from "@/shared/components/layout/animated-section";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import { HALL_ADDRESS, HALL_NAME } from "@/shared/constants/seo.constant";
import { delay } from "@/shared/lib/section-animation";

const YANDEX_MAPS_URL = `https://yandex.ru/maps/?rtext=~${encodeURIComponent(
  HALL_ADDRESS,
)}&rtt=auto`;

export function PlaceSection({
  id = ROOT_SECTION.PLACE,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <AnimatedSection
      id={id}
      className={twMerge(
        "container-section flex flex-col gap-10 bg-natural-100",
        className,
      )}
      {...rest}
    >
      <div
        className="animate-fade-in-up flex w-full justify-end"
        style={delay(0.1)}
      >
        <Typography variant="h2" as="h2" className="sr-only">
          Место проведения
        </Typography>
        <TitleImage
          src="/place/title.webp"
          alt="Место проведения"
          intrinsic={[2700, 800]}
          width="clamp(293px,100%,677px)"
        />
      </div>

      <Typography
        variant="body-1"
        as="address"
        className="animate-fade-in-up flex flex-col gap-4 not-italic"
        style={delay(0.3)}
      >
        <Typography variant="overline" className="text-gray-600">
          Банкетный зал
        </Typography>
        <Typography variant="h3" className="text-primary-900">
          {HALL_NAME}
        </Typography>
        <Typography variant="body-1" className="max-w-md text-gray-700">
          По адресу: {HALL_ADDRESS}
        </Typography>
        <a
          href={YANDEX_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-primary-900 underline underline-offset-4"
        >
          Посмотреть на карте
        </a>
      </Typography>
    </AnimatedSection>
  );
}

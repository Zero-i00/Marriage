import Image from "next/image";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatedSection } from "@/shared/components/animated-section";
import { delay } from "@/shared/lib/section-animation";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";

// FIXME используй в YANDEX_MAPS_URL переменнную ADDRESS, раз создал переменную, а лучше вынести это в seo.constant.ts
const HALL_NAME = "Elka Event Hall";
const ADDRESS =
  "Свердловская обл., пос. Хрустальная, ул. Трактовая, д.31 (ориентир)";

// ponytail: маршрут строим от текущего местоположения пользователя (`~`) до
// адреса площадки, режим по умолчанию — авто; переключение на такси доступно
// прямо в виджете Яндекс.Карт, отдельный параметр под него не нужен.
const YANDEX_MAPS_URL = `https://yandex.ru/maps/?rtext=~${encodeURIComponent(
  "Свердловская область, посёлок Хрустальная, улица Трактовая, 31",
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
          //   FIXME вместо px и py используй container миксины, описанные в global.css
          //   FIXME если пишешь адаптив, то выноси его отдельной строчкой, например 1 строка в twMerge функции под desktop, потом запятая, новая строчка под sm
        "flex flex-col gap-10 bg-(--color-natural-100) px-6 py-20 md:grid md:grid-cols-2 md:items-start md:gap-8 md:px-24 md:py-32",
        className,
      )}
      {...rest}
    >
      {/* FIXME неверно оформлена семантика, например, нужно, чтобы у Typograhy был as="address" */}
      <div
        className="animate-fade-in-up flex flex-col gap-4 md:order-1 md:pt-2"
        style={delay(0.1)}
      >
        <Typography variant="overline" className="text-gray-600">
          Банкетный зал
        </Typography>
        <Typography variant="h3" className="text-(--color-primary-900)">
          {HALL_NAME}
        </Typography>
        <Typography
          variant="body-1"
          className="max-w-md text-gray-700"
        >
          По адресу: {ADDRESS}
        </Typography>
        <a
          href={YANDEX_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-(--color-primary-900) underline underline-offset-4"
        >
          Посмотреть на карте
        </a>
      </div>

      <div
        className="animate-fade-in-up flex justify-center md:order-2 md:justify-end"
        style={delay(0.3)}
      >
        <h2 className="sr-only">Место проведения</h2>
        {/* intrinsic 2700x800, capH≈295 → ширина = intrinsicW*74/295, единый кегль со всеми title */}
        {/* FIXME мне не нравятся конкретные числа width и height, как мы будем с ними адатировать под мобилки все эти картинки?*/}
        <Image
          src="/place/title.webp"
          alt="Место проведения"
          width={2700}
          height={800}
          className="h-auto w-[clamp(293px,53vw,677px)]"
        />
      </div>
    </AnimatedSection>
  );
}

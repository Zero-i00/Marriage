import Image from "next/image";
import type { ComponentProps, CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";

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
    <section
      id={id}
      className={twMerge(
        "flex flex-col gap-10 bg-[var(--color-natural-100)] px-6 py-20 md:grid md:grid-cols-2 md:items-start md:gap-8 md:px-24 md:py-32",
        className,
      )}
      {...rest}
    >
      <div
        className="animate-fade-in-up flex flex-col gap-4 md:order-1 md:pt-2"
        style={{ "--delay": "0.1s" } as CSSProperties}
      >
        <Typography variant="overline" className="text-[var(--color-gray-600)]">
          Банкетный зал
        </Typography>
        <Typography variant="h3" className="text-[var(--color-primary-900)]">
          {HALL_NAME}
        </Typography>
        <Typography
          variant="body-1"
          className="max-w-md text-[var(--color-gray-700)]"
        >
          По адресу: {ADDRESS}
        </Typography>
        <a
          href={YANDEX_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-[var(--color-primary-900)] underline underline-offset-4"
        >
          Посмотреть на карте
        </a>
      </div>

      <div
        className="animate-fade-in-up flex justify-center md:order-2 md:justify-end"
        style={{ "--delay": "0.3s" } as CSSProperties}
      >
        <h2 className="sr-only">Место проведения</h2>
        <Image
          src="/place/title.webp"
          alt="Место проведения"
          width={640}
          height={220}
          className="h-auto w-full max-w-xl"
        />
      </div>
    </section>
  );
}

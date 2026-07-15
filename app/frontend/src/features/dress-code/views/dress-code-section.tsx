import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { ColorBadge } from "@/features/dress-code/components/color-badge";
import { TitleImage } from "@/shared/components/elements/title-image";
import { AnimatedSection } from "@/shared/components/layout/animated-section";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import { delay } from "@/shared/lib/section-animation";

const LADIES: Record<string, string> = {
  "#cfe1dd": "Мятный",
  "#d79aa6": "Персиковый",
  "#f7e0dd": "Пудровый",
  "#d9e8e4": "Аквамарин",
  "#d8cebf": "Бежевый",
  "#e9d4d3": "Пыльная роза",
  "#f1cabb": "Коралловый",
  "#b1aeb6": "Серо-лиловый",
  "#cecddb": "Барвинок",
  "#e6d5e7": "Сиреневый",
  "#caa9db": "Лавандовый",
};

const GENTLEMEN: Record<string, string> = {
  "#343330": "Графитовый",
  "#6b452c": "Шоколадный",
  "#4f6a49": "Хвойный",
  "#ececed": "Белый",
  "#9b9b9b": "Серый",
};

const STAGGER = 0.08;
const GENT_BASE = 0.3 + Object.keys(LADIES).length * STAGGER;

export function DressCodeSection({
  id = ROOT_SECTION.DRESS_CODE,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <AnimatedSection
      id={id}
      className={twMerge("container-section flex flex-col gap-12", className)}
      {...rest}
    >
      <div className="flex justify-end">
        <Typography variant="h2" as="h2" className="sr-only">
          Дресс-код
        </Typography>
        <TitleImage
          src="/dress-code/title.webp"
          alt="Дресс-код"
          intrinsic={[1600, 380]}
          width="clamp(280px,52vw,560px)"
        />
      </div>

      {/* Блок «Леди» */}
      <div className="flex flex-col gap-5">
        <Typography
          variant="h2"
          as="h2"
          className="animate-fade-in-up text-primary-900 text-3xl! sm:text-5xl!"
          style={delay(0.1)}
        >
          Леди,
        </Typography>
        <Typography
          variant="subtitle-1"
          className="animate-fade-in-up text-primary-500"
          style={delay(0.2)}
        >
          Мы будем рады видеть вас в вечерних платьях пастельных оттенков
        </Typography>
        <ul className="flex flex-wrap gap-4 sm:gap-5">
          {Object.entries(LADIES).map(([hex, label], index) => (
            <li
              key={hex}
              className="animate-fade-in-up"
              style={delay(0.3 + index * STAGGER)}
            >
              <ColorBadge hex={hex} label={label} />
            </li>
          ))}
        </ul>
      </div>

      {/* Блок «Джентельмены» */}
      <div className="flex flex-col gap-5">
        <Typography
          variant="h2"
          as="h2"
          className="animate-fade-in-up text-primary-900 text-3xl! sm:text-5xl!"
          style={delay(GENT_BASE - 0.2)}
        >
          Джентельмены,
        </Typography>
        <Typography
          variant="subtitle-1"
          className="animate-fade-in-up text-primary-500"
          style={delay(GENT_BASE - 0.1)}
        >
          просим вас соблюдать дресс-код: белая рубашка, костюм
        </Typography>
        <ul className="flex flex-wrap gap-4 sm:gap-5">
          {Object.entries(GENTLEMEN).map(([hex, label], index) => (
            <li
              key={hex}
              className="animate-fade-in-up"
              style={delay(GENT_BASE + index * STAGGER)}
            >
              <ColorBadge hex={hex} label={label} />
            </li>
          ))}
        </ul>
      </div>
    </AnimatedSection>
  );
}

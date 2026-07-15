import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { TitleImage } from "@/shared/components/elements/title-image";
import { AnimatedSection } from "@/shared/components/layout/animated-section";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import { delay } from "@/shared/lib/section-animation";

/**
 * Дресс-код: два блока (Леди / Джентльмены), у каждого заголовок, подпись и ряд
 * кружков-цветов. Цвета живут ЗДЕСЬ, а не в styles/tokens — они относятся только к
 * этой секции. Кружки проявляются по очереди (`animate-fade-in-up` + нарастающий
 * `--delay`), когда долистали до секции.
 */

// Пастель для «Леди» (11) — пипетка с макета.
const LADIES = [
  "#cfe1dd",
  "#d79aa6",
  "#f7e0dd",
  "#d9e8e4",
  "#d8cebf",
  "#e9d4d3",
  "#f1cabb",
  "#b1aeb6",
  "#cecddb",
  "#e6d5e7",
  "#caa9db",
] as const;

// Тёмная гамма для «Джентльменов» (5).
const GENTLEMEN = [
  "#343330",
  "#6b452c",
  "#4f6a49",
  "#ececed",
  "#9b9b9b",
] as const;

const STAGGER = 0.08;

function Group({
  title,
  description,
  colors,
  startDelay,
}: {
  title: string;
  description: string;
  colors: readonly string[];
  startDelay: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Typography
        variant="h2"
        as="h2"
        className="animate-fade-in-up text-primary-900 text-3xl! sm:text-5xl!"
        style={delay(startDelay - 0.2)}
      >
        {title}
      </Typography>
      <Typography
        variant="subtitle-1"
        className="animate-fade-in-up text-primary-500"
        style={delay(startDelay - 0.1)}
      >
        {description}
      </Typography>
      <ul className="flex flex-wrap gap-4 sm:gap-5">
        {colors.map((color, index) => (
          <li
            key={color}
            className="animate-fade-in-up"
            style={delay(startDelay + index * STAGGER)}
          >
            <span
              className="block size-14 rounded-full ring-1 ring-primary-opacity-light sm:size-20"
              style={{ backgroundColor: color }}
              aria-hidden
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

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
        {/* title.webp кладёт заказчик в public/dress-code/. intrinsic — реальные px картинки. */}
        <TitleImage
          src="/dress-code/title.webp"
          alt="Дресс-код"
          intrinsic={[1600, 380]}
          width="clamp(280px,52vw,560px)"
        />
      </div>

      <Group
        title="Леди,"
        description="Мы будем рады видеть вас в вечерних платьях пастельных оттенков"
        colors={LADIES}
        startDelay={0.3}
      />

      <Group
        title="Джентельмены,"
        description="просим вас соблюдать дресс-код: белая рубашка, костюм"
        colors={GENTLEMEN}
        startDelay={0.3 + LADIES.length * STAGGER}
      />
    </AnimatedSection>
  );
}

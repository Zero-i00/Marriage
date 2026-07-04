import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatedSection } from "@/shared/components/layout/animated-section";
import { TitleImage } from "@/shared/components/elements/title-image";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import { delay } from "@/shared/lib/section-animation";

// Каждая картинка уже содержит линию-коннектор, иконку, время и подпись целиком.
const TIMELINE = [
  {
    src: "/plan/time/15-00.webp",
    alt: "15:00 — Сбор гостей",
    intrinsic: [2567, 502],
  },
  {
    src: "/plan/time/15-30.webp",
    alt: "15:30 — Фуршет",
    intrinsic: [2567, 568],
  },
  {
    src: "/plan/time/16-00.webp",
    alt: "16:00 — Выездная церемония",
    intrinsic: [2845, 443],
  },
  {
    src: "/plan/time/17-00.webp",
    alt: "17:00 — Банкет",
    intrinsic: [2565, 471],
  },
  {
    src: "/plan/time/22-00.webp",
    alt: "22:00 — Дискотека",
    intrinsic: [2566, 518],
  },
  {
    src: "/plan/time/23-00.webp",
    alt: "23:00 — Завершение вечера",
    intrinsic: [2768, 455],
  },
] as const;

export function PlanSection({
  id = ROOT_SECTION.PLAN,
  className,
  ...rest
}: ComponentProps<"section">) {
  const mid = Math.ceil(TIMELINE.length / 2);
  const left = TIMELINE.slice(0, mid);
  const right = TIMELINE.slice(mid);

  return (
    <AnimatedSection
      id={id}
      className={twMerge(
        "container-section flex flex-col gap-10 bg-[var(--color-natural-100)]",
        className,
      )}
      {...rest}
    >
      <div className="animate-fade-in-up flex justify-end" style={delay(0)}>
        <Typography variant="h2" as="h2" className="sr-only">
          План дня
        </Typography>
        <TitleImage
          src="/plan/title.webp"
          alt="План дня"
          intrinsic={[1200, 880]}
          width="clamp(115px,21vw,265px)"
        />
      </div>

      <div className="grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2">
        <ul className="flex flex-col gap-8">
          {left.map((item, index) => (
            <li
              key={item.src}
              className="animate-fade-in-up"
              style={delay(0.1 + index * 0.15)}
            >
              <TitleImage
                src={item.src}
                alt={item.alt}
                intrinsic={item.intrinsic}
                width="100%"
              />
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-8">
          {right.map((item, index) => (
            <li
              key={item.src}
              className="animate-fade-in-up"
              style={delay(0.1 + index * 0.15)}
            >
              <TitleImage
                src={item.src}
                alt={item.alt}
                intrinsic={item.intrinsic}
                width="100%"
              />
            </li>
          ))}
        </ul>
      </div>
    </AnimatedSection>
  );
}

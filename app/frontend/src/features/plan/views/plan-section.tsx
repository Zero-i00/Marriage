import Image from "next/image";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatedSection } from "@/shared/components/animated-section";
import { delay } from "@/shared/lib/section-animation";
import { ROOT_SECTION } from "@/shared/configs/section.config";

// Каждая картинка уже содержит линию-коннектор, иконку, время и подпись целиком.
const TIMELINE = [
  {
    src: "/plan/time/15-00.webp",
    alt: "15:00 — Сбор гостей",
    width: 2567,
    height: 502,
  },
  {
    src: "/plan/time/15-30.webp",
    alt: "15:30 — Фуршет",
    width: 2567,
    height: 568,
  },
  {
    src: "/plan/time/16-00.webp",
    alt: "16:00 — Выездная церемония",
    width: 2845,
    height: 443,
  },
  {
    src: "/plan/time/17-00.webp",
    alt: "17:00 — Банкет",
    width: 2565,
    height: 471,
  },
  {
    src: "/plan/time/22-00.webp",
    alt: "22:00 — Дискотека",
    width: 2566,
    height: 518,
  },
  {
    src: "/plan/time/23-00.webp",
    alt: "23:00 — Завершение вечера",
    width: 2768,
    height: 455,
  },
] as const;

export function PlanSection({
  id = ROOT_SECTION.PLAN,
  className,
  ...rest
}: ComponentProps<"section">) {
  // FIXME А если завтра добавим ещё таймлайнов, а ну как нормально дели через length массив
  const left = TIMELINE.slice(0, 3);
  const right = TIMELINE.slice(3);

  return (
    <AnimatedSection
      id={id}
      className={twMerge(
          //   FIXME вместо px и py используй container миксины, описанные в global.css
          //   FIXME если пишешь адаптив, то выноси его отдельной строчкой, например 1 строка в twMerge функции под desktop, потом запятая, новая строчка под sm
        "flex flex-col gap-10 bg-[var(--color-natural-100)] px-6 py-20 md:px-24 md:py-32",
        className,
      )}
      {...rest}
    >
      <div className="animate-fade-in-up flex justify-end" style={delay(0)}>
        {/* FIXME Всегда везде во всех компонентах и секциях нужно использовать для отображения текста только компонент Typography: h1, ..., span, p, address, и так длжее*/}
        <h2 className="sr-only">План дня</h2>
        {/* intrinsic 1200x880, capH≈335 → ширина = intrinsicW*74/335, единый кегль со всеми title */}
        {/* FIXME мне не нравятся конкретные числа width и height, как мы будем с ними адатировать под мобилки все эти картинки?*/}
        <Image
          src="/plan/title.webp"
          alt="План дня"
          width={1200}
          height={880}
          className="h-auto w-[clamp(115px,21vw,265px)]"
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
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="h-auto w-full"
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
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="h-auto w-full"
              />
            </li>
          ))}
        </ul>
      </div>
    </AnimatedSection>
  );
}

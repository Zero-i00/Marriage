import Image from "next/image";
import type { ComponentProps, CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import { ROOT_SECTION } from "@/shared/configs/section.config";

/** Стиль с CSS-переменной `--delay`, которую читает `.animate-*` из styles/animations.css. */
type DelayStyle = CSSProperties & { "--delay"?: string };

function delay(seconds: number): DelayStyle {
  return { "--delay": `${seconds}s` };
}

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
  const left = TIMELINE.slice(0, 3);
  const right = TIMELINE.slice(3);

  return (
    <section
      id={id}
      className={twMerge(
        "flex flex-col gap-10 bg-[var(--color-natural-100)] px-6 py-20 md:px-24 md:py-32",
        className,
      )}
      {...rest}
    >
      <div className="animate-fade-in-up flex justify-end" style={delay(0)}>
        <h2 className="sr-only">План дня</h2>
        <Image
          src="/plan/title.webp"
          alt="План дня"
          width={480}
          height={352}
          className="h-auto w-full max-w-xs md:max-w-sm"
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
    </section>
  );
}

import Image from "next/image";
import type { ComponentProps, CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import { Arch } from "@/features/about/components/arch";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import "./about-section.css";

/** Стиль с CSS-переменной `--delay`, которую читает `.animate-*` из styles/animations.css. */
type DelayStyle = CSSProperties & { "--delay"?: string };

export function AboutSection({
  id = ROOT_SECTION.ABOUT,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <section
      id={id}
      className={twMerge(
        "about-reveal bg-[var(--color-natural-100)] px-6 py-16 md:px-16 lg:px-24 lg:py-32",
        className,
      )}
      {...rest}
    >
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 mx-auto w-full max-w-[440px] sm:max-w-[520px] lg:order-1 lg:max-w-[640px]">
          <Arch />
        </div>

        <div className="order-1 flex flex-col gap-8 lg:order-2 lg:items-end lg:text-right">
          <div
            className="relative aspect-[3/1] w-full max-w-[560px] animate-fade-in-up"
            style={{ "--delay": "0s" } as DelayStyle}
          >
            <Image
              src="/about/title.webp"
              alt="Дорогие наши друзья и родные!"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-contain lg:object-right"
              priority
            />
          </div>

          <div
            className="flex max-w-prose flex-col gap-6 animate-fade-in-up"
            style={{ "--delay": "0.2s" } as DelayStyle}
          >
            <Typography
              variant="body-1"
              className="text-[var(--color-primary-900)]"
            >
              Один день в этом году будет для нас особенным, и мы хотим провести
              его в кругу близких и друзей.
            </Typography>
            <Typography
              variant="body-1"
              className="text-[var(--color-primary-900)]"
            >
              С огромной радостью приглашаем Вас на главное событие в нашей
              жизни - нашу свадьбу!
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}

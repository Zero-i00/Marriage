import Image from "next/image";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { Arch } from "@/features/about/components/arch";
import { AnimatedSection } from "@/shared/components/animated-section";
import { delay } from "@/shared/lib/section-animation";
import { Typography } from "@/shared/components/ui/typography";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import "./about-section.css";

export function AboutSection({
  id = ROOT_SECTION.ABOUT,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <AnimatedSection
      id={id}
      //   FIXME вместо px и py используй container миксины, описанные в global.css
      //   FIXME если пишешь адаптив, то выноси его отдельной строчкой, например 1 строка в twMerge функции под desktop, потом запятая, новая строчка под sm
      className={twMerge(
        "about-reveal bg-(--color-natural-100) px-6 py-16 md:px-16 lg:px-24 lg:py-32",
        className,
      )}
      {...rest}
    >
      {/* FIXME мы не задаём конкретные размеры никогда max-w-400 - вместо этого используем container и flex */}
      <div className="mx-auto grid max-w-400 grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 mx-auto w-full max-w-110 sm:max-w-130 lg:order-1 lg:max-w-160">
          <Arch />
        </div>

        <div className="order-1 flex flex-col gap-8 lg:order-2 lg:items-end lg:text-right">
          <div
            className="animate-fade-in-up flex justify-center lg:justify-end"
            style={delay(0)}
          >
            {/* intrinsic 2908x1199, capH≈295 → ширина = intrinsicW*74/295, единый кегль со всеми title */}
            {/* FIXME мне не нравятся конкретные числа width и height, как мы будем с ними адатировать под мобилки все эти картинки?*/}
            <Image
              src="/about/title.webp"
              alt="Дорогие наши друзья и родные!"
              width={2908}
              height={1199}
              sizes="(min-width: 1024px) 730px, 57vw"
              className="h-auto w-[clamp(322px,57vw,730px)]"
              priority
            />
          </div>

          <div
            className="flex max-w-prose flex-col gap-6 animate-fade-in-up"
            style={delay(0.2)}
          >
            <Typography
              variant="body-1"
              className="text-(--color-primary-900)"
            >
              Один день в этом году будет для нас особенным, и мы хотим провести
              его в кругу близких и друзей.
            </Typography>
            <Typography
              variant="body-1"
              className="text-(--color-primary-900)"
            >
              С огромной радостью приглашаем Вас на главное событие в нашей
              жизни - нашу свадьбу!
            </Typography>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

"use client";

import Cookies from "js-cookie";
import Image from "next/image";
import { type ComponentProps, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { InvitationForm } from "@/features/invitation/components/forms/invitation-form";
import { AnimatedSection } from "@/shared/components/animated-section";
import { delay } from "@/shared/lib/section-animation";
import { ROOT_SECTION } from "@/shared/configs/section.config";
import { COOKIE_INVITATION_PASSED } from "@/shared/constants/cookie.constant";

export function InvitationSection({
  id = ROOT_SECTION.INVITATION,
  className,
  ...rest
}: ComponentProps<"section">) {
  // FIXME Бред какой-то, неужели без useEffect на не можем inline в переменной получить куку, чтобы отрисовать состояние компонента. ПО хорошему нужно избавиться от useEffect и useState
  // ponytail: гость мог уже отправить анкету — прячем секцию по cookie вместо
  // похода на бэк за статусом; читаем на клиенте, секция ниже фолда, мигания нет
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    setIsPassed(Cookies.get(COOKIE_INVITATION_PASSED) === "true");
  }, []);

  if (isPassed) return null;

  return (
    <AnimatedSection
      id={id}
      className={twMerge(
          //   FIXME вместо px и py используй container миксины, описанные в global.css
          //   FIXME если пишешь адаптив, то выноси его отдельной строчкой, например 1 строка в twMerge функции под desktop, потом запятая, новая строчка под sm
        "relative flex flex-col gap-10 overflow-hidden bg-[var(--color-natural-100)] px-6 py-20 md:px-24 md:py-32",
        className,
      )}
      {...rest}
    >
      {/* ponytail: декоративный росчерк — точные координаты из макета недоступны
          (нет доступа к Figma-файлу), позиционируем приближённо по пропорциям */}
      <svg
        className="pointer-events-none absolute left-0 top-[22%] h-[70%] w-auto max-[900px]:hidden"
        viewBox="0 0 352 1203"
        fill="none"
        preserveAspectRatio="xMinYMin meet"
        aria-hidden="true"
      >
        <path
          className="animate-draw"
          style={delay(0.3)}
          d="M-108.694 0.876953C-50.0073 82.3015 52.0584 229.421 155.395 240.9C284.567 255.248 372.858 184.392 344.777 133.022C295.708 43.2552 -26.0191 308.389 39.6768 667.626C105.373 1026.86 353.917 845.679 315.129 786.309C251.131 688.352 196.537 1242.8 -110 1198.33"
          stroke="var(--color-primary-900)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          pathLength="1"
        />
      </svg>

      <div className="flex justify-center md:justify-end">
        <h2 className="sr-only">Анкета гостя</h2>
        {/* intrinsic 1688x320, capH=320 → ширина = intrinsicW*74/320, единый кегль со всеми title */}
        {/* FIXME мне не нравятся конкретные числа width и height, как мы будем с ними адатировать под мобилки все эти картинки?*/}
        <Image
          src="/invitation/title.webp"
          alt="Анкета"
          width={1688}
          height={320}
          priority
          className="animate-fade-in-up h-auto w-[clamp(169px,30vw,390px)]"
        />
      </div>

      <div className="flex justify-center">
        <InvitationForm onSubmitted={() => setIsPassed(true)} />
      </div>
    </AnimatedSection>
  );
}

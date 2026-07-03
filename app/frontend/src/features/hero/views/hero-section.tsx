import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { HOME_SECTION } from "@/shared/configs/section.config";

export function HeroSection({
  id = HOME_SECTION.HERO,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <section id={id} className={twMerge(``, className)} {...rest}></section>
  );
}

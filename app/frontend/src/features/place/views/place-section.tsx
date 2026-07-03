import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { ROOT_SECTION } from "@/shared/configs/section.config";

export function PlaceSection({
  id = ROOT_SECTION.PLACE,
  className,
  ...rest
}: ComponentProps<"section">) {
  return (
    <section id={id} className={twMerge(``, className)} {...rest}></section>
  );
}

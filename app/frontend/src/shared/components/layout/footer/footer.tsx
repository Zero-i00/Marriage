import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { ROOT_SECTION } from "@/shared/configs/section.config";

export function Footer({
  id = ROOT_SECTION.FOOTER,
  className,
  ...rest
}: ComponentProps<"footer">) {
  return <footer id={id} className={twMerge(``, className)} {...rest}></footer>;
}

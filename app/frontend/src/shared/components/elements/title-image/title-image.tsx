import Image from "next/image";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends Omit<ComponentProps<typeof Image>, "width" | "height"> {
  width: string;
  intrinsic: readonly [number, number];

}

/**
 * Title-картинка секции: адаптивная ширина через CSS `width` (clamp),
 * intrinsic-размеры уходят в next/image только ради пропорций.
 */
export function TitleImage({
  intrinsic,
  width,
  className,
  style,
  ...rest
}: Props) {
  const [intrinsicWidth, intrinsicHeight] = intrinsic;

  return (
    <Image
      width={intrinsicWidth}
      height={intrinsicHeight}
      className={twMerge("h-auto", className)}
      style={{ width, ...style }}
      {...rest}
    />
  );
}

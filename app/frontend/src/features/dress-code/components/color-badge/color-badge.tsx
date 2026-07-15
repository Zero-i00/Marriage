"use client";

import type { ComponentProps } from "react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { copyToClipboard } from "@/shared/utils/keyboard/copy-to-clipboard";

interface Props extends ComponentProps<"button"> {
  hex: string;
  label: string;
}

export function ColorBadge({ hex, label, className, ...rest }: Props) {
  const handleCopyColor = () => {
    copyToClipboard(hex)
      .then(() =>
        toast.success(`Скопирован ${label} цвет`, {
          iconTheme: {
            primary: hex,
            secondary: "white",
          },
        }),
      )
      .catch(() => toast.error("Не удалось скопировать"));
  };

  return (
    <button
      type="button"
      onClick={handleCopyColor}
      aria-label={`Скопировать ${label}`}
      className={twMerge(
        "block size-14 cursor-pointer rounded-full ring-1 ring-primary-opacity-light transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary-500 sm:size-20",
        className,
      )}
      style={{ backgroundColor: hex }}
      {...rest}
    />
  );
}

import type { ComponentProps } from "react";
import type { TypeIconSize } from "@/app/styles/types/size.type";

type ButtonVariant = "default" | "icon";

export interface ButtonProps extends ComponentProps<"button"> {
  /**
   * Состояние загрузки
   *
   * @remarks
   * Когда включено, кнопка становится неактивной и может отображать индикатор загрузки
   *
   * @default false
   */
  isLoading?: boolean;

  /**
   * Вариант стиля кнопки
   *
   * @remarks
   * Определяет визуальное оформление кнопки (заливка, контур, текст и т.д.)
   *
   * @default 'default'
   */
  variant?: ButtonVariant;

  /**
   * Размер кнопки
   *
   * @remarks
   * Определяет размер кнопки из предопределенного набора значений
   *
   * @default 'md'
   */
  size?: TypeIconSize;
}
